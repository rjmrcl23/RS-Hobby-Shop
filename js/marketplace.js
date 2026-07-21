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

    let activeListing = null;

    function getMarketplaceCards() {
        return getCards().filter(card => card.status === "For Sale");
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
        const brands = Array.from(new Set(cards.map(c => c.brand).filter(Boolean))).sort();
        brandFilter.innerHTML = `<option value="all">All Brands</option>` + brands.map(brand => `
            <option value="${brand}">${brand}</option>
        `).join("");
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

        const modal = new bootstrap.Modal(listingModal);
        modal.show();
    }

    wishlistButton.addEventListener("click", () => {
        alert("Add to Wishlist is not implemented yet.");
    });

    contactButton.addEventListener("click", () => {
        alert("Contact Seller is not implemented yet.");
    });

    shareButton.addEventListener("click", () => {
        alert("Share Listing is not implemented yet.");
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
