document.addEventListener("DOMContentLoaded", () => {
    const analyticsTotalCards = document.getElementById("analyticsTotalCards");
    const analyticsTotalValue = document.getElementById("analyticsTotalValue");
    const analyticsWishlistCount = document.getElementById("analyticsWishlistCount");
    const analyticsAuctionCount = document.getElementById("analyticsAuctionCount");
    const analyticsOrderCount = document.getElementById("analyticsOrderCount");
    const analyticsRevenue = document.getElementById("analyticsRevenue");
    const analyticsExpenses = document.getElementById("analyticsExpenses");
    const analyticsProfit = document.getElementById("analyticsProfit");
    const analyticsTopCards = document.getElementById("analyticsTopCards");
    const analyticsEmpty = document.getElementById("analyticsEmpty");
    const analyticsTopPlayers = document.getElementById("analyticsTopPlayers");
    const analyticsPlayersEmpty = document.getElementById("analyticsPlayersEmpty");
    const analyticsRevenueChart = document.getElementById("analyticsRevenueChart");
    const analyticsGrowthChart = document.getElementById("analyticsGrowthChart");

    let revenueChart = null;
    let growthChart = null;

    function formatPrice(amount) {
        return "₱" + Number(amount || 0).toLocaleString();
    }

    function getOrdersData() {
        return (typeof getOrders === "function") ? getOrders() : [];
    }

    function buildTrendData(cards, orders) {
        const labels = [];
        const valueSeries = [];
        const growthSeries = [];
        const days = 6;
        let cumulativeCards = 0;
        let cumulativeValue = 0;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            labels.push(label);

            const dayCards = cards.filter(card => {
                const created = card.createdAt ? new Date(card.createdAt) : null;
                return created && created.toDateString() === date.toDateString();
            });

            const dayOrders = orders.filter(order => {
                const created = order.createdAt ? new Date(order.createdAt) : null;
                return created && created.toDateString() === date.toDateString();
            });

            cumulativeCards += dayCards.length;
            cumulativeValue += dayCards.reduce((sum, card) => sum + (parseFloat(card.value) || 0), 0);
            valueSeries.push(cumulativeValue);
            growthSeries.push(cumulativeCards);
        }

        return { labels, valueSeries, growthSeries };
    }

    function renderTopPlayers(orders) {
        if (!analyticsTopPlayers || !analyticsPlayersEmpty) return;

        const grouped = orders.reduce((acc, order) => {
            const player = order.player || "Unknown";
            const amount = parseFloat(order.price) || 0;
            if (!acc[player]) {
                acc[player] = { count: 0, revenue: 0 };
            }
            acc[player].count += 1;
            acc[player].revenue += amount;
            return acc;
        }, {});

        const topPlayers = Object.entries(grouped)
            .map(([player, data]) => ({ player, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        if (!topPlayers.length) {
            analyticsTopPlayers.innerHTML = "";
            analyticsPlayersEmpty.style.display = "block";
            return;
        }

        analyticsPlayersEmpty.style.display = "none";
        analyticsTopPlayers.innerHTML = topPlayers.map(row => `
            <tr>
                <td>${row.player}</td>
                <td>${row.count}</td>
                <td>${formatPrice(row.revenue)}</td>
            </tr>
        `).join("");
    }

    function renderChart(canvas, labels, data, label, borderColor) {
        if (!canvas) return null;

        const context = canvas.getContext("2d");

        if (!context) return null;

        return new Chart(context, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderColor,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                resizeDelay: 150,
                scales: {
                    x: { grid: { color: "rgba(255,255,255,0.08)" }, ticks: { color: "#fff" } },
                    y: { grid: { color: "rgba(255,255,255,0.08)" }, ticks: { color: "#fff" } }
                },
                plugins: {
                    legend: { labels: { color: "#fff" } }
                }
            }
        });
    }

    function renderAnalytics() {
        const cards = getCards();
        const orders = getOrdersData();

        if (!analyticsTotalCards || !analyticsTotalValue || !analyticsWishlistCount || !analyticsAuctionCount || !analyticsOrderCount || !analyticsRevenue || !analyticsExpenses || !analyticsProfit || !analyticsTopCards || !analyticsEmpty || !analyticsTopPlayers || !analyticsPlayersEmpty) {
            return;
        }

        analyticsTotalCards.textContent = cards.length;

        const totalValue = cards.reduce((sum, card) => sum + (parseFloat(card.value) || 0), 0);
        analyticsTotalValue.textContent = formatPrice(totalValue);

        analyticsWishlistCount.textContent = cards.filter(card => card.status === "Wishlist").length;
        analyticsAuctionCount.textContent = cards.filter(card => card.status === "Auction").length;
        analyticsOrderCount.textContent = orders.length;

        const revenue = orders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
        const expenses = cards.filter(card => card.status === "For Sale" || card.status === "Auction").reduce((sum, card) => sum + (parseFloat(card.value) || 0), 0);
        const profit = revenue - expenses;

        analyticsRevenue.textContent = formatPrice(revenue);
        analyticsExpenses.textContent = formatPrice(expenses);
        analyticsProfit.textContent = formatPrice(profit);

        const topCards = cards.slice().sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0)).slice(0, 5);

        if (!topCards.length) {
            analyticsTopCards.innerHTML = "";
            analyticsEmpty.style.display = "block";
        } else {
            analyticsEmpty.style.display = "none";
            analyticsTopCards.innerHTML = topCards.map(card => `
                <tr>
                    <td>${card.player || "Unknown"}</td>
                    <td>${card.brand || "Unknown"}</td>
                    <td>${card.set || "Unknown"}</td>
                    <td>${card.status || "PC"}</td>
                    <td>${formatPrice(card.value)}</td>
                </tr>
            `).join("");
        }

        renderTopPlayers(orders);

        const { labels, valueSeries, growthSeries } = buildTrendData(cards, orders);

        if (revenueChart) {
            revenueChart.destroy();
        }
        if (growthChart) {
            growthChart.destroy();
        }

        revenueChart = renderChart(analyticsRevenueChart, labels, valueSeries, "Portfolio Value", "#4dabf7");
        growthChart = renderChart(analyticsGrowthChart, labels, growthSeries, "Collection Size", "#82c91e");
    }

    renderAnalytics();
    window.addEventListener("storage", renderAnalytics);
    window.addEventListener("cards:updated", renderAnalytics);
    window.addEventListener("orders:updated", renderAnalytics);
});
