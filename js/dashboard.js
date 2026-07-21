document.addEventListener("DOMContentLoaded", () => {

    const totalCards = document.getElementById("dashboardTotalCards");
    const totalValue = document.getElementById("dashboardValue");
    const forSale = document.getElementById("dashboardForSale");
    const wishlist = document.getElementById("dashboardWishlist");
    const recentCards = document.getElementById("recentCards");

    const mostValuablePlayer = document.getElementById("dashboardMostValuablePlayer");
    const mostValuableBrandSet = document.getElementById("dashboardMostValuableBrandSet");
    const mostValuableValue = document.getElementById("dashboardMostValuableValue");

    const pcCount = document.getElementById("dashboardPcCount");
    const auctionCount = document.getElementById("dashboardAuctionCount");
    const forSaleCount = document.getElementById("dashboardForSaleCount");
    const wishlistCount = document.getElementById("dashboardWishlistCount");

    const pcValue = document.getElementById("dashboardPcValue");
    const auctionValue = document.getElementById("dashboardAuctionValue");
    const forSaleValue = document.getElementById("dashboardForSaleValue");
    const wishlistValue = document.getElementById("dashboardWishlistValue");

    function renderDashboard() {
        const cards = getCards();

        if (!totalCards || !totalValue || !forSale || !wishlist || !recentCards) {
            return;
        }

        totalCards.textContent = cards.length;

        const value = cards.reduce((sum, card) => {
            return sum + (parseFloat(card.value) || 0);
        }, 0);

        totalValue.textContent = "₱" + value.toLocaleString();

        const statusCounts = {
            PC: 0,
            "For Sale": 0,
            Auction: 0,
            Wishlist: 0
        };

        const statusValues = {
            PC: 0,
            "For Sale": 0,
            Auction: 0,
            Wishlist: 0
        };

        cards.forEach(card => {
            const status = card.status || "PC";
            const amount = parseFloat(card.value) || 0;
            if (statusCounts[status] !== undefined) {
                statusCounts[status] += 1;
                statusValues[status] += amount;
            } else {
                statusCounts.PC += 1;
                statusValues.PC += amount;
            }
        });

        forSale.textContent = statusCounts["For Sale"];
        wishlist.textContent = statusCounts.Wishlist;

        pcCount.textContent = statusCounts.PC;
        auctionCount.textContent = statusCounts.Auction;
        forSaleCount.textContent = statusCounts["For Sale"];
        wishlistCount.textContent = statusCounts.Wishlist;

        pcValue.textContent = "₱" + statusValues.PC.toLocaleString();
        auctionValue.textContent = "₱" + statusValues.Auction.toLocaleString();
        forSaleValue.textContent = "₱" + statusValues["For Sale"].toLocaleString();
        wishlistValue.textContent = "₱" + statusValues.Wishlist.toLocaleString();

        const mostValuableCard = cards.slice().sort((a, b) => {
            return (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0);
        })[0];

        if (mostValuableCard) {
            mostValuablePlayer.textContent = mostValuableCard.player || "Unknown";
            mostValuableBrandSet.textContent = `${mostValuableCard.brand || "Unknown"} • ${mostValuableCard.set || "Unknown"}`;
            mostValuableValue.textContent = "₱" + (parseFloat(mostValuableCard.value) || 0).toLocaleString();
        } else {
            mostValuablePlayer.textContent = "N/A";
            mostValuableBrandSet.textContent = "No cards yet";
            mostValuableValue.textContent = "₱0";
        }

        recentCards.innerHTML = "";

        const latest = [...cards].reverse().slice(0, 5);

        if (latest.length === 0) {

            recentCards.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        No cards in your collection yet.
                    </td>
                </tr>
            `;

            return;
        }

        latest.forEach(card => {

            const status = card.status || "PC";

            const badge = {
                "PC": "primary",
                "For Sale": "success",
                "Auction": "warning",
                "Wishlist": "secondary"
            }[status] || "primary";

            recentCards.innerHTML += `
                <tr>
                    <td>${card.player}</td>
                    <td>${card.brand}</td>
                    <td>${card.set}</td>
                    <td>
                        <span class="badge bg-${badge}">
                            ${status}
                        </span>
                    </td>
                    <td>
                        ₱${Number(card.value || 0).toLocaleString()}
                    </td>
                </tr>
            `;
        });
    }

    // Call once on load
    renderDashboard();

    // Debounced renderer to avoid excessive reflows when multiple events fire rapidly
    let _dashboardDebounceTimer = null;
    function debouncedRenderDashboard(delay = 200) {
        if (_dashboardDebounceTimer) clearTimeout(_dashboardDebounceTimer);
        _dashboardDebounceTimer = setTimeout(() => {
            renderDashboard();
            _dashboardDebounceTimer = null;
        }, delay);
    }

    // Listen for cross-tab storage changes and internal updates, but debounce actual rendering
    window.addEventListener("storage", () => debouncedRenderDashboard());
    window.addEventListener("cards:updated", () => debouncedRenderDashboard());

    // Debug helper: simulate add -> edit -> delete sequence to verify dashboard updates.
    // Usage: open browser console and run `window._simulateCardChanges()`
    window._simulateCardChanges = async function simulateCardChanges() {
        try {
            console.log("[dashboard] Starting simulation: add -> edit -> delete");
            const initial = getCards();
            const cards = getCards();

            // Add
            const testCard = {
                player: "SIM Test",
                brand: "SIM",
                set: "SIMSET",
                year: "2026",
                number: "SIM1",
                condition: "Mint",
                status: "PC",
                value: "1",
                image: ""
            };
            cards.push(testCard);
            saveCards(cards);
            console.log("[dashboard] Added test card. Count:", getCards().length);

            // wait for render
            await new Promise(r => setTimeout(r, 300));

            // Edit last card
            const edited = getCards();
            const idx = edited.length - 1;
            if (idx >= 0) {
                edited[idx].player = "SIM Test Edited";
                saveCards(edited);
                console.log("[dashboard] Edited test card.");
            }

            await new Promise(r => setTimeout(r, 300));

            // Delete last card
            const afterEdit = getCards();
            afterEdit.pop();
            saveCards(afterEdit);
            console.log("[dashboard] Deleted test card. Count:", getCards().length);

            console.log("[dashboard] Simulation complete.");
        } catch (err) {
            console.error("[dashboard] Simulation error:", err);
        }
    };

});