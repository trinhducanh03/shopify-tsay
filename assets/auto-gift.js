
// @ts-nocheck

const GIFT_VARIANT_ID = 42128196239431; // <-- thay ID quà tặng của bạn
const GIFT_THRESHOLD = 50000;     // <-- ngưỡng giá trị 500k (VND) 

async function getCart() {
    const inforCart = await fetch('/cart.js');
    return inforCart.json();
}

async function addCart() {
    await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 })
    });
}

async function removeGift(linekey) {
    await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linekey, quantity: 0 })
    });
}

async function checkGift() {
    const cart = await getCart();
    const totalPrice = cart.original_total_price;
    const hasGift = cart.items.find(item => item.variant_id === GIFT_VARIANT_ID);

    if (totalPrice >= GIFT_THRESHOLD && !hasGift) {
        await addCart();
    } else if (totalPrice < GIFT_THRESHOLD && hasGift) {
        await removeGift(hasGift.key);
    }
}

checkGift();

// Theo dõi khi người dùng thay đổi giỏ
document.addEventListener('click', function (e) {
    const target = e.target;

    // --- 1. Bắt nút Add to Cart ---
    if (target.closest('form[action*="/cart/add"] [type="submit"], form[action*="/cart/add"] button:not([type])')) {
        console.log('[CART] Submit Add to Cart form');
        checkGift(); // Gọi hàm của bạn
    }

    // --- 2. Bắt nút tăng số lượng ---
    if (target.closest('button[name="plus"]')) {
        console.log('[CART] Click plus');
        checkGift();
    }

    // --- 3. Bắt nút giảm số lượng ---
    if (target.closest('button[name="minus"]')) {
        console.log('[CART] Click minus');
        checkGift();
    }
});
