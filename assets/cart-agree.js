(() => {
  const syncCheckoutButton = () => {
    const checkbox = document.getElementById('cart-agree');
    const checkoutButton = document.getElementById('checkout');

    if (!checkbox || !checkoutButton) return;

    checkoutButton.disabled = !checkbox.checked;
  };

  document.addEventListener('DOMContentLoaded', syncCheckoutButton);

  document.addEventListener('change', (event) => {
    if (event.target?.id === 'cart-agree') {
      syncCheckoutButton();
    }
  });
})();