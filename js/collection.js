document.addEventListener("DOMContentLoaded", () => {

    const table = document.getElementById("collectionTable");
    const saveButton = document.getElementById("saveCard");
    const searchBox = document.getElementById("searchCards");
    const modalElement = document.getElementById("addCardModal");

    const totalCards = document.getElementById("totalCards");
    const collectionValue = document.getElementById("collectionValue");
    const forSaleCount = document.getElementById("forSaleCount");
    const wishlistCount = document.getElementById("wishlistCount");

    // Form Fields
    const playerField = document.getElementById("player");
    const brandField = document.getElementById("brand");
    const setField = document.getElementById("set");
    const yearField = document.getElementById("year");
    const numberField = document.getElementById("number");
    const conditionField = document.getElementById("condition");
    const statusField = document.getElementById("status");
    const valueField = document.getElementById("value");

    let editIndex = -1;

    function renderCards() {

        table.innerHTML = "";

        const cards = getCards();

        totalCards.textContent = cards.length;

        const totalValue = cards.reduce((sum, card) => {
            return sum + (parseFloat(card.value) || 0);
        }, 0);

        collectionValue.textContent = "₱" + totalValue.toLocaleString();

        forSaleCount.textContent = cards.filter(c => c.status === "For Sale").length;
        wishlistCount.textContent = cards.filter(c => c.status === "Wishlist").length;

        const keyword = searchBox.value.trim().toLowerCase();

        const filtered = cards.filter(card =>
            (card.player || "").toLowerCase().includes(keyword) ||
            (card.brand || "").toLowerCase().includes(keyword) ||
            (card.set || "").toLowerCase().includes(keyword) ||
            (card.number || "").toLowerCase().includes(keyword)
        );

        filtered.forEach(card => {

            const realIndex = cards.indexOf(card);

            const status = card.status || "PC";

            const badgeClass = {
                "PC": "primary",
                "For Sale": "success",
                "Auction": "warning",
                "Wishlist": "secondary"
            }[status] || "primary";

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>🏀</td>
                <td>${card.player}</td>
                <td>${card.brand}</td>
                <td>${card.set}</td>
                <td>${card.year}</td>
                <td>${card.number}</td>
                <td>${card.condition}</td>
                <td><span class="badge bg-${badgeClass}">${status}</span></td>
                <td>₱${Number(card.value || 0).toLocaleString()}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-card" data-index="${realIndex}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button class="btn btn-danger btn-sm delete-card" data-index="${realIndex}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

        document.querySelectorAll(".delete-card").forEach(btn => {

            btn.addEventListener("click", () => {

                const cards = getCards();

                cards.splice(Number(btn.dataset.index), 1);

                saveCards(cards);

                renderCards();

            });

        });

        document.querySelectorAll(".edit-card").forEach(btn => {

            btn.addEventListener("click", () => {

                const cards = getCards();

                editIndex = Number(btn.dataset.index);

                const card = cards[editIndex];

                playerField.value = card.player || "";
                brandField.value = card.brand || "";
                setField.value = card.set || "";
                yearField.value = card.year || "";
                numberField.value = card.number || "";
                conditionField.value = card.condition || "Mint";
                statusField.value = card.status || "PC";
                valueField.value = card.value || "";

                const modal = new bootstrap.Modal(modalElement);
                modal.show();

            });

        });

    }

    saveButton.addEventListener("click", () => {

        const card = {
            player: playerField.value.trim(),
            brand: brandField.value.trim(),
            set: setField.value.trim(),
            year: yearField.value.trim(),
            number: numberField.value.trim(),
            condition: conditionField.value,
            status: statusField.value,
            value: valueField.value.trim()
        };

        if (card.player === "") {
            alert("Please enter a player.");
            return;
        }

        const cards = getCards();

        if (editIndex === -1) {
            cards.push(card);
        } else {
            cards[editIndex] = card;
            editIndex = -1;
        }

        saveCards(cards);

        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }

        playerField.value = "";
        brandField.value = "";
        setField.value = "";
        yearField.value = "";
        numberField.value = "";
        valueField.value = "";

        conditionField.selectedIndex = 0;
        statusField.selectedIndex = 0;

        renderCards();

    });

    searchBox.addEventListener("input", renderCards);

    renderCards();

});