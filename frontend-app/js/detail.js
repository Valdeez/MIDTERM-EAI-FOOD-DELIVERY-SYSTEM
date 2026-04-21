// detail.js

document.addEventListener("DOMContentLoaded", () => {
    // Mengambil ID dari parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');

    if (restaurantId) {
        fetchRestaurantDetail(restaurantId);
        fetchRestaurantMenus(restaurantId);
    } else {
        alert("Restoran tidak ditemukan!");
        window.location.href = "home.html";
    }
});

// 1. Ambil Detail Restoran
async function fetchRestaurantDetail(id) {
    try {
        const response = await fetch(`http://localhost:3001/api/restaurants/detail?id=${id}`);
        const result = await response.json();
        const resto = result.data;

        // Update UI (Pastikan ID elemen ini sesuai dengan HTML kamu)
        document.getElementById("resto-name").innerText = resto.name;
        document.getElementById("resto-address").innerText = resto.address;
        document.getElementById("resto-description").innerText = resto.deskripsi || "Tidak ada deskripsi.";
        document.getElementById("resto-hours").innerText = resto.jam_operasional || "-";
        document.getElementById("resto-image").src = resto.image || "https://via.placeholder.com/800";
    } catch (error) {
        console.error("Gagal mengambil detail restoran:", error);
    }
}

// 2. Ambil Daftar Menu Restoran
async function fetchRestaurantMenus(id) {
    try {
        const response = await fetch(`http://localhost:3001/api/menus/detail?restaurant_id=${id}`);
        const result = await response.json();
        
        renderMenus(result.data);
    } catch (error) {
        console.error("Gagal mengambil menu:", error);
    }
}

function renderMenus(menus) {
    const menuContainer = document.getElementById("menu-items");
    menuContainer.innerHTML = "";

    if (menus.length === 0) {
        menuContainer.innerHTML = '<p class="text-muted">Belum ada menu tersedia.</p>';
        return;
    }

    menus.forEach(menu => {
        const item = `
            <div class="menu-item-card">
                <div>
                    <h6 class="mb-1 fw-bold">${menu.name}</h6>
                    <span class="text-primary fw-bold small">Rp ${parseInt(menu.price).toLocaleString('id-ID')}</span>
                </div>
                <div class="qty-picker">
                    <button class="btn-qty" onclick="changeQty('${menu.id}', -1, '${menu.name}', ${menu.price})">-</button>
                    <span id="qty-${menu.id}" class="fw-bold">0</span>
                    <button class="btn-qty" onclick="changeQty('${menu.id}', 1, '${menu.name}', ${menu.price})">+</button>
                </div>
            </div>
        `;
        menuContainer.innerHTML += item;
    });
}