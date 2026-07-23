// =====================================
// RS Hobby Shop
// app.js
// Version 1.0
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("RS Hobby Shop Started");

    if (typeof initializeCollection === "function") {
        initializeCollection();
    }

    function renderHomeSummary() {
        const cards = typeof getCards === "function" ? getCards() : [];

        const portfolioValue = document.getElementById("homePortfolioValue");
        const totalCards = document.getElementById("homeTotalCards");
        const forSaleCount = document.getElementById("homeForSaleCount");
        const auctionCount = document.getElementById("homeAuctionCount");

        if (!portfolioValue || !totalCards || !forSaleCount || !auctionCount) {
            return;
        }

        const totalValue = cards.reduce((sum, card) => {
            return sum + (parseFloat(card.value) || 0);
        }, 0);

        portfolioValue.textContent = "₱" + totalValue.toLocaleString();
        totalCards.textContent = cards.length;
        forSaleCount.textContent = cards.filter(card => card.status === "For Sale").length;
        auctionCount.textContent = cards.filter(card => card.status === "Auction").length;
    }

    renderHomeSummary();
    const homeSearch = document.getElementById("homeSearch");
    homeSearch?.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        const query = homeSearch.value.trim();
        window.location.href = `pages/collection.html${query ? `?search=${encodeURIComponent(query)}` : ""}`;
    });

    const activityPanel = document.getElementById("homeActivity");
    const activityList = document.getElementById("homeActivityList");
    const renderActivity = () => {
        if (!activityList || typeof getActivity !== "function") return;
        const rows = getActivity().slice(0, 5);
        activityList.innerHTML = rows.length ? rows.map(item => `<div class="py-1 border-bottom border-secondary">${item.message} <span class="float-end">${new Date(item.createdAt).toLocaleDateString()}</span></div>`).join("") : "No recent activity.";
    };
    document.getElementById("homeNotifications")?.addEventListener("click", () => { renderActivity(); activityPanel?.classList.toggle("d-none"); });
    document.getElementById("closeHomeActivity")?.addEventListener("click", () => activityPanel?.classList.add("d-none"));
    window.addEventListener("storage", renderHomeSummary);
    window.addEventListener("cards:updated", renderHomeSummary);
    window.addEventListener("activity:updated", renderActivity);

});
