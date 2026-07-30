document.addEventListener("DOMContentLoaded", () => {
    const wishlistTable = document.getElementById("wishlistTable");
    const wishlistEmpty = document.getElementById("wishlistEmpty");
    const wishlistSearch = document.getElementById("wishlistSearch");
    const wishlistBrandFilter = document.getElementById("wishlistBrandFilter");
    const wishlistConditionFilter = document.getElementById("wishlistConditionFilter");
    const wishlistClearFilters = document.getElementById("wishlistClearFilters");

    function formatPrice(amount) {
        return "₱" + Number(amount || 0).toLocaleString();
    }

    function getWishlistCards() {
        return getCards().filter(card => card.status === "Wishlist");
    }

    function renderFilterOptions(cards) {
        if (!wishlistBrandFilter) return;

        const selectedBrand = wishlistBrandFilter.value || "all";
        const brands = Array.from(new Set(cards.map(card => card.brand).filter(Boolean))).sort();
        wishlistBrandFilter.innerHTML = `<option value="all">All Brands</option>` + brands.map(brand => `
            <option value="${brand}">${brand}</option>
        `).join("");
        wishlistBrandFilter.value = brands.includes(selectedBrand) ? selectedBrand : "all";
    }

    function removeFromWishlist(cardId) {
        const cards = getCards();
        const index = cards.findIndex(card => card.id === cardId);
        if (index === -1) return;

        cards[index].status = "PC";
        cards[index].updatedAt = Date.now();
        saveCards(cards);
        renderWishlist();
    }

    function renderWishlist() {
        const search = wishlistSearch?.value.trim().toLowerCase() || "";
        const brandFilter = wishlistBrandFilter?.value || "all";
        const conditionFilter = wishlistConditionFilter?.value || "all";
        const allWishlistCards = getWishlistCards();

        renderFilterOptions(allWishlistCards);

        const cards = allWishlistCards.filter(card => {
            const combined = [card.player, card.brand, card.set, card.year, card.number]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchesSearch = combined.includes(search);
            const matchesBrand = brandFilter === "all" || card.brand === brandFilter;
            const matchesCondition = conditionFilter === "all" || card.condition === conditionFilter;
            return matchesSearch && matchesBrand && matchesCondition;
        });

        if (!wishlistTable || !wishlistEmpty) return;

        if (!cards.length) {
            wishlistTable.innerHTML = "";
            wishlistEmpty.style.display = "block";
            return;
        }

        wishlistEmpty.style.display = "none";
        wishlistTable.innerHTML = cards.map(card => `
            <tr>
                <td>${card.image ? `<img src="${card.image}" alt="${card.player}" class="img-thumbnail" style="width:72px;height:72px;object-fit:cover;">` : `<div class="d-flex align-items-center justify-content-center border rounded" style="width:72px;height:72px;background:#2c2c2c;color:#999;"><i class="fa-solid fa-image"></i></div>`}</td>
                <td>${card.player || "Unknown"}</td>
                <td>${card.brand || "Unknown"}</td>
                <td>${card.set || "Unknown"}</td>
                <td>${card.condition || "N/A"}</td>
                <td><span class="badge bg-info text-dark">${card.status || "Wishlist"}</span></td>
                <td>${card.status === "Wishlist" ? "In collection" : "Unavailable"}</td>
                <td>${formatPrice(card.value)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-wishlist" data-id="${card.id}">Remove</button>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".remove-wishlist").forEach(button => {
            button.addEventListener("click", () => removeFromWishlist(button.dataset.id));
        });
    }

    wishlistSearch?.addEventListener("input", renderWishlist);
    wishlistBrandFilter?.addEventListener("change", renderWishlist);
    wishlistConditionFilter?.addEventListener("change", renderWishlist);
    wishlistClearFilters?.addEventListener("click", () => {
        if (wishlistSearch) wishlistSearch.value = "";
        if (wishlistBrandFilter) wishlistBrandFilter.value = "all";
        if (wishlistConditionFilter) wishlistConditionFilter.value = "all";
        renderWishlist();
    });

    renderWishlist();
    window.addEventListener("storage", renderWishlist);
    window.addEventListener("cards:updated", renderWishlist);
});
