document.addEventListener("DOMContentLoaded", () => {
    const ordersTable = document.getElementById("ordersTable");
    const ordersEmpty = document.getElementById("ordersEmpty");
    const ordersSearch = document.getElementById("ordersSearch");
    const ordersStatusFilter = document.getElementById("ordersStatusFilter");
    const ordersSortOrder = document.getElementById("ordersSortOrder");
    const ordersClearFilters = document.getElementById("ordersClearFilters");

    const ordersPendingCount = document.getElementById("ordersPendingCount");
    const ordersPaidCount = document.getElementById("ordersPaidCount");
    const ordersShippedCount = document.getElementById("ordersShippedCount");
    const ordersDeliveredCount = document.getElementById("ordersDeliveredCount");

    function formatPrice(value) {
        return "₱" + Number(value || 0).toLocaleString();
    }

    function formatDate(timestamp) {
        return timestamp ? new Date(timestamp).toLocaleDateString() : "N/A";
    }

    function getFilteredOrders() {
        const searchTerm = ordersSearch?.value.trim().toLowerCase() || "";
        const statusTerm = ordersStatusFilter?.value || "all";
        const sortOrder = ordersSortOrder?.value || "newest";

        return getOrders()
            .filter(order => {
                const normalized = [order.player, order.brand, order.set, order.status]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                const matchesSearch = normalized.includes(searchTerm);
                const matchesStatus = statusTerm === "all" || order.status === statusTerm;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortOrder === "newest") {
                    return (b.createdAt || 0) - (a.createdAt || 0);
                }
                if (sortOrder === "oldest") {
                    return (a.createdAt || 0) - (b.createdAt || 0);
                }
                if (sortOrder === "priceAsc") {
                    return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                }
                if (sortOrder === "priceDesc") {
                    return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
                }
                return 0;
            });
    }

    function renderOrderCounts(orders) {
        if (ordersPendingCount) ordersPendingCount.textContent = orders.filter(order => order.status === "Pending").length;
        if (ordersPaidCount) ordersPaidCount.textContent = orders.filter(order => order.status === "Paid").length;
        if (ordersShippedCount) ordersShippedCount.textContent = orders.filter(order => order.status === "Shipped").length;
        if (ordersDeliveredCount) ordersDeliveredCount.textContent = orders.filter(order => order.status === "Delivered").length;
    }

    function updateOrderStatus(orderId, status) {
        const orders = getOrders();
        const index = orders.findIndex(order => order.id === orderId);
        if (index === -1) return;

        orders[index].status = status;
        orders[index].updatedAt = Date.now();
        saveOrders(orders);
        addActivity(`Order for ${orders[index].player || "card"} marked ${status}`, "info");
        renderOrders();
    }

    function renderOrders() {
        const allOrders = getOrders();
        const orders = getFilteredOrders();

        renderOrderCounts(allOrders);

        if (!ordersTable || !ordersEmpty) {
            return;
        }

        if (orders.length === 0) {
            ordersTable.innerHTML = "";
            ordersEmpty.style.display = "block";
            return;
        }

        ordersEmpty.style.display = "none";
        ordersTable.innerHTML = orders.map(order => `
            <tr>
                <td>${order.player || "Unknown"}</td>
                <td>${order.brand || "Unknown"}</td>
                <td>${order.set || "Unknown"}</td>
                <td>${formatPrice(order.price)}</td>
                <td><span class="badge bg-${order.status === "Paid" ? "success" : order.status === "Shipped" ? "warning" : order.status === "Delivered" ? "secondary" : order.status === "Cancelled" ? "danger" : "info"}">${order.status || "Pending"}</span></td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-success update-order-status" data-id="${order.id}" data-status="Paid">Paid</button>
                        <button type="button" class="btn btn-sm btn-outline-info update-order-status" data-id="${order.id}" data-status="Packing">Packing</button>
                        <button type="button" class="btn btn-sm btn-outline-warning update-order-status" data-id="${order.id}" data-status="Shipped">Shipped</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary update-order-status" data-id="${order.id}" data-status="Delivered">Delivered</button>
                        <button type="button" class="btn btn-sm btn-outline-danger update-order-status" data-id="${order.id}" data-status="Cancelled">Cancel</button>
                    </div>
                </td>
            </tr>
        `).join("");

        document.querySelectorAll(".update-order-status").forEach(button => {
            button.addEventListener("click", () => {
                updateOrderStatus(button.dataset.id, button.dataset.status);
            });
        });
    }

    ordersSearch?.addEventListener("input", renderOrders);
    ordersStatusFilter?.addEventListener("change", renderOrders);
    ordersSortOrder?.addEventListener("change", renderOrders);
    ordersClearFilters?.addEventListener("click", () => {
        if (ordersSearch) ordersSearch.value = "";
        if (ordersStatusFilter) ordersStatusFilter.value = "all";
        if (ordersSortOrder) ordersSortOrder.value = "newest";
        renderOrders();
    });

    renderOrders();
    window.addEventListener("orders:updated", renderOrders);
});
