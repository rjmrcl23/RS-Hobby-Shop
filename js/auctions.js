document.addEventListener("DOMContentLoaded", () => {
    const auctionsList = document.getElementById("auctionsList");
    const auctionsEmpty = document.getElementById("auctionsEmpty");
    const auctionModal = document.getElementById("auctionModal");
    const auctionModalTitle = document.getElementById("auctionModalTitle");
    const auctionModalImage = document.getElementById("auctionModalImage");
    const auctionModalPlayer = document.getElementById("auctionModalPlayer");
    const auctionModalBrand = document.getElementById("auctionModalBrand");
    const auctionModalSet = document.getElementById("auctionModalSet");
    const auctionModalYear = document.getElementById("auctionModalYear");
    const auctionModalCondition = document.getElementById("auctionModalCondition");
    const auctionModalStatus = document.getElementById("auctionModalStatus");
    const auctionModalTimer = document.getElementById("auctionModalTimer");
    const auctionModalReserve = document.getElementById("auctionModalReserve");
    const auctionModalCurrentBid = document.getElementById("auctionModalCurrentBid");
    const auctionModalBidder = document.getElementById("auctionModalBidder");
    const auctionBidAmount = document.getElementById("auctionBidAmount");
    const auctionBidFeedback = document.getElementById("auctionBidFeedback");
    const auctionBidHistory = document.getElementById("auctionBidHistory");
    const auctionPlaceBid = document.getElementById("auctionPlaceBid");

    let activeAuction = null;
    let countdownTimer = null;
    let auctionModalInstance = null;

    function formatPrice(value) {
        return "₱" + Number(value || 0).toLocaleString();
    }

    function formatDate(timestamp) {
        return timestamp ? new Date(timestamp).toLocaleString() : "N/A";
    }

    function formatTimeRemaining(ms) {
        if (ms <= 0) {
            return "Ended";
        }

        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        const parts = [];
        if (days) parts.push(`${days}d`);
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);

        return parts.join(" ");
    }

    function normalizeAuctionStatuses(auctions) {
        const now = Date.now();
        let modified = false;

        const nextAuctions = auctions.map(auction => {
            if (auction.endsAt && auction.status === "Live" && now >= Number(auction.endsAt)) {
                modified = true;
                return {
                    ...auction,
                    status: "Closed",
                    endedAt: auction.endsAt
                };
            }

            return auction;
        });

        if (modified) {
            saveAuctions(nextAuctions);
        }

        return nextAuctions;
    }

    function getCurrentAuctions() {
        const auctions = syncAuctionsFromCards(getCards());
        return normalizeAuctionStatuses(auctions);
    }

    function renderBidHistory(bids = []) {
        if (!bids.length) {
            return `<div class="text-muted">No bids yet.</div>`;
        }

        return bids.slice().reverse().map(bid => `
            <div class="list-group-item list-group-item-dark border-0 py-2">
                <div class="d-flex justify-content-between">
                    <span>${bid.bidder}</span>
                    <span>${formatPrice(bid.amount)}</span>
                </div>
                <small class="text-muted">${formatDate(bid.placedAt)}</small>
            </div>
        `).join("");
    }

    function buildAuctionCard(auction) {
        const timeRemaining = auction.endsAt ? formatTimeRemaining(Number(auction.endsAt) - Date.now()) : "N/A";
        const statusClass = auction.status === "Live" ? "warning" : auction.status === "Closed" ? "secondary" : "info";

        return `
            <div class="col-md-6">
                <div class="card bg-dark border-secondary h-100 auction-card" data-id="${auction.id}">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="mb-1">${auction.player || "Unknown"}</h5>
                                <p class="text-muted mb-0">${auction.brand || "Unknown"} • ${auction.set || "Unknown"}</p>
                            </div>
                            <span class="badge bg-${statusClass} text-dark">${auction.status || "Live"}</span>
                        </div>
                        <p class="mb-2">Current Bid: <strong>${formatPrice(auction.currentBid || auction.reservePrice || 0)}</strong></p>
                        <p class="mb-2">Highest Bidder: <strong>${auction.bidder || "No bids yet"}</strong></p>
                        <p class="mb-2 text-muted">Reserve: ${formatPrice(auction.reservePrice || 0)}</p>
                        <p class="mb-3 text-muted">Time Remaining: ${timeRemaining}</p>
                        <div class="mt-auto">
                            <button class="btn btn-outline-light btn-sm w-100 view-auction" data-id="${auction.id}">${auction.status === "Live" ? "View & Bid" : "View Details"}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderAuctions() {
        const auctions = getCurrentAuctions();

        if (!auctionsList || !auctionsEmpty) {
            return;
        }

        if (!auctions.length) {
            auctionsList.innerHTML = "";
            auctionsEmpty.style.display = "block";
            return;
        }

        auctionsEmpty.style.display = "none";
        auctionsList.innerHTML = auctions.map(buildAuctionCard).join("");

        document.querySelectorAll(".view-auction").forEach(button => {
            button.addEventListener("click", () => {
                openAuctionModal(button.dataset.id);
            });
        });
    }

    function populateAuctionModal(auction, resetBid = true) {
        if (!auction) return;

        activeAuction = auction;
        auctionModalTitle.textContent = auction.player || "Auction Details";
        auctionModalImage.src = auction.image || "../images/logos/logo.png";
        auctionModalPlayer.textContent = auction.player || "Unknown";
        auctionModalBrand.textContent = auction.brand || "Unknown";
        auctionModalSet.textContent = auction.set || "Unknown";
        auctionModalYear.textContent = auction.year || "Unknown";
        auctionModalCondition.textContent = auction.condition || "N/A";
        auctionModalStatus.textContent = auction.status || "Live";
        auctionModalTimer.textContent = auction.endsAt ? formatTimeRemaining(Number(auction.endsAt) - Date.now()) : "N/A";
        auctionModalReserve.textContent = formatPrice(auction.reservePrice || 0);
        auctionModalCurrentBid.textContent = formatPrice(auction.currentBid || auction.reservePrice || 0);
        auctionModalBidder.textContent = auction.bidder || "No bids yet";
        auctionBidHistory.innerHTML = renderBidHistory(auction.bids);
        auctionBidFeedback.classList.add("d-none");
        auctionBidFeedback.textContent = "";

        const nextBid = Number(auction.currentBid || auction.reservePrice || 0) + 10;
        if (resetBid) auctionBidAmount.value = nextBid;
        auctionBidAmount.disabled = auction.status !== "Live";
        auctionPlaceBid.disabled = auction.status !== "Live";
    }

    function openAuctionModal(auctionId) {
        const auctions = getCurrentAuctions();
        const auction = auctions.find(item => item.id === auctionId);

        if (!auction || !auctionModal) {
            return;
        }

        populateAuctionModal(auction);
        auctionModalInstance = bootstrap.Modal.getOrCreateInstance(auctionModal);
        auctionModalInstance.show();
    }

    function placeBidHandler() {
        if (!activeAuction) {
            return;
        }

        const auctions = getCurrentAuctions();
        const auction = auctions.find(item => item.id === activeAuction.id);

        if (!auction) {
            return;
        }

        const amount = Number(auctionBidAmount.value);
        const minimum = Number(auction.currentBid || auction.reservePrice || 0) + 1;

        if (!amount || amount < minimum) {
            auctionBidFeedback.classList.remove("d-none");
            auctionBidFeedback.textContent = `Enter a bid greater than ${formatPrice(minimum - 1)}.`;
            return;
        }

        if (!placeBid(auction.id, amount, "You")) {
            auctionBidFeedback.classList.remove("d-none");
            auctionBidFeedback.textContent = "Bid not accepted. Auction may have ended or the amount is too low.";
            return;
        }

        addActivity(`Placed a bid of ${formatPrice(amount)} on ${auction.player || "an auction"}`, "success");

        renderAuctions();
        populateAuctionModal(getAuctions().find(item => item.id === auction.id));
    }

    auctionPlaceBid?.addEventListener("click", placeBidHandler);

    function startCountdown() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }

        countdownTimer = setInterval(() => {
            renderAuctions();

            if (activeAuction && auctionModal?.classList.contains("show")) {
                const current = getAuctions().find(item => item.id === activeAuction.id);
                populateAuctionModal(current, false);
            }
        }, 1000);
    }

    renderAuctions();
    startCountdown();

    window.addEventListener("cards:updated", () => {
        renderAuctions();
        startCountdown();
    });
    window.addEventListener("storage", () => {
        renderAuctions();
        startCountdown();
    });
    auctionModal?.addEventListener("hidden.bs.modal", () => {
        activeAuction = null;
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("padding-right");
    });
});
