/* ==========================================================
   RS Hobby Shop v2
   Public Homepage
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadMarketplace();
    loadAuctions();
    enableSearch();
});

/* ==========================================================
   SAMPLE DATA
========================================================== */

const marketplace = [
    {
        player: "Victor Wembanyama",
        title: "Prizm Rookie Card",
        price: "₱8,500",
        image: "images/placeholders/card.png"
    },
    {
        player: "LeBron James",
        title: "Mosaic PSA 10",
        price: "₱12,000",
        image: "images/placeholders/card.png"
    },
    {
        player: "Michael Jordan",
        title: "Upper Deck",
        price: "₱25,000",
        image: "images/placeholders/card.png"
    },
    {
        player: "Stephen Curry",
        title: "Select Courtside",
        price: "₱7,500",
        image: "images/placeholders/card.png"
    }
];

const auctions = [
    {
        title: "Anthony Edwards Auto",
        bid: "₱6,000",
        time: "2h 18m",
        image: "images/placeholders/card.png"
    },
    {
        title: "Kobe Bryant Jersey Card",
        bid: "₱9,500",
        time: "45m",
        image: "images/placeholders/card.png"
    },
    {
        title: "Luka Doncic Rookie",
        bid: "₱8,800",
        time: "6h",
        image: "images/placeholders/card.png"
    }
];

const createMarketplaceCard = ({ image, player, title, price }) => `
    <div class="col-lg-3 col-md-6">
        <div class="preview-card">
            <div class="preview-image">
                <img src="${image}" class="img-fluid w-100 h-100 object-fit-cover" alt="${player}">
            </div>
            <div class="preview-body">
                <div class="preview-title">${player}</div>
                <div class="text-secondary mb-3">${title}</div>
                <div class="preview-price">${price}</div>
                <button class="btn btn-success w-100 mt-3">View Listing</button>
            </div>
        </div>
    </div>
`;

const createAuctionCard = ({ image, title, bid, time }) => `
    <div class="col-lg-4">
        <div class="preview-card">
            <div class="preview-image">
                <img src="${image}" class="img-fluid w-100 h-100 object-fit-cover" alt="${title}">
            </div>
            <div class="preview-body">
                <h5>${title}</h5>
                <p class="text-secondary">Current Bid</p>
                <div class="preview-price">${bid}</div>
                <p class="mt-3">Ends in <strong>${time}</strong></p>
                <button class="btn btn-outline-light w-100">Bid Now</button>
            </div>
        </div>
    </div>
`;

function loadMarketplace() {
    const container = document.getElementById("marketplaceCards");
    if (!container) return;
    container.innerHTML = marketplace.map(createMarketplaceCard).join("");
}

function loadAuctions() {
    const container = document.getElementById("auctionCards");
    if (!container) return;
    container.innerHTML = auctions.map(createAuctionCard).join("");
}

function enableSearch() {
    const search = document.getElementById("searchBox");
    const container = document.getElementById("marketplaceCards");
    if (!search || !container) return;

    search.addEventListener("keyup", function () {
        const keyword = this.value.trim().toLowerCase();
        const cards = keyword
            ? marketplace.filter(card =>
                card.player.toLowerCase().includes(keyword) ||
                card.title.toLowerCase().includes(keyword)
            )
            : marketplace;

        container.innerHTML = cards.map(createMarketplaceCard).join("");
    });
}

/* ==========================================================
   FUTURE FIREBASE
========================================================== */

/*
Replace the sample arrays with Firebase.
Marketplace Collection
Auctions Collection
Users Collection
Messages
Notifications
*/
            container.innerHTML+=`

            <div class="col-lg-3 col-md-6">

                <div class="preview-card">

                    <div class="preview-image">

                        <img
                            src="${card.image}"
                            class="img-fluid w-100 h-100 object-fit-cover">

                    </div>

                    <div class="preview-body">

                        <div class="preview-title">

                            ${card.player}

                        </div>

                        <div class="text-secondary mb-3">

                            ${card.title}

                        </div>

                        <div class="preview-price">

                            ${card.price}

                        </div>

                        <button
                            class="btn btn-success w-100 mt-3">

                            View Listing

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    });

}

/* ==========================================================
   FUTURE FIREBASE
========================================================== */

/*

Replace the sample arrays with Firebase.

Marketplace Collection

Auctions Collection

Users Collection

Messages

Notifications

*/