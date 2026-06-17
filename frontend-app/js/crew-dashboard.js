const BASE_URL = "http://localhost:3000";

const checkRole = localStorage.getItem("user_role");

if (!checkRole || checkRole != "crew") {
  alert("Akses Ditolak! Halaman ini khusus untuk Crew Restoran.");
  window.location.href = "login.html";
}

if (!localStorage.getItem("crew_resto_id")) {
  localStorage.setItem("crew_resto_id", "1");
}
const CREW_RESTO_ID = localStorage.getItem("crew_resto_id");

document.addEventListener("DOMContentLoaded", () => {
  let crewName = "Crew";
  const sessionData = localStorage.getItem("user_session");

  if (sessionData) {
    const parsedSession = JSON.parse(sessionData);
    crewName = parsedSession.name || "Crew";
  }

  document.getElementById("crew-greeting").innerHTML =
    `Halo, <span class="fw-bold text-dark">Crew ${crewName}</span>!`;

  loadRestoProfile();
  loadOrders();
  loadMenus();
});

async function loadOrders() {
  const tbody = document.getElementById("table-orders");
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary spinner-border-sm"></div> Memuat...</td></tr>`;

  try {
    const queryAllOrders = `
      query GetAllOrders {
        getOrders {
          id
          restaurant_id
          total_amount
          status
        }
      }
    `;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryAllOrders,
      }),
    });

    const result = await res.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    let orders = result.data.getOrders || [];

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
    console.error("Gagal memuat pesanan:", e);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Gagal memuat pesanan.</td></tr>`;
  }
}

async function approveOrder(orderId) {
  if (!confirm("Terima pesanan ini dan mulai proses memasak?")) return;
  updateOrderStatus(orderId, "Diproses");
}

async function finishOrder(orderId) {
  if (!confirm("Tandai pesanan ini selesai dan siap diambil/diantar?")) return;
  updateOrderStatus(orderId, "Selesai");
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const updateMutation = `
      mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
        updateOrderStatus(id: $orderId, status: $status)
      }
    `;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: updateMutation,
        variables: {
          orderId: orderId.toString(),
          status: newStatus,
        },
      }),
    });

    const result = await res.json();

    if (!result.errors) {
      loadOrders();
    } else {
      console.error("Error GraphQL:", result.errors);
      alert("Gagal mengupdate status pesanan.");
    }
  } catch (e) {
    console.error(e);
    alert("Terjadi kesalahan koneksi ke API Gateway.");
  }
}

let menuModalInstance;

async function loadMenus() {
  const tbody = document.getElementById("table-menus");
  try {
    const queryMenu = `
      query GetMenuDetail($restaurantId: ID!) {
        menuDetail(restaurant_id: $restaurantId) {
          data {
            id
            name
            price
            description
            image
          }
        }
      }
    `;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryMenu,
        variables: { restaurantId: CREW_RESTO_ID.toString() },
      }),
    });

    const result = await res.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const menus =
      result.data && result.data.menuDetail && result.data.menuDetail.data
        ? result.data.menuDetail.data
        : [];

    let html = "";
    menus.forEach((menu) => {
      const desc = menu.description || "-";
      const safeDesc = desc.replace(/'/g, "\\'");
      const safeName = menu.name.replace(/'/g, "\\'");

      // Susun URL Gambar Menu
      const imgUrl = menu.image
        ? `http://localhost:3001${menu.image}`
        : "https://via.placeholder.com/50?text=N/A";

      html += `
                <tr>
                    <td>
                        <img src="${imgUrl}" alt="${safeName}" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;">
                    </td>
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
      `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada menu.</td></tr>`;
  } catch (e) {
    console.error("Gagal memuat daftar menu:", e);
  }
}

function openMenuModal(id = "", name = "", price = "", desc = "") {
  document.getElementById("menu-id").value = id;
  document.getElementById("menu-name").value = name;
  document.getElementById("menu-price").value = price;
  document.getElementById("menu-desc").value = desc !== "-" ? desc : "";
  document.getElementById("menu-image").value = "";

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

  const nameVal = document.getElementById("menu-name").value;
  const priceVal = parseInt(document.getElementById("menu-price").value);
  const descVal = document.getElementById("menu-desc").value;

  let finalImagePath = null;
  const imageFile = document.getElementById("menu-image").files[0];

  try {
    if (imageFile) {
      const imgFormData = new FormData();
      imgFormData.append("image", imageFile);

      const uploadRes = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: imgFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah gambar menu ke server");
      }

      const uploadResult = await uploadRes.json();
      finalImagePath = uploadResult.filePath;
    }

    let queryMutation;
    let variables = {
      name: nameVal,
      price: priceVal,
      description: descVal,
      crewRestaurantId: CREW_RESTO_ID.toString(),
    };

    if (finalImagePath) {
      variables.image = finalImagePath;
    }

    if (id) {
      queryMutation = `
        mutation UpdateMenu(
          $id: ID!
          $name: String!
          $price: Int!
          $description: String
          $crewRestaurantId: ID!
          $image: String
        ) {
          updateMenu(
            id: $id
            name: $name
            price: $price
            description: $description
            crew_restaurant_id: $crewRestaurantId
            image: $image
          ) {
            message
          }
        }
      `;
      variables.id = id.toString();
    } else {
      queryMutation = `
        mutation CreateMenu(
          $restaurantId: ID!
          $name: String!
          $price: Int!
          $description: String
          $crewRestaurantId: ID!
          $image: String
        ) {
          createMenu(
            restaurant_id: $restaurantId
            name: $name
            price: $price
            description: $description
            crew_restaurant_id: $crewRestaurantId
            image: $image
          ) {
            message
          }
        }
      `;
      variables.restaurantId = CREW_RESTO_ID.toString();
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryMutation,
        variables: variables,
      }),
    });

    const result = await res.json();

    if (!result.errors) {
      menuModalInstance.hide();
      loadMenus();
    } else {
      alert("Gagal menyimpan menu: " + result.errors[0].message);
    }
  } catch (e) {
    console.error(e);
    alert(`Terjadi kesalahan: ${e.message}`);
  }
}

async function deleteMenu(id) {
  if (!confirm("Hapus menu ini secara permanen?")) return;

  try {
    const deleteMutation = `
      mutation DeleteMenu($id: ID!, $crewRestaurantId: ID!) {
        deleteMenu(id: $id, crew_restaurant_id: $crewRestaurantId) {
          message
        }
      }
    `;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: deleteMutation,
        variables: {
          id: id.toString(),
          crewRestaurantId: CREW_RESTO_ID.toString(),
        },
      }),
    });

    const result = await res.json();

    if (!result.errors) {
      loadMenus();
    } else {
      alert("Gagal menghapus menu: " + result.errors[0].message);
    }
  } catch (e) {
    console.error(e);
    alert("Terjadi kesalahan jaringan saat menghapus menu.");
  }
}

async function loadRestoProfile() {
  try {
    const queryDetail = `
      query GetRestaurantDetail($id: ID!) {
        restaurantDetail(id: $id) {
          data {
            name
            address
            jam_operasional
            deskripsi
            is_active
            image 
          }
        }
      }
    `;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryDetail,
        variables: { id: CREW_RESTO_ID.toString() },
      }),
    });

    const result = await res.json();
    if (result.errors) throw new Error(result.errors[0].message);

    const resto = result.data.restaurantDetail.data;

    document.getElementById("dash-resto-name").innerText = resto.name;
    document.getElementById("dash-resto-address").innerText = resto.address;
    document.getElementById("dash-resto-hours").innerText =
      resto.jam_operasional || "Jam belum diatur";
    document.getElementById("dash-resto-desc").innerText =
      resto.deskripsi || "Belum ada deskripsi.";

    const statusBadge = document.getElementById("dash-resto-status");
    if (resto.is_active) {
      statusBadge.className = "badge bg-success";
      statusBadge.innerHTML =
        "<i class='bi bi-door-open me-1'></i> Buka / Aktif";
    } else {
      statusBadge.className = "badge bg-danger";
      statusBadge.innerHTML =
        "<i class='bi bi-door-closed me-1'></i> Tutup / Nonaktif";
    }

    const imgElement = document.getElementById("dash-resto-image");
    imgElement.src = resto.image
      ? `http://localhost:3001${resto.image}`
      : "https://via.placeholder.com/150?text=No+Image";

    const profName = document.getElementById("prof-name");
    if (profName) {
      profName.value = resto.name;
      document.getElementById("prof-address").value = resto.address;
      document.getElementById("prof-hours").value = resto.jam_operasional || "";
      document.getElementById("prof-desc").value = resto.deskripsi || "";
      document.getElementById("prof-active").value = resto.is_active
        ? "1"
        : "0";
    }
  } catch (e) {
    console.error("Gagal memuat profil restoran", e);
  }
}

async function saveRestoProfile() {
  const nameVal = document.getElementById("prof-name").value;
  const addressVal = document.getElementById("prof-address").value;
  const jamVal = document.getElementById("prof-hours").value;
  const descVal = document.getElementById("prof-desc").value;
  const isActiveVal = document.getElementById("prof-active").value === "1";

  let finalImagePath = null;
  const imageFile = document.getElementById("prof-image").files[0];

  try {
    if (imageFile) {
      const imgFormData = new FormData();
      imgFormData.append("image", imageFile);

      const uploadRes = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: imgFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Gagal mengunggah gambar ke server");
      }

      const uploadResult = await uploadRes.json();
      finalImagePath = uploadResult.filePath;
    }

    const updateMutation = `
      mutation UpdateRestaurant(
        $id: ID!
        $name: String!
        $address: String!
        $deskripsi: String
        $jam_operasional: String
        $isActive: Boolean!
        $crewRestaurantId: ID!
        $image: String
      ) {
        updateRestaurant(
          id: $id
          name: $name
          address: $address
          deskripsi: $deskripsi
          jam_operasional: $jam_operasional
          is_active: $isActive
          crew_restaurant_id: $crewRestaurantId
          image: $image
        ) {
          message
        }
      }
    `;

    const variables = {
      id: CREW_RESTO_ID.toString(),
      name: nameVal,
      address: addressVal,
      deskripsi: descVal,
      jam_operasional: jamVal,
      isActive: isActiveVal,
      crewRestaurantId: CREW_RESTO_ID.toString(),
    };

    if (finalImagePath) {
      variables.image = finalImagePath;
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: updateMutation,
        variables: variables,
      }),
    });

    const result = await res.json();

    if (!result.errors) {
      alert("Profil restoran berhasil diperbarui!");
      document.getElementById("prof-image").value = "";
      loadRestoProfile();
    } else {
      alert("Gagal memperbarui profil: " + result.errors[0].message);
    }
  } catch (e) {
    console.error(e);
    alert(`Terjadi kesalahan saat menyimpan data: ${e.message}`);
  }
}

function executeLogout() {
  localStorage.removeItem("user_session");
  localStorage.removeItem("user_role");
  localStorage.removeItem("crew_resto_id");
  window.location.href = "home.html";
}
