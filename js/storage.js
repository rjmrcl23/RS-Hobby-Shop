const STORAGE_KEY = "rs_hobby_collection";
const SHOP_STORAGE_KEY = "rs_hobby_shop_listings";

function getCards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveCards(cards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    syncShopListingsFromCards(cards);

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cards:updated"));
    }
}

function getShopListings() {
    return JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY)) || [];
}

function saveShopListings(listings) {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(listings));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shop:updated"));
    }
}

function createShopListingFromCard(card, index) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${index}`;
    const signature = `${card.player || ""}|${card.brand || ""}|${card.set || ""}|${card.year || ""}|${card.number || ""}|${card.condition || ""}|${card.value || ""}|${card.image || ""}`;

    return {
        id,
        sourceSignature: signature,
        image: card.image || "",
        player: card.player || "Unknown",
        brand: card.brand || "Unknown",
        set: card.set || "Unknown",
        year: card.year || "",
        condition: card.condition || "Mint",
        value: card.value || "0",
        price: card.value || "0",
        quantity: 1,
        description: card.notes || `Listed from ${card.brand || "collection"}`,
        shippingNotes: "Standard shipping available",
        tags: [card.brand || "", card.set || ""].filter(Boolean),
        status: "Active",
        seller: "RS Hobby Shop",
        notes: card.notes || "",
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

function syncShopListingsFromCards(cards) {
    const currentCards = Array.isArray(cards) ? cards : getCards();
    const existingListings = getShopListings();
    const forSaleCards = currentCards.filter(card => card.status === "For Sale");

    const nextListings = [];

    forSaleCards.forEach((card, index) => {
        const signature = `${card.player || ""}|${card.brand || ""}|${card.set || ""}|${card.year || ""}|${card.number || ""}|${card.condition || ""}|${card.value || ""}|${card.image || ""}`;
        const existingMatch = existingListings.find(listing => listing.sourceSignature === signature);

        if (existingMatch) {
            nextListings.push({
                ...existingMatch,
                image: card.image || existingMatch.image || "",
                player: card.player || existingMatch.player || "Unknown",
                brand: card.brand || existingMatch.brand || "Unknown",
                set: card.set || existingMatch.set || "Unknown",
                year: card.year || existingMatch.year || "",
                condition: card.condition || existingMatch.condition || "Mint",
                value: card.value || existingMatch.value || "0",
                price: existingMatch.price || card.value || "0",
                quantity: existingMatch.quantity || 1,
                description: existingMatch.description || (card.notes || `Listed from ${card.brand || "collection"}`),
                shippingNotes: existingMatch.shippingNotes || "Standard shipping available",
                tags: existingMatch.tags || [card.brand || "", card.set || ""].filter(Boolean),
                status: existingMatch.status || "Active",
                seller: existingMatch.seller || "RS Hobby Shop",
                notes: card.notes || existingMatch.notes || "",
                updatedAt: Date.now()
            });
            return;
        }

        nextListings.push(createShopListingFromCard(card, index));
    });

    saveShopListings(nextListings);
}