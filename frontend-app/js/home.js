document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  fetchRestaurants();

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = document.getElementById("searchInput").value;
    fetchRestaurants(keyword);
  });
});

function updateNavbar() {
  const navAuth = document.getElementById("nav-auth");
  const sessionRaw = localStorage.getItem("user_session");
  const navHistory = document.getElementById("nav-history");

  if (sessionRaw) {
    const user = JSON.parse(sessionRaw);
    const firstName = user.name ? user.name.split(" ")[0] : "User";
    const initial = firstName.charAt(0).toUpperCase();
    if (navHistory) {
      navHistory.classList.remove("d-none");
    }
    navAuth.innerHTML = `
      <div class="user-greeting">
      
      <span class="fw-bold text-dark" style="font-size: 1.15rem;">Hi, ${firstName}!</span>
         <button class="btn-logout-modern" data-bs-toggle="modal" data-bs-target="#logoutModal">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
     
    `;
  } else {
    if (navHistory) {
      navHistory.classList.add("d-none");
    }
    navAuth.innerHTML = `
      <a href="login.html" class="btn-login-nav shadow-sm">
        <i class="bi bi-person-circle me-1"></i> Masuk
      </a>
    `;
  }
}
function executeLogout() {
  localStorage.removeItem("user_session");

  const modalElement = document.getElementById("logoutModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }

  window.location.href = "login.html";
}

async function fetchRestaurants(keyword = "") {
  const container = document.getElementById("restaurant-container");
  const countLabel = document.querySelector(".text-muted.small");

  container.innerHTML =
    '<div class="text-center w-100 py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Memuat restoran...</p></div>';

  try {
    const baseUrl = "http://localhost:3001/api/restaurants";
    const url = keyword
      ? `${baseUrl}?search=${encodeURIComponent(keyword)}`
      : baseUrl;

    const response = await fetch(url);
    const result = await response.json();
    const restaurants = result.data || [];

    countLabel.innerText = `${restaurants.length} Restoran ditemukan`;

    renderRestaurants(restaurants);
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    container.innerHTML =
      '<div class="alert alert-danger w-100">Gagal memuat data restoran. Pastikan server port 3001 berjalan.</div>';
  }
}

function renderRestaurants(restaurants) {
  const container = document.getElementById("restaurant-container");
  if (!container) return;
  container.innerHTML = "";

  restaurants.forEach((resto) => {
    const baseUrl = "http://localhost:3001";

    const imageSrc = resto.image
      ? resto.image.startsWith("http")
        ? resto.image
        : `${baseUrl}${resto.image}`
      : "https://via.placeholder.com/300";

    const card = `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm" style="border-radius: 16px; overflow: hidden;">
                    <img src="${imageSrc}" class="card-img-top" alt="${resto.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge ${resto.is_active ? "bg-success" : "bg-danger"} small">
                                ${resto.is_active ? "Buka" : "Tutup"}
                            </span>
                        </div>
                        <h5 class="fw-bold mb-1">${resto.name}</h5>
                        <p class="text-muted small mb-3">${resto.address}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="text-warning small">
                                ${renderStars(resto.rating)}
                            </div>
                            <a href="detail.html?id=${resto.id}" class="btn btn-outline-primary btn-sm px-3" style="border-radius: 50px;">Detail</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    container.innerHTML += card;
  });
}

function renderStars(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    stars +=
      i < rating
        ? '<i class="bi bi-star-fill"></i>'
        : '<i class="bi bi-star"></i>';
  }
  return stars;
}
