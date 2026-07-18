const STORAGE_KEY = "rs_hobby_collection";

function getCards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveCards(cards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}