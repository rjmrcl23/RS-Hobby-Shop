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
    const selectAllCards = document.getElementById("selectAllCards");
    const bulkStatus = document.getElementById("bulkStatus");
    const bulkApply = document.getElementById("bulkApply");
    const bulkDelete = document.getElementById("bulkDelete");
    const undoDelete = document.getElementById("undoDelete");
    const feedback = document.getElementById("collectionFeedback");
    const importInput = document.getElementById("collectionImportInput");

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
    const notesField = document.getElementById("notes");

    let editIndex = -1;
    let pendingImageData = "";
    let selectedIds = new Set();
    let lastDeleted = [];

    const showFeedback = message => { if (feedback) feedback.textContent = message; };
    const download = (content, name, type) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([content], { type }));
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    function resetForm() {
        playerField.value = "";
        brandField.value = "";
        setField.value = "";
        yearField.value = "";
        numberField.value = "";
        valueField.value = "";
        notesField.value = "";

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

    function createCardId() {
        return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function buildCardData(raw, existing = {}) {
        return {
            id: existing.id || createCardId(),
            player: raw.player,
            brand: raw.brand,
            set: raw.set,
            year: raw.year,
            number: raw.number,
            condition: raw.condition,
            status: raw.status,
            value: raw.value,
            image: raw.image,
            notes: existing.notes || raw.notes || "",
            createdAt: existing.createdAt || Date.now(),
            updatedAt: Date.now()
        };
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
                <td><input class="select-card" type="checkbox" data-id="${card.id}" ${selectedIds.has(card.id) ? "checked" : ""} aria-label="Select ${card.player || "card"}"></td>
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
                const removed = cards.splice(Number(btn.dataset.index), 1);
                lastDeleted = removed;
                undoDelete.disabled = false;
                selectedIds.delete(removed[0]?.id);
                saveCards(cards);
                addActivity(`Deleted ${removed[0]?.player || "card"}`, "warning");
                renderCards();

            });

        });

        document.querySelectorAll(".select-card").forEach(box => box.addEventListener("change", () => {
            box.checked ? selectedIds.add(box.dataset.id) : selectedIds.delete(box.dataset.id);
            if (selectAllCards) selectAllCards.checked = selectedIds.size === filtered.length && filtered.length > 0;
        }));
        if (selectAllCards) selectAllCards.checked = selectedIds.size === filtered.length && filtered.length > 0;

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
                notesField.value = card.notes || "";

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
            notes: notesField.value.trim(),
            image: pendingImageData || ""
        };

        if (card.player === "") {
            alert("Please enter a player.");
            return;
        }

        const cards = getCards();

        const isEditing = editIndex !== -1;
        if (!isEditing) {
            cards.push(buildCardData(card));
        } else {
            cards[editIndex] = buildCardData(card, cards[editIndex]);
            editIndex = -1;
        }

        saveCards(cards);
        addActivity(`${isEditing ? "Updated" : "Added"} ${card.player}`, "success");

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
    const query = new URLSearchParams(window.location.search).get("search");
    if (query) { searchBox.value = query; }
    sortField?.addEventListener("change", () => {
        updateSortIndicators();
        renderCards();
    });
    sortOrder?.addEventListener("change", () => {
        updateSortIndicators();
        renderCards();
    });

    selectAllCards?.addEventListener("change", () => {
        const visible = Array.from(table.querySelectorAll(".select-card")).map(box => box.dataset.id);
        visible.forEach(id => selectAllCards.checked ? selectedIds.add(id) : selectedIds.delete(id));
        renderCards();
    });
    bulkApply?.addEventListener("click", () => {
        if (!bulkStatus.value || !selectedIds.size) return showFeedback("Select cards and a status first.");
        const cards = getCards().map(card => selectedIds.has(card.id) ? { ...card, status: bulkStatus.value, updatedAt: Date.now() } : card);
        saveCards(cards); addActivity(`Updated ${selectedIds.size} card(s) to ${bulkStatus.value}`, "success"); showFeedback("Selected cards updated."); renderCards();
    });
    bulkDelete?.addEventListener("click", () => {
        if (!selectedIds.size) return showFeedback("Select cards to delete.");
        const cards = getCards(); lastDeleted = cards.filter(card => selectedIds.has(card.id));
        saveCards(cards.filter(card => !selectedIds.has(card.id))); selectedIds.clear(); undoDelete.disabled = false;
        addActivity(`Deleted ${lastDeleted.length} card(s)`, "warning"); showFeedback("Selected cards deleted. You can undo this action."); renderCards();
    });
    undoDelete?.addEventListener("click", () => {
        if (!lastDeleted.length) return;
        saveCards([...getCards(), ...lastDeleted]); addActivity(`Restored ${lastDeleted.length} card(s)`, "success");
        lastDeleted = []; undoDelete.disabled = true; showFeedback("Cards restored."); renderCards();
    });
    document.getElementById("collectionExportJson")?.addEventListener("click", () => download(JSON.stringify(getCards(), null, 2), "rs-hobby-collection.json", "application/json"));
    document.getElementById("collectionExportCsv")?.addEventListener("click", () => {
        const fields = ["id", "player", "brand", "set", "year", "number", "condition", "status", "value", "notes", "createdAt", "updatedAt"];
        const csv = [fields.join(","), ...getCards().map(card => fields.map(field => `\"${String(card[field] || "").replaceAll("\"", "\"\"")}\"`).join(","))].join("\n");
        download(csv, "rs-hobby-collection.csv", "text/csv");
    });
    importInput?.addEventListener("change", event => {
        const file = event.target.files?.[0]; if (!file) return;
        const reader = new FileReader(); reader.onload = () => { try {
            const incoming = JSON.parse(reader.result); if (!Array.isArray(incoming)) throw new Error();
            const valid = incoming.filter(card => card && typeof card === "object" && card.player).map(card => buildCardData(card, card));
            saveCards([...getCards(), ...valid]); addActivity(`Imported ${valid.length} card(s)`, "success"); showFeedback(`${valid.length} cards imported.`); renderCards();
        } catch { showFeedback("Import failed: choose a valid collection JSON file."); } }; reader.readAsText(file); event.target.value = "";
    });

    updateSortIndicators();
    renderCards();

});
