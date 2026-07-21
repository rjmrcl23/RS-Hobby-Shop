document.addEventListener("DOMContentLoaded", () => {

    const activeListingsEl = document.getElementById("shopActiveListings");
    const soldItemsEl = document.getElementById("shopSoldItems");
    const draftListingsEl = document.getElementById("shopDraftListings");
    const totalValueEl = document.getElementById("shopTotalValue");
    const totalSalesEl = document.getElementById("shopTotalSales");
    const listingsTable = document.getElementById("shopListingsTable");
    const searchInput = document.getElementById("shopSearch");
    const statusFilter = document.getElementById("shopStatusFilter");
    const brandFilter = document.getElementById("shopBrandFilter");
    const priceFilter = document.getElementById("shopPriceFilter");
    const recentFilter = document.getElementById("shopRecentFilter");

    const editModal = document.getElementById("shopEditModal");
    const editPrice = document.getElementById("shopEditPrice");
    const editQuantity = document.getElementById("shopEditQuantity");
    const editDescription = document.getElementById("shopEditDescription");
    const editShipping = document.getElementById("shopEditShipping");
    const editTags = document.getElementById("shopEditTags");
    const saveEditButton = document.getElementById("shopSaveEdit");

    let activeListingId = null;

    function formatPrice(value) {
        return "₱" + Number(value || 0).toLocaleString();
    }

    function getListings() {
        return getShopListings();
    }

    function saveListings(listings) {
        saveShopListings(listings);
    }

    function renderBrandOptions(listings) {
        const brands = Array.from(new Set(listings.map(item => item.brand).filter(Boolean))).sort();
        brandFilter.innerHTML = `<option value="all">All Brands</option>` + brands.map(brand => `<option value="${brand}">${brand}</option>`).join("");
    }

    function renderStats(listings) {
        activeListingsEl.textContent = listings.filter(item => item.status === "Active").length;
        soldItemsEl.textContent = listings.filter(item => item.status === "Sold").length;
        draftListingsEl.textContent = listings.filter(item => item.status === "Draft").length;
        totalValueEl.textContent = formatPrice(listings.reduce((sum, item) => sum + (parseFloat(item.price || item.value || 0) || 0), 0));
        totalSalesEl.textContent = formatPrice(listings.filter(item => item.status === "Sold").reduce((sum, item) => sum + (parseFloat(item.price || item.value || 0) || 0), 0));
    }

    function getFilteredListings() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const statusTerm = statusFilter.value;
        const brandTerm = brandFilter.value;
        const priceTerm = priceFilter.value;
        const recentTerm = recentFilter.value;

        return getListings().filter(item => {
            const searchMatch = [item.player, item.brand, item.set, (item.tags || []).join(" ")]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(searchTerm);
            const statusMatch = statusTerm === "all" || item.status === statusTerm;
            const brandMatch = brandTerm === "all" || item.brand === brandTerm;
            const priceMatch = priceTerm === "all" || (
                priceTerm === "low" ? (parseFloat(item.price || item.value || 0) || 0) <= 100 : (parseFloat(item.price || item.value || 0) || 0) > 100
            );
            const recentMatch = recentTerm === "all" || recentTerm === "recent";
            return searchMatch && statusMatch && brandMatch && priceMatch && recentMatch;
        });
    }

    function renderListings() {
        const allListings = getListings();
        const listings = getFilteredListings();
        renderBrandOptions(allListings);
        renderStats(allListings);

        if (listings.length === 0) {
            listingsTable.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No shop listings yet.</td></tr>`;
            return;
        }

        listingsTable.innerHTML = listings.map(item => {
            const thumbnail = item.image
                ? `<img src="${item.image}" alt="${item.player}" class="img-thumbnail" style="width:72px;height:72px;object-fit:cover;">`
                : `<div class="d-flex align-items-center justify-content-center border rounded" style="width:72px;height:72px;background:#2c2c2c;color:#999;"><i class="fa-solid fa-image"></i></div>`;

            return `
                <tr>
                    <td>${thumbnail}</td>
                    <td>${item.player || "Unknown"}</td>
                    <td>${item.brand || "Unknown"}</td>
                    <td>${item.set || "Unknown"}</td>
                    <td>${formatPrice(item.price || item.value || 0)}</td>
                    <td><span class="badge bg-${item.status === "Active" ? "success" : item.status === "Sold" ? "secondary" : item.status === "Paused" ? "warning" : "info"}">${item.status || "Active"}</span></td>
                    <td>${(item.tags || []).join(", ") || "-"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-listing" data-id="${item.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-success btn-sm sold-listing" data-id="${item.id}"><i class="fa-solid fa-check"></i></button>
                        <button class="btn btn-secondary btn-sm pause-listing" data-id="${item.id}"><i class="fa-solid fa-pause"></i></button>
                        <button class="btn btn-info btn-sm activate-listing" data-id="${item.id}"><i class="fa-solid fa-play"></i></button>
                        <button class="btn btn-danger btn-sm delete-listing" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll(".edit-listing").forEach(btn => btn.addEventListener("click", () => openEditModal(btn.dataset.id)));
        document.querySelectorAll(".sold-listing").forEach(btn => btn.addEventListener("click", () => updateListingStatus(btn.dataset.id, "Sold")));
        document.querySelectorAll(".pause-listing").forEach(btn => btn.addEventListener("click", () => updateListingStatus(btn.dataset.id, "Paused")));
        document.querySelectorAll(".activate-listing").forEach(btn => btn.addEventListener("click", () => updateListingStatus(btn.dataset.id, "Active")));
        document.querySelectorAll(".delete-listing").forEach(btn => btn.addEventListener("click", () => deleteListing(btn.dataset.id)));
    }

    function updateListingStatus(id, status) {
        const listings = getListings();
        const index = listings.findIndex(item => item.id === id);
        if (index === -1) return;
        listings[index].status = status;
        listings[index].updatedAt = Date.now();
        saveListings(listings);
        renderListings();
    }

    function deleteListing(id) {
        const listings = getListings().filter(item => item.id !== id);
        saveListings(listings);
        renderListings();
    }

    function openEditModal(id) {
        const listings = getListings();
        const item = listings.find(entry => entry.id === id);
        if (!item) return;
        activeListingId = id;
        editPrice.value = item.price || item.value || 0;
        editQuantity.value = item.quantity || 1;
        editDescription.value = item.description || "";
        editShipping.value = item.shippingNotes || "";
        editTags.value = (item.tags || []).join(", ");
        const modal = new bootstrap.Modal(editModal);
        modal.show();
    }

    saveEditButton.addEventListener("click", () => {
        if (!activeListingId) return;
        const listings = getListings();
        const index = listings.findIndex(item => item.id === activeListingId);
        if (index === -1) return;
        listings[index].price = editPrice.value;
        listings[index].quantity = Number(editQuantity.value || 1);
        listings[index].description = editDescription.value;
        listings[index].shippingNotes = editShipping.value;
        listings[index].tags = editTags.value.split(",").map(tag => tag.trim()).filter(Boolean);
        listings[index].updatedAt = Date.now();
        saveListings(listings);
        bootstrap.Modal.getInstance(editModal)?.hide();
        renderListings();
    });

    [searchInput, statusFilter, brandFilter, priceFilter, recentFilter].forEach(elem => elem.addEventListener("input", renderListings));
    [statusFilter, brandFilter, priceFilter, recentFilter].forEach(elem => elem.addEventListener("change", renderListings));

    function syncFromStorage() {
        const cards = getCards().filter(card => card.status === "For Sale");
        const listings = getListings();
        const synced = [];
        cards.forEach(card => {
            const signature = `${card.player || ""}|${card.brand || ""}|${card.set || ""}|${card.year || ""}|${card.number || ""}|${card.condition || ""}|${card.value || ""}|${card.image || ""}`;
            const existing = listings.find(item => item.sourceSignature === signature);
            if (existing) {
                synced.push({ ...existing, image: card.image || existing.image || "", player: card.player || existing.player, brand: card.brand || existing.brand, set: card.set || existing.set, year: card.year || existing.year, condition: card.condition || existing.condition, value: card.value || existing.value, price: existing.price || card.value || existing.value, quantity: existing.quantity || 1, description: existing.description || card.notes || "", shippingNotes: existing.shippingNotes || "Standard shipping available", tags: existing.tags || [card.brand || "", card.set || ""].filter(Boolean), notes: card.notes || existing.notes || "", status: existing.status || "Active", updatedAt: Date.now() });
            } else {
                synced.push(createShopListingFromCard(card, synced.length));
            }
        });
        if (synced.length !== listings.length) {
            saveListings(synced);
        } else {
            renderListings();
        }
    }

    renderListings();
    syncFromStorage();
    window.addEventListener("storage", renderListings);
    window.addEventListener("cards:updated", () => {
        syncFromStorage();
        renderListings();
    });
    window.addEventListener("shop:updated", renderListings);

});
