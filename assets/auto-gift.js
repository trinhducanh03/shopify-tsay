
// // @ts-nocheck

// const GIFT_VARIANT_ID = 42128196239431;
// const GIFT_THRESHOLD = 50000;

// async function getCart() {
//     await new Promise(r => setTimeout(r, 400));
//     const inforCart = await fetch('/cart.js');
//     return inforCart.json();
// }


// async function addCart() {
//     await fetch('/cart/add.js', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 })
//     });
// }

// async function removeGift(linekey) {
//     await fetch('/cart/change.js', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: linekey, quantity: 0 })
//     });
// }

// async function checkGift() {
//     const cart = await getCart();
//     const totalPrice = cart.original_total_price;
//     const hasGift = cart.items.find(item => item.variant_id === GIFT_VARIANT_ID);

//     if (totalPrice >= GIFT_THRESHOLD && !hasGift) {
//         await addCart();
//     } else if (totalPrice < GIFT_THRESHOLD && hasGift) {
//         await removeGift(hasGift.key);
//     }
// }

// checkGift();

// // Theo dõi khi người dùng thay đổi giỏ
// document.addEventListener('click', function (e) {
//     const target = e.target;

//     // --- 1. Bắt nút Add to Cart ---
//     if (target.closest('form[action*="/cart/add"], button[name="plus"], button[name="minus"], button[name="add"]')) {
//         console.log('[CART] Submit Add to Cart form');
//         checkGift(); // Gọi hàm của bạn
//     }
// });
// @ts-nocheck
const GIFT_VARIANT_ID = 42128196239431;
const GIFT_THRESHOLD = 50000; // cents

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getCart() {
    // chờ nhịp nhỏ để backend commit change
    await sleep(150);
    const res = await fetch(`/cart.js?_=${Date.now()}`, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
    });
    return res.json();
}

let ignoreCheck = false; // chống loop khi chính mình gọi API

async function addGift() {
    ignoreCheck = true;
    await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 })
    });
    ignoreCheck = false;
}

async function removeGift(lineKey) {
    ignoreCheck = true;
    await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: lineKey, quantity: 0 })
    });
    ignoreCheck = false;
}

// subtotal KHÔNG tính quà
function subtotalExGift(cart) {
    return (cart.items || []).reduce((sum, it) => {
        if (it.variant_id === GIFT_VARIANT_ID) return sum;
        const line = (it.final_line_price ?? it.line_price ?? (it.price * it.quantity)) || 0;
        return sum + line;
    }, 0);
}

async function checkGift() {
    try {
        const cart = await getCart();
        const gift = (cart.items || []).find(i => i.variant_id === GIFT_VARIANT_ID);
        const sub = subtotalExGift(cart);

        if (sub >= GIFT_THRESHOLD && !gift) {
            await addGift();
        } else if (sub < GIFT_THRESHOLD && gift) {
            await removeGift(gift.key);
        }
    } catch (e) {
        console.warn('[gift] checkGift error:', e);
    }
}

// Bắt MỌI AJAX cart (add/update/change/clear) rồi mới gọi checkGift()
(function () {
    const RE = /\/cart\/(add|update|change|clear)(?:\.js)?(?:\?|$)/i;
    const isMut = (url, m = 'GET') => RE.test(String(url)) && /POST|PUT|PATCH|DELETE/i.test(m);
    let t;
    const bump = () => {
        if (ignoreCheck) return;
        clearTimeout(t);
        t = setTimeout(checkGift, 200); // debounce đủ lâu sau mutation
    };

    // hook fetch
    const _fetch = window.fetch;
    window.fetch = function (input, init) {
        const url = input instanceof Request ? input.url : String(input || '');
        const m = (input instanceof Request ? input.method : init?.method) || 'GET';
        const mut = isMut(url, m);
        return _fetch.apply(this, arguments).then(r => { if (mut && r.ok) bump(); return r; });
    };

    // hook XHR
    const XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__mut = isMut(u, m); return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
        if (this.__mut) this.addEventListener('load', () => { if (this.status >= 200 && this.status < 300) bump(); });
        return XS.apply(this, arguments);
    };
})();

// chạy lúc load
checkGift();
