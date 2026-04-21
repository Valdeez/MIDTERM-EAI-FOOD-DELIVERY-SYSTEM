// file: js/checkout.js

document
  .getElementById("btnCheckout")
  .addEventListener("click", prosesCheckout);

async function prosesCheckout() {
  const btn = document.getElementById("btnCheckout");
  const alertContainer = document.getElementById("alertContainer");

  // UI State: Loading
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memproses...`;
  alertContainer.innerHTML = ""; // Bersihkan alert sebelumnya

  // Simulasi Payload (Di dunia nyata ini ditarik dari state/localstorage keranjang)
  const payloadOrder = {
    user_id: 1,
    restaurant_id: 101,
    total_amount: 35000,
  };

  try {
    // Memanggil fungsi apiPost dari js/api.js ke endpoint /orders
    const result = await apiPost("/orders", payloadOrder);

    // Jika sukses
    alertContainer.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <strong>Berhasil!</strong> ${result.message} (ID Order: ${result.order_id}). Mengalihkan...
            </div>
        `;

    // Alihkan ke halaman histori setelah 2 detik
    setTimeout(() => {
      window.location.href = "history.html";
    }, 2000);
  } catch (error) {
    // Jika gagal
    alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Gagal!</strong> ${error.message}
            </div>
        `;
    // Kembalikan tombol seperti semula
    btn.disabled = false;
    btn.innerHTML = `Buat Pesanan Sekarang`;
  }
}
