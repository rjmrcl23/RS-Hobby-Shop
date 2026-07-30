document.addEventListener("DOMContentLoaded", () => {

    const marketplaceList = document.getElementById("marketplaceList");
    const marketplaceEmpty = document.getElementById("marketplaceEmpty");
    const searchInput = document.getElementById("marketplaceSearch");
    const brandFilter = document.getElementById("marketplaceBrandFilter");
    const statusFilter = document.getElementById("marketplaceStatusFilter");
    const conditionFilter = document.getElementById("marketplaceConditionFilter");
    const priceOrder = document.getElementById("marketplacePriceOrder");

    const listingModal = document.getElementById("listingModal");
    const listingModalTitle = document.getElementById("listingModalTitle");
    const listingModalImage = document.getElementById("listingModalImage");
    const listingModalPlayer = document.getElementById("listingModalPlayer");
    const listingModalBrand = document.getElementById("listingModalBrand");
    const listingModalSet = document.getElementById("listingModalSet");
    const listingModalYear = document.getElementById("listingModalYear");
    const listingModalCondition = document.getElementById("listingModalCondition");
    const listingModalSeller = document.getElementById("listingModalSeller");
    const listingModalPrice = document.getElementById("listingModalPrice");
    const listingModalQuantity = document.getElementById("listingModalQuantity");
    const listingModalNotes = document.getElementById("listingModalNotes");
    const listingModalStatus = document.getElementById("listingModalStatus");
    const wishlistButton = document.getElementById("wishlistButton");
    const contactButton = document.getElementById("contactButton");
    const shareButton = document.getElementById("shareButton");
    const listingActionFeedback = document.getElementById("listingActionFeedback");

    let activeListing = null;

    function getMarketplaceCards() {
        return getCards();
    }

    function formatPrice(amount) {
        return "₱" + Number(amount || 0).toLocaleString();
    }

    function buildBadge(status) {
        const badge = {
            "PC": "secondary",
            "For Sale": "success",
            "Auction": "warning",
            "Wishlist": "info"
        }[status] || "primary";
        return `<span class="badge bg-${badge}">${status}</span>`;
    }

    function buildCard(item, index) {
        const thumbnail = item.image
            ? `<img src="${item.image}" alt="${item.player}" class="img-fluid rounded" style="height:200px;width:100%;object-fit:cover;">`
            : `<div class="d-flex align-items-center justify-content-center rounded bg-secondary" style="height:200px;">No Image</div>`;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="card shadow-sm h-100 marketplace-card" data-index="${index}">
                    ${thumbnail}
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <h6 class="mb-1">${item.player || "Unknown"}</h6>
                            <p class="text-muted mb-1">${item.brand || "Unknown"} • ${item.set || "Unknown"}</p>
                            <p class="text-muted mb-1">Year ${item.year || "N/A"} • ${item.condition || "N/A"}</p>
                        </div>
                        <div class="mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <div class="fw-bold">${formatPrice(item.value)}</div>
                                <small class="text-muted">Seller: RS Hobby Shop</small>
                            </div>
                            <div>${buildBadge(item.status)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderBrandOptions(cards) {
        const selectedBrand = brandFilter.value || "all";
        const brands = Array.from(new Set(cards.map(c => c.brand).filter(Boolean))).sort();
        brandFilter.innerHTML = `<option value="all" selected>All Brands</option>` + brands.map(brand => `
            <option value="${brand}">${brand}</option>
        `).join("");
        brandFilter.value = brands.includes(selectedBrand) ? selectedBrand : "all";
    }

    function sortListings(items) {
        if (priceOrder.value === "asc") {
            return items.slice().sort((a, b) => (parseFloat(a.value) || 0) - (parseFloat(b.value) || 0));
        }
        if (priceOrder.value === "desc") {
            return items.slice().sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0));
        }
        return items;
    }

    function filterListings() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const brandTerm = brandFilter.value;
        const statusTerm = statusFilter.value;
        const conditionTerm = conditionFilter.value;

        return getMarketplaceCards().filter(card => {
            const matchesSearch = [card.player, card.brand, card.set, card.year]
                .filter(Boolean)
                .some(value => value.toString().toLowerCase().includes(searchTerm));

            const matchesBrand = brandTerm === "all" || card.brand === brandTerm;
            const matchesStatus = statusTerm === "all" || card.status === statusTerm;
            const matchesCondition = conditionTerm === "all" || card.condition === conditionTerm;

            return matchesSearch && matchesBrand && matchesStatus && matchesCondition;
        });
    }

    function renderMarketplace() {
        const cards = filterListings();
        const sorted = sortListings(cards);

        marketplaceList.innerHTML = sorted.map((item, index) => buildCard(item, index)).join("");
        marketplaceEmpty.style.display = sorted.length === 0 ? "block" : "none";

        document.querySelectorAll(".marketplace-card").forEach(card => {
            card.addEventListener("click", () => {
                const index = Number(card.dataset.index);
                openListingModal(sorted[index]);
            });
        });
    }

    function isSameCard(card, item) {
        if (card.id && item.id) {
            return card.id === item.id;
        }

        return card.player === item.player &&
            card.brand === item.brand &&
            card.set === item.set &&
            card.year === item.year &&
            card.number === item.number &&
            card.condition === item.condition &&
            String(card.value) === String(item.value) &&
            card.image === item.image;
    }

    function openListingModal(item) {
        if (!item) return;
        activeListing = item;
        listingModalTitle.textContent = `${item.player || "Listing"}`;
        listingModalImage.src = item.image || "../images/logos/logo.png";
        listingModalPlayer.textContent = item.player || "N/A";
        listingModalBrand.textContent = item.brand || "N/A";
        listingModalSet.textContent = item.set || "N/A";
        listingModalYear.textContent = item.year || "N/A";
        listingModalCondition.textContent = item.condition || "N/A";
        listingModalSeller.textContent = "RS Hobby Shop";
        listingModalPrice.textContent = formatPrice(item.value);
        listingModalQuantity.textContent = "1";
        listingModalNotes.textContent = item.notes || "No additional notes.";
        listingModalStatus.textContent = item.status || "N/A";
        wishlistButton.textContent = item.status === "Wishlist" ? "Remove from Wishlist" : "Add to Wishlist";
        listingActionFeedback?.classList.add("d-none");

        const modal = new bootstrap.Modal(listingModal);
        modal.show();
    }

    function toggleWishlist() {
        if (!activeListing) return;
        const cards = getCards();
        const index = cards.findIndex(card => isSameCard(card, activeListing));
        if (index === -1) return;

        cards[index].status = cards[index].status === "Wishlist" ? "PC" : "Wishlist";
        cards[index].updatedAt = Date.now();
        saveCards(cards);

        activeListing = cards[index];
        openListingModal(activeListing);
        renderMarketplace();
    }

    wishlistButton.addEventListener("click", toggleWishlist);

    contactButton.addEventListener("click", () => {
        if (!activeListing || !listingActionFeedback) return;
        listingActionFeedback.textContent = `Contact ${activeListing.seller || "RS Hobby Shop"}: seller contact will be available when multi-user accounts are connected.`;
        listingActionFeedback.classList.remove("d-none");
    });

    shareButton.addEventListener("click", async () => {
        if (!activeListing || !listingActionFeedback) return;
        const shareText = `${activeListing.player || "Card"} — ${activeListing.brand || ""} ${activeListing.set || ""} (${formatPrice(activeListing.value)})`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "RS Hobby Shop Listing", text: shareText });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
            }
            listingActionFeedback.textContent = "Listing details are ready to share.";
        } catch (error) {
            listingActionFeedback.textContent = "Sharing was cancelled.";
        }
        listingActionFeedback.classList.remove("d-none");
    });

    [searchInput, brandFilter, statusFilter, conditionFilter, priceOrder].forEach(elem => {
        elem.addEventListener("input", renderMarketplace);
        elem.addEventListener("change", renderMarketplace);
    });

    function updateMarketplace() {
        const marketplaceCards = getMarketplaceCards();
        renderBrandOptions(marketplaceCards);
        renderMarketplace();
    }

    updateMarketplace();

    window.addEventListener("storage", updateMarketplace);
    window.addEventListener("cards:updated", updateMarketplace);

});
