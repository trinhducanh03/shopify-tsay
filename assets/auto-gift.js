
// @ts-nocheck

const GIFT_VARIANT_ID = 42128196239431;
const GIFT_THRESHOLD = 50000;

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
// BẮT MỌI AJAX CART (ngắn gọn)
(function () {
    const RE = /\/cart\/(add|update|change|clear)(?:\.js)?(?:\?|$)/i;
    const isMut = (url, method = 'GET') => RE.test(String(url)) && /POST|PUT|PATCH|DELETE/i.test(method);

    let t; const bump = () => { clearTimeout(t); t = setTimeout(() => checkGift(), 80); };

    // Hook fetch
    const _fetch = window.fetch;
    window.fetch = function (i, init) {
        const url = i instanceof Request ? i.url : String(i || '');
        const method = (i instanceof Request ? i.method : (init && init.method)) || 'GET';
        const mutated = isMut(url, method);
        return _fetch.apply(this, arguments).then(res => { if (mutated && res.ok) bump(); return res; });
    };

    // Hook XHR
    const XO = XMLHttpRequest.prototype.open;
    const XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__mut = isMut(u, m); return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
        if (this.__mut) this.addEventListener('load', () => { if (this.status >= 200 && this.status < 300) bump(); });
        return XS.apply(this, arguments);
    };
})();

// Theo dõi khi người dùng thay đổi giỏ
document.addEventListener('click', function (e) {
    const target = e.target;

    // --- 1. Bắt nút Add to Cart ---
    if (target.closest('form[action*="/cart/add"], button[name="plus"], button[name="minus"])')) {
        console.log('[CART] Submit Add to Cart form');
        checkGift(); // Gọi hàm của bạn
    }
});
