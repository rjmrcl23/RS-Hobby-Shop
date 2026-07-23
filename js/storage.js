const STORAGE_KEY = "rs_hobby_collection";
const SHOP_STORAGE_KEY = "rs_hobby_shop_listings";
const ORDERS_STORAGE_KEY = "rs_hobby_orders";
const AUCTIONS_STORAGE_KEY = "rs_hobby_auctions";
const SETTINGS_STORAGE_KEY = "rs_hobby_settings";
const ACTIVITY_STORAGE_KEY = "rs_hobby_activity";

function readStorageArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.warn(`Unable to read ${key} from local storage.`, error);
        return [];
    }
}

function getCards() {
    return readStorageArray(STORAGE_KEY);
}

function saveCards(cards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    syncShopListingsFromCards(cards);

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cards:updated"));
    }
}

function getShopListings() {
    return readStorageArray(SHOP_STORAGE_KEY);
}

function saveShopListings(listings) {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(listings));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shop:updated"));
    }
}

function getOrders() {
    return readStorageArray(ORDERS_STORAGE_KEY);
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("orders:updated"));
    }
}

function createOrderFromListing(listing, card) {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        listingId: listing.id || "",
        cardId: card?.id || "",
        player: card?.player || listing.player || "Unknown",
        brand: card?.brand || listing.brand || "Unknown",
        set: card?.set || listing.set || "Unknown",
        price: listing.price || listing.value || card?.value || 0,
        status: "Pending",
        createdAt: Date.now()
    };
}

function getAuctions() {
    return readStorageArray(AUCTIONS_STORAGE_KEY);
}

function saveAuctions(auctions) {
    localStorage.setItem(AUCTIONS_STORAGE_KEY, JSON.stringify(auctions));

    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auctions:updated"));
    }
}

function getActivity() {
    return readStorageArray(ACTIVITY_STORAGE_KEY);
}

function addActivity(message, type = "info") {
    const activity = [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type,
        createdAt: Date.now()
    }, ...getActivity()].slice(0, 50);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("activity:updated"));
}

function getSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {};
    } catch (error) {
        console.warn("Unable to read settings from local storage.", error);
        return {};
    }
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("settings:updated"));
    }
}

function getBackupData() {
    return {
        cards: getCards(),
        shopListings: getShopListings(),
        orders: getOrders(),
        auctions: getAuctions(),
        exportedAt: Date.now()
    };
}

function restoreBackupData(backup) {
    if (!backup || typeof backup !== "object") return false;

    if (Array.isArray(backup.cards)) {
        saveCards(backup.cards);
    }
    if (Array.isArray(backup.shopListings)) {
        saveShopListings(backup.shopListings);
    }
    if (Array.isArray(backup.orders)) {
        saveOrders(backup.orders);
    }
    if (Array.isArray(backup.auctions)) {
        saveAuctions(backup.auctions);
    }

    addActivity("Backup restored", "success");

    return true;
}

function syncAuctionsFromCards(cards = getCards()) {
    const existing = getAuctions();
    const auctionCards = Array.isArray(cards) ? cards.filter(card => card.status === "Auction") : [];
    const nextAuctions = auctionCards.map((card, index) => {
        const existingAuction = existing.find(item => item.cardId === card.id || item.player === card.player);
        const baseBid = Number(card.value || 0);
        const startTime = existingAuction?.startsAt || Date.now();
        const endTime = existingAuction?.endsAt || Date.now() + 24 * 60 * 60 * 1000;

        return {
            id: existingAuction?.id || `${Date.now()}-${index}`,
            cardId: card.id || `auction-${index}`,
            player: card.player || "Unknown",
            brand: card.brand || "Unknown",
            set: card.set || "Unknown",
            year: card.year || "",
            condition: card.condition || "Mint",
            image: card.image || "",
            reservePrice: baseBid || 0,
            currentBid: existingAuction?.currentBid || baseBid || 0,
            bidder: existingAuction?.bidder || "No bids yet",
            bids: existingAuction?.bids || [],
            startsAt: startTime,
            endsAt: endTime,
            status: existingAuction?.status || "Live"
        };
    });

    saveAuctions(nextAuctions);
    return nextAuctions;
}

function placeBid(auctionId, amount, bidder = "You") {
    const auctions = getAuctions();
    const target = auctions.find(item => item.id === auctionId);

    if (!target) return null;

    const currentBid = Number(target.currentBid || target.reservePrice || 0);
    const auctionExpired = target.endsAt && Date.now() >= Number(target.endsAt);

    if (auctionExpired || target.status === "Closed") return null;
    if (Number(amount) <= currentBid) return null;

    target.currentBid = Number(amount);
    target.bidder = bidder;
    target.status = "Live";
    target.bids = [...(target.bids || []), {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount: Number(amount),
        bidder,
        placedAt: Date.now()
    }];

    const cards = getCards();
    const cardIndex = cards.findIndex(card => card.id === target.cardId || (card.player === target.player && card.brand === target.brand && card.set === target.set));

    if (cardIndex !== -1) {
        cards[cardIndex].value = String(target.currentBid);
        saveCards(cards);
    }

    saveAuctions(auctions);
    return target;
}

function createShopListingFromCard(card, index) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${index}`;
    const signature = `${card.player || ""}|${card.brand || ""}|${card.set || ""}|${card.year || ""}|${card.number || ""}|${card.condition || ""}|${card.value || ""}|${card.image || ""}`;

    return {
        id,
        sourceCardId: card.id || "",
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
        const existingMatch = existingListings.find(listing =>
            (card.id && listing.sourceCardId === card.id) || listing.sourceSignature === signature
        );

        if (existingMatch) {
            nextListings.push({
                ...existingMatch,
                sourceCardId: card.id || existingMatch.sourceCardId || "",
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

    const hasChanged = JSON.stringify(existingListings) !== JSON.stringify(nextListings);

    if (hasChanged) {
        saveShopListings(nextListings);
    } else if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("shop:updated"));
    }
}
