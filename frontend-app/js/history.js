// file: js/history.js

// Jalankan fungsi muatDataPesanan saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", muatDataPesanan);

async function muatDataPesanan() {
  const tbody = document.getElementById("tabelHistori");
  const userId = 1; // Simulasi user yang sedang login

  tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                Menyinkronkan data...
            </td>
        </tr>
    `;

  try {
    // Memanggil fungsi apiGet dari js/api.js
    const result = await apiGet(`/orders?user_id=${userId}`);

    // Render data ke dalam tabel
    renderTabel(result.data);
  } catch (error) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-danger">
                    <strong>Error:</strong> ${error.message} <br>
                    <small>Pastikan Order Service berjalan di port 3002 dan CORS sudah diaktifkan.</small>
                </td>
            </tr>
        `;
  }
}

function renderTabel(orders) {
  const tbody = document.getElementById("tabelHistori");
  tbody.innerHTML = ""; // Kosongkan tabel

  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-5 text-muted">
                    Anda belum memiliki pesanan.
                    <br><a href="checkout.html" class="btn btn-sm btn-primary mt-2">Buat Pesanan Baru</a>
                </td>
            </tr>
        `;
    return;
  }

  // Balik urutan array agar pesanan terbaru (ID terbesar) ada di paling atas
  orders.reverse().forEach((order) => {
    // Logika pewarnaan badge Bootstrap berdasarkan status
    let badgeColor = "bg-secondary";
    if (order.status === "Pending") badgeColor = "bg-warning text-dark";
    if (order.status === "Diproses") badgeColor = "bg-info text-dark";
    if (order.status === "Selesai") badgeColor = "bg-success";

    // Format angka ke format Rupiah
    const formatRupiah = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(order.total_amount);

    const row = `
            <tr>
                <td class="ps-4"><strong>#ORD-${order.id}</strong></td>
                <td>Resto-${order.restaurant_id}</td>
                <td class="text-success fw-bold">${formatRupiah}</td>
                <td><span class="badge ${badgeColor} rounded-pill px-3 py-2">${order.status}</span></td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}
