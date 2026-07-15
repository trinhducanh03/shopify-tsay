document.addEventListener('DOMContentLoaded', async() => {
    console.log('Auto gift settings:', window.autoGiftSettings);
    
    await checkGiftThreshold();

    subscribe(PUB_SUB_EVENTS.cartUpdate, async() => { 
        await checkGiftThreshold();
    });
});

const { giftVariantId, threshold } = window.autoGiftSettings;
let isUpdatingGift = false;

// Get infor cart
async function getCart() {
    const response = await fetch('/cart.js');

    if (!response.ok) {
        throw new Error('Cannot get cart');
    }

    return await response.json();
}

// Check if the gift is in cart.
function hasGift(cart) {
    return cart.items.some(item => item.variant_id === giftVariantId);
}

// Add Gift
async function addGift() {
    await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: giftVariantId,
            quantity: 1
        })
    });
}

// Remove gift 
async function removeGift() {
    await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: giftVariantId,
            quantity: 0
        })
    });
}

async function checkGiftThreshold(){
      
    if(isUpdatingGift) return;

    isUpdatingGift = true;
    const cart = await getCart();
    
    if(cart.total_price >= threshold){
        if(!hasGift(cart)){
            await addGift();
        }
    }else{
        if(hasGift(cart)){
            await removeGift();
        }
    }
    isUpdatingGift = false;
}