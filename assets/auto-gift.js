
// @ts-nocheck

const GIFT_VARIANT_ID = 42128196239431;
const GIFT_THRESHOLD = 50000;

// Danh sách message
const MESSAGES = [
    "Cảm ơn bạn đã mua sắm! Bạn vừa nhận quà tặng đặc biệt.",
    "Bạn thật tuyệt! Đừng quên chia sẻ ưu đãi này nhé.",
    "Quà tặng này chỉ dành riêng cho bạn!",
    "Thêm hàng vào giỏ để nhận thêm bất ngờ nhé!"
];

// Lấy message ngẫu nhiên
function getRandomMessage() {
    const i = Math.floor(Math.random() * MESSAGES.length);
    return MESSAGES[i];
}

// Render message
function renderRandomMessage() {
    const el = document.querySelector('#random-message .message-text');
    if (el) {
        el.textContent = getRandomMessage();
    }
}

async function getCart() {
    await new Promise(r => setTimeout(r, 400));
    const inforCart = await fetch('/cart.js');
    return inforCart.json();
}


async function addCart() {
    await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 })
    });
    renderRandomMessage();
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

document.addEventListener('click', async function (e) {
    const target = e.target;

    if (target.closest('form[action*="/cart/add"], button[name="plus"], button[name="minus"], button[name="add"]')) {
        console.log('[CART] Submit Add to Cart form');

        await new Promise(r => setTimeout(r, 500));

        checkGift();
    }
});
document.addEventListener('DOMContentLoaded', renderRandomMessage);