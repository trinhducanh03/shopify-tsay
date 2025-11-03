// @ts-nocheck
document.addEventListener('DOMContentLoaded', async function () {
    // Đợi Shopify privacy API sẵn sàng
    if (!window.Shopify || !Shopify.customerPrivacy) {
        console.warn('Shopify Customer Privacy API chưa sẵn sàng');
        return;
    }

    try {
        const regionData = await Shopify.customerPrivacy.getRegion();

        console.log('📍 Thông tin vùng:', regionData);
        // Ví dụ: { country: "US", region: "OR" }

        if (regionData.country === 'US' && regionData.region === 'OR') {
            showOregonPopup();
        }
    } catch (err) {
        console.error('❌ Không thể lấy thông tin vùng:', err);
    }
});

function showOregonPopup() {
    // Tạo popup
    const popup = document.createElement('div');
    popup.className = 'oregon-popup';
    popup.innerHTML = `
      <div class="popup-backdrop"></div>
      <div class="popup-box">
        <h2>Welcome, Oregon visitor!</h2>
        <p>We have a special notice for Oregon residents.</p>
        <button id="closePopup">Close</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Đóng popup
    document.querySelector('#closePopup').addEventListener('click', () => {
        popup.remove();
    });
}
