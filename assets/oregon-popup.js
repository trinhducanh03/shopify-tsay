// @ts-nocheck

window.Shopify.loadFeatures(
    [
        {
            name: 'consent-tracking-api',
            version: '0.1',
        },
    ],
    error => {
        if (error) {
            console.error('Không thể load Customer Privacy API:', error);
            return;
        }
        const region = Shopify.customerPrivacy.getRegion();
        console.log('Region:', region);

        if (region === 'VNSG') {
            showOregonPopup();
        }
    },
);
// Hàm hiển thị popup
function showOregonPopup() {
    const popup = document.createElement('div');
    popup.className = 'oregon-popup';
    popup.innerHTML = `
      <div class="popup-backdrop"></div>
      <div class="popup-box">
        <h2>Welcome, Oregon visitor!</h2>
        <p>This message is only for Oregon residents.</p>
        <button id="closePopup">OK</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('closePopup').addEventListener('click', function () {
        popup.remove();
    });
}