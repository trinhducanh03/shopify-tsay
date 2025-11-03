// @ts-nocheck

document.addEventListener('DOMContentLoaded', function () {

    // Lấy phần tử checkbox và nút checkout
    const agreeCheckbox = document.querySelector('#agreeCheckbox');
    const checkoutButton = document.querySelector('button.cart__checkout-button');

    // Kiểm tra phần tử tồn tại
    if (!agreeCheckbox && !checkoutButton) {
        return;
    }

    // Disable nút checkout ban đầu
    checkoutButton.disabled = true;

    // Theo dõi sự kiện thay đổi của checkbox
    agreeCheckbox.addEventListener('change', function () {
        checkoutButton.disabled = !this.checked;
    });
});
