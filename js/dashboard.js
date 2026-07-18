document.addEventListener("DOMContentLoaded", () => {

    const cards = getCards();

    const totalCards = document.getElementById("dashboardTotalCards");
    const totalValue = document.getElementById("dashboardValue");
    const forSale = document.getElementById("dashboardForSale");
    const wishlist = document.getElementById("dashboardWishlist");
    const recentCards = document.getElementById("recentCards");

    totalCards.textContent = cards.length;

    const value = cards.reduce((sum, card) => {
        return sum + (parseFloat(card.value) || 0);
    }, 0);

    totalValue.textContent = "₱" + value.toLocaleString();

    forSale.textContent = cards.filter(card =>
        card.status === "For Sale"
    ).length;

    wishlist.textContent = cards.filter(card =>
        card.status === "Wishlist"
    ).length;

    recentCards.innerHTML = "";

    const latest = [...cards].reverse().slice(0, 10);

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

}); 