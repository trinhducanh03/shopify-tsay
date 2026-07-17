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

// Add Gift
async function addGift() {
    const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: giftVariantId,
            quantity: 1
        })
    });
    if (!response.ok) {
        throw new Error('Cannot add gift');
    }
    console.log('Gift added successfully');
    await getRandomMessageSection();
}

// Find line gift
function getGiftLine(cart){
    const giftIndex =   cart.items.findIndex(
        (item) => item.variant_id === giftVariantId
    );
    return giftIndex === -1 ? null : giftIndex + 1;
}

// Remove gift 
async function removeGift(line) {
    const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            line,
            quantity: 0 
        })
    });
    if (!response.ok) {
        throw new Error('Cannot add gift');
    }
}

async function checkGiftThreshold(){
      
    if(isUpdatingGift) return;

    isUpdatingGift = true;

    try{
        const cart = await getCart();
        const giftLine = getGiftLine(cart);
        const giftExists = giftLine !== null;

        if(cart.total_price >= threshold){
            if(!giftExists){
                await addGift();
            }
        }else{
            if(giftExists){
                await removeGift(giftLine);
            }
        }
    }finally{
        isUpdatingGift = false;
    }
}


async function getRandomMessageSection() {
    console.log('Refreshing random message section');
    
    const currentSection = document.querySelector('.random-message');
    if (!currentSection) {
        throw new Error('Random message section not found');
    }

    const sectionId = currentSection.dataset.sectionId;
    const url = new URL(window.location.href);
    url.searchParams.set('section_id', sectionId);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
        throw new Error('Cannot get random message section');
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const newSection = doc.querySelector(
        `.random-message[data-section-id="${sectionId}"]`
    );

    if (!newSection) {
        throw new Error('New random message section not found');
    }

    currentSection.replaceWith(newSection);

    console.log(newSection);
}
