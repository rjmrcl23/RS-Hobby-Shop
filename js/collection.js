document.addEventListener("DOMContentLoaded", () => {

    const table = document.getElementById("collectionTable");
    const saveButton = document.getElementById("saveCard");
    const searchBox = document.getElementById("searchCards");
    const sortField = document.getElementById("sortField");
    const sortOrder = document.getElementById("sortOrder");
    const sortHeaders = document.querySelectorAll("th[data-sort-field]");
    const modalElement = document.getElementById("addCardModal");
    const imageInput = document.getElementById("cardImage");
    const imagePreview = document.getElementById("imagePreview");

    const totalCards = document.getElementById("totalCards");
    const collectionValue = document.getElementById("collectionValue");
    const forSaleCount = document.getElementById("forSaleCount");
    const wishlistCount = document.getElementById("wishlistCount");

    const playerField = document.getElementById("player");
    const brandField = document.getElementById("brand");
    const setField = document.getElementById("set");
    const yearField = document.getElementById("year");
    const numberField = document.getElementById("number");
    const conditionField = document.getElementById("condition");
    const statusField = document.getElementById("status");
    const valueField = document.getElementById("value");

    let editIndex = -1;
    let pendingImageData = "";

    function resetForm() {
        playerField.value = "";
        brandField.value = "";
        setField.value = "";
        yearField.value = "";
        numberField.value = "";
        valueField.value = "";

        conditionField.selectedIndex = 0;
        statusField.selectedIndex = 0;

        if (imageInput) {
            imageInput.value = "";
        }

        pendingImageData = "";
        imagePreview.src = "../images/logos/logo.png";
    }

    function setPreview(imageData) {
        if (imageData) {
            imagePreview.src = imageData;
        } else {
            imagePreview.src = "../images/logos/logo.png";
        }
    }

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

        const sorted = sortCards(filtered, sortField?.value || "player", sortOrder?.value || "asc");

        sorted.forEach(card => {

            const realIndex = cards.findIndex(item => item === card);
            const status = card.status || "PC";

            const badgeClass = {
                "PC": "primary",
                "For Sale": "success",
                "Auction": "warning",
                "Wishlist": "secondary"
            }[status] || "primary";

            const thumbnail = card.image
                ? `<img src="${card.image}" alt="Card photo" class="img-thumbnail" style="width:72px;height:72px;object-fit:cover;">`
                : `<div class="d-flex align-items-center justify-content-center border rounded" style="width:72px;height:72px;background:#2c2c2c;color:#999;"><i class="fa-solid fa-image"></i></div>`;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${thumbnail}</td>
                <td>${card.player || ""}</td>
                <td>${card.brand || ""}</td>
                <td>${card.set || ""}</td>
                <td>${card.year || ""}</td>
                <td>${card.number || ""}</td>
                <td>${card.condition || ""}</td>
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

                pendingImageData = card.image || "";
                setPreview(pendingImageData);

                const modal = new bootstrap.Modal(modalElement);
                modal.show();

            });

        });

    }

    function compareCardValues(a, b, field) {
        const aValue = a[field] || "";
        const bValue = b[field] || "";

        if (field === "year" || field === "value") {
            const aNum = parseFloat(aValue) || 0;
            const bNum = parseFloat(bValue) || 0;
            return aNum - bNum;
        }

        const aText = String(aValue).toLowerCase();
        const bText = String(bValue).toLowerCase();

        if (aText < bText) return -1;
        if (aText > bText) return 1;
        return 0;
    }

    function updateSortIndicators() {
        sortHeaders.forEach(header => {
            const field = header.dataset.sortField;
            const baseLabel = header.dataset.label || header.textContent.trim();
            header.dataset.label = baseLabel;

            const isActive = field === (sortField?.value || "player");
            const symbol = isActive ? (sortOrder?.value === "desc" ? " ▼" : " ▲") : "";
            header.innerHTML = `${baseLabel}<span class="sort-indicator">${symbol}</span>`;
        });
    }

    function sortCards(cardsToSort, field, order) {
        const direction = order === "desc" ? -1 : 1;
        return cardsToSort.slice().sort((a, b) => {
            const comparison = compareCardValues(a, b, field);
            return comparison * direction;
        });
    }

    function readImageAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Unable to read image file."));
            reader.readAsDataURL(file);
        });
    }

    if (imageInput) {
        imageInput.addEventListener("change", async () => {
            const file = imageInput.files[0];

            if (!file) {
                pendingImageData = "";
                setPreview("");
                return;
            }

            try {
                pendingImageData = await readImageAsDataUrl(file);
                setPreview(pendingImageData);
            } catch (error) {
                console.error(error);
                alert("Unable to process the selected image.");
            }
        });
    }

    saveButton.addEventListener("click", async () => {

        const card = {
            player: playerField.value.trim(),
            brand: brandField.value.trim(),
            set: setField.value.trim(),
            year: yearField.value.trim(),
            number: numberField.value.trim(),
            condition: conditionField.value,
            status: statusField.value,
            value: valueField.value.trim(),
            image: pendingImageData || ""
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

        resetForm();
        renderCards();

    });

    modalElement.addEventListener("hidden.bs.modal", () => {
        editIndex = -1;
        resetForm();
    });

    searchBox.addEventListener("input", renderCards);
    sortField?.addEventListener("change", () => {
        updateSortIndicators();
        renderCards();
    });
    sortOrder?.addEventListener("change", () => {
        updateSortIndicators();
        renderCards();
    });

    updateSortIndicators();
    renderCards();

});