// @ts-nocheck
const GIFT_VARIANT_ID = 42128196239431; // ID quà tặng
const GIFT_THRESHOLD = 50000;           // Ngưỡng giá (đơn vị: cent)

let ignoreCheck = false; // Cờ chống vòng lặp

// ==== Các hàm chính ====

// Lấy thông tin giỏ hàng
async function getCart() {
    const res = await fetch('/cart.js');
    return res.json();
}

// Thêm quà vào giỏ
async function addGift() {
    ignoreCheck = true;
    await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: GIFT_VARIANT_ID, quantity: 1 })
    });
    ignoreCheck = false;
}

// Xoá quà khỏi giỏ
async function removeGift(lineKey) {
    ignoreCheck = true;
    await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lineKey, quantity: 0 })
    });
    ignoreCheck = false;
}

// Kiểm tra điều kiện quà tặng
async function checkGift() {
    try {
        const cart = await getCart();
        const total = cart.original_total_price || 0;
        const giftItem = cart.items.find(item => item.variant_id === GIFT_VARIANT_ID);

        if (total >= GIFT_THRESHOLD && !giftItem) {
            await addGift();
        } else if (total < GIFT_THRESHOLD && giftItem) {
            await removeGift(giftItem.key);
        }
    } catch (err) {
        console.warn('Lỗi checkGift:', err);
    }
}

// ==== Theo dõi mọi AJAX giỏ hàng ====
(function () {
    const REGEX = /\/cart\/(add|update|change|clear)(?:\.js)?/i;
    const isCartAPI = (url, method = 'GET') =>
        REGEX.test(url) && /POST|PUT|PATCH|DELETE/i.test(method);

    let timer;
    const triggerCheck = () => {
        if (ignoreCheck) return;
        clearTimeout(timer);
        timer = setTimeout(checkGift, 100);
    };

    // Hook fetch
    const _fetch = window.fetch;
    window.fetch = function (input, init) {
        const url = input instanceof Request ? input.url : String(input);
        const method = (input instanceof Request ? input.method : init?.method) || 'GET';
        const isCart = isCartAPI(url, method);

        return _fetch.apply(this, arguments).then(res => {
            if (isCart && res.ok) triggerCheck();
            return res;
        });
    };

    // Hook XMLHttpRequest
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._isCart = isCartAPI(url, method);
        return open.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (this._isCart) {
            this.addEventListener('load', () => {
                if (this.status >= 200 && this.status < 300) triggerCheck();
            });
        }
        return send.apply(this, arguments);
    };
})();

// ==== Chạy ngay khi load ====
checkGift();
