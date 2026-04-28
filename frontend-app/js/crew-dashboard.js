// Konfigurasi API
const MENU_API = "http://localhost:3001/api";
const ORDER_API = "http://localhost:3002/api";

const checkRole = localStorage.getItem("user_role");

// Jika belum login atau rolenya bukan crew, tendang kembali ke home atau login
if (!checkRole || checkRole != "crew") {
  alert("Akses Ditolak! Halaman ini khusus untuk Crew Restoran.");
  window.location.href = "login.html"; // Atau home.html
}

// Simulasi Sesi Login Crew
// Di aplikasi nyata, ini diset saat form login crew berhasil
if (!localStorage.getItem("crew_resto_id")) {
  localStorage.setItem("crew_resto_id", "1"); // Default fallback untuk testing
}
const CREW_RESTO_ID = localStorage.getItem("crew_resto_id");

document.addEventListener("DOMContentLoaded", () => {
  let crewName = "Crew";
  const sessionData = localStorage.getItem("user_session");

  if (sessionData) {
    const parsedSession = JSON.parse(sessionData);
    crewName = parsedSession.name || "Crew";
  }

  // Tampilkan di Navbar
  document.getElementById("crew-greeting").innerHTML =
    `Halo, <span class="fw-bold text-dark">Crew ${crewName}</span>!`;

  // Load data lainnya
  loadRestoProfile();
  loadOrders();
  loadMenus();
});

// ==========================================
// 1. MANAJEMEN PESANAN (ORDERS)
// ==========================================
async function loadOrders() {
  const tbody = document.getElementById("table-orders");
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary spinner-border-sm"></div> Memuat...</td></tr>`;

  try {
    // Asumsi Order Service memiliki endpoint untuk menarik berdasarkan restaurant_id
    // Jika tidak ada, fetch semua lalu filter di frontend
    const res = await fetch(`${ORDER_API}/orders`);
    const result = await res.json();

    let orders = result.data || [];
    // Filter hanya untuk restoran crew ini, dan urutkan yang terbaru di atas
    orders = orders.filter((o) => o.restaurant_id == CREW_RESTO_ID).reverse();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Belum ada pesanan masuk.</td></tr>`;
      return;
    }

    let html = "";
    orders.forEach((order) => {
      let badge = "bg-secondary";
      let actionBtn = "-";

      if (order.status === "Pending") {
        badge = "bg-warning text-dark";
        actionBtn = `<button class="btn btn-sm btn-success fw-medium" onclick="approveOrder(${order.id})"><i class="bi bi-check-lg"></i> Terima Pesanan</button>`;
      } else if (order.status === "Diproses") {
        badge = "bg-info text-dark";
        actionBtn = `<button class="btn btn-sm btn-primary fw-medium" onclick="finishOrder(${order.id})"><i class="bi bi-flag"></i> Selesaikan</button>`;
      } else {
        badge = "bg-success";
        actionBtn = `<span class="text-muted small"><i class="bi bi-check-all"></i> Selesai</span>`;
      }

      html += `
                <tr>
                    <td class="fw-bold">#ORD-${order.id}</td>
                    <td class="text-primary fw-semibold">Rp ${parseInt(order.total_amount).toLocaleString("id-ID")}</td>
                    <td><span class="badge ${badge} px-2 py-1">${order.status}</span></td>
                    <td class="text-center">${actionBtn}</td>
                </tr>
            `;
    });
    tbody.innerHTML = html;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat pesanan.</td></tr>`;
  }
}

// Fungsi untuk menerima pesanan (Mengubah status di Service Order)
async function approveOrder(orderId) {
  if (!confirm("Terima pesanan ini dan mulai proses memasak?")) return;
  updateOrderStatus(orderId, "Diproses");
}

async function finishOrder(orderId) {
  if (!confirm("Tandai pesanan ini selesai dan siap diambil/diantar?")) return;
  updateOrderStatus(orderId, "Selesai");
}

// Harus dipastikan Backend Order Service (Port 3002) memiliki endpoint PUT /api/orders/:id
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${ORDER_API}/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      loadOrders(); // Refresh tabel
    } else {
      alert("Gagal mengupdate status pesanan.");
    }
  } catch (e) {
    console.error(e);
    alert("Terjadi kesalahan koneksi ke Order Service.");
  }
}

// ==========================================
// 2. MANAJEMEN MENU (CRUD)
// ==========================================
let menuModalInstance;

async function loadMenus() {
  const tbody = document.getElementById("table-menus");
  try {
    const res = await fetch(
      `${MENU_API}/menus/detail?restaurant_id=${CREW_RESTO_ID}`,
    );
    const result = await res.json();
    const menus = result.data || [];

    let html = "";
    menus.forEach((menu) => {
      // Encode data untuk dikirim ke function JS tanpa merusak HTML quotes
      const desc = menu.description || "-";
      const safeDesc = desc.replace(/'/g, "\\'");
      const safeName = menu.name.replace(/'/g, "\\'");

      html += `
                <tr>
                    <td class="fw-bold text-dark">${menu.name}</td>
                    <td>Rp ${parseInt(menu.price).toLocaleString("id-ID")}</td>
                    <td class="text-muted small">${desc}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-light border me-1" onclick="openMenuModal('${menu.id}', '${safeName}', '${menu.price}', '${safeDesc}')"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMenu(${menu.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
    });
    tbody.innerHTML =
      html ||
      `<tr><td colspan="4" class="text-center text-muted">Belum ada menu.</td></tr>`;
  } catch (e) {
    console.error(e);
  }
}

function openMenuModal(id = "", name = "", price = "", desc = "") {
  document.getElementById("menu-id").value = id;
  document.getElementById("menu-name").value = name;
  document.getElementById("menu-price").value = price;
  document.getElementById("menu-desc").value = desc !== "-" ? desc : "";

  document.getElementById("menuModalTitle").innerText = id
    ? "Edit Menu"
    : "Tambah Menu Baru";

  if (!menuModalInstance) {
    menuModalInstance = new bootstrap.Modal(
      document.getElementById("menuModal"),
    );
  }
  menuModalInstance.show();
}

async function saveMenu() {
  const id = document.getElementById("menu-id").value;
  const payload = {
    restaurant_id: CREW_RESTO_ID,
    crew_restaurant_id: CREW_RESTO_ID, // Otorisasi validasi backend
    name: document.getElementById("menu-name").value,
    price: document.getElementById("menu-price").value,
    description: document.getElementById("menu-desc").value,
  };

  const url = id ? `${MENU_API}/menus/${id}` : `${MENU_API}/menus`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      menuModalInstance.hide();
      loadMenus(); // Refresh Data
    } else {
      const err = await res.json();
      alert("Gagal menyimpan menu: " + err.message);
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteMenu(id) {
  if (!confirm("Hapus menu ini secara permanen?")) return;
  try {
    const res = await fetch(`${MENU_API}/menus/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crew_restaurant_id: CREW_RESTO_ID }),
    });
    if (res.ok) loadMenus();
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// 3. PROFIL RESTORAN
// ==========================================
async function loadRestoProfile() {
  try {
    const res = await fetch(
      `${MENU_API}/restaurants/detail?id=${CREW_RESTO_ID}`,
    );
    const result = await res.json();
    const resto = result.data;

    // Set Text di Header
    document.getElementById("dash-resto-name").innerText = resto.name;
    document.getElementById("dash-resto-address").innerText = resto.address;

    // Set Value di Form Edit
    document.getElementById("prof-name").value = resto.name;
    document.getElementById("prof-address").value = resto.address;
    document.getElementById("prof-hours").value = resto.jam_operasional || "";
    document.getElementById("prof-desc").value = resto.deskripsi || "";
    document.getElementById("prof-active").value = resto.is_active ? "1" : "0";
  } catch (e) {
    console.error("Gagal memuat profil restoran");
  }
}

async function saveRestoProfile() {
  // Karena kita tidak mengupload gambar di dashboard ini, kita kirimkan data JSON biasa
  const payload = {
    name: document.getElementById("prof-name").value,
    address: document.getElementById("prof-address").value,
    jam_operasional: document.getElementById("prof-hours").value,
    deskripsi: document.getElementById("prof-desc").value,
    crew_restaurant_id: CREW_RESTO_ID, // Validasi backend
  };

  try {
    const res = await fetch(`${MENU_API}/restaurants/${CREW_RESTO_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Profil restoran berhasil diperbarui!");
      loadRestoProfile(); // Refresh tampilan text di header
    } else {
      alert("Gagal memperbarui profil.");
    }
  } catch (e) {
    console.error(e);
  }
}

function executeLogout() {
  localStorage.removeItem("user_session");
  localStorage.removeItem("user_role");
  localStorage.removeItem("crew_resto_id");
  window.location.href = "home.html";
}
