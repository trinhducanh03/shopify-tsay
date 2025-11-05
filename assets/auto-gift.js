
// @ts-nocheck

const GIFT_VARIANT_ID = 42128196239431;
const GIFT_THRESHOLD = 50000;
const RANDOM_SECTION_ID = 'template--17207724015687__message_gift_qU88kW';

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
    const html = await fetch('/?section_id=' + RANDOM_SECTION_ID).then(r => r.text());
    document.querySelector(`[data-section-id="${RANDOM_SECTION_ID}"]`).outerHTML = html;
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