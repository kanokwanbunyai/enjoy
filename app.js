(function () {
  const $ = (s) => document.querySelector(s);
  const baht = (n) => "฿" + Number(n).toLocaleString("th-TH");
  const cart = {}; // sku -> qty
  PRODUCTS.forEach((p) => (cart[p.sku] = 0));

  // ---------- ตั้งค่าข้อความ ----------
  $("#shopName").textContent = CONFIG.SHOP_NAME;
  $("#shopName2").textContent = CONFIG.SHOP_NAME;
  $("#freeShipText").textContent = CONFIG.FREE_SHIPPING_OVER;
  $("#year").textContent = new Date().getFullYear();

  // ---------- แสดงสินค้า ----------
  const grid = $("#productGrid");
  grid.innerHTML = PRODUCTS.map(
    (p) => `
    <article class="pcard" data-sku="${p.sku}">
      <div class="pimg">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="ptag">${p.tag}</span>
      </div>
      <div class="pbody">
        <div class="psku">${p.sku} · ${p.size}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="pfoot">
          <div class="price">${baht(p.price)} <small>/ ขวด</small></div>
          <div class="qty">
            <button type="button" data-act="dec" aria-label="ลด">−</button>
            <span data-qty>0</span>
            <button type="button" data-act="inc" aria-label="เพิ่ม">+</button>
          </div>
        </div>
      </div>
    </article>`
  ).join("");

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const card = btn.closest(".pcard");
    const sku = card.dataset.sku;
    cart[sku] = Math.max(0, Math.min(20, cart[sku] + (btn.dataset.act === "inc" ? 1 : -1)));
    card.querySelector("[data-qty]").textContent = cart[sku];
    card.classList.toggle("active", cart[sku] > 0);
    renderSummary();
  });

  // ---------- สรุปคำสั่งซื้อ ----------
  function calc() {
    const items = PRODUCTS.filter((p) => cart[p.sku] > 0).map((p) => ({
      sku: p.sku, name: p.name, image: p.image, price: p.price, qty: cart[p.sku],
    }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= CONFIG.FREE_SHIPPING_OVER ? 0 : CONFIG.SHIPPING_FEE;
    return { items, subtotal, shipping, total: subtotal + shipping };
  }

  function renderSummary() {
    const c = calc();
    $("#summaryList").innerHTML = c.items.length
      ? c.items.map((i) => `<li><span>${i.name} × ${i.qty}</span><b>${baht(i.price * i.qty)}</b></li>`).join("")
      : '<li class="empty">ยังไม่ได้เลือกสินค้า</li>';
    $("#sumSubtotal").textContent = baht(c.subtotal);
    $("#sumShip").textContent = c.subtotal === 0 ? "-" : c.shipping === 0 ? "ฟรี" : baht(c.shipping);
    $("#sumTotal").textContent = baht(c.total);
    const need = CONFIG.FREE_SHIPPING_OVER - c.subtotal;
    $("#shipHint").textContent =
      c.subtotal > 0 && need > 0 ? `ซื้อเพิ่มอีก ${baht(need)} ส่งฟรี!` : c.subtotal > 0 ? "คุณได้รับสิทธิ์ส่งฟรี 🎉" : "";
  }
  renderSummary();

  // ---------- ส่งออเดอร์ ----------
  function newOrderId() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `HH${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
  }

  async function sendOrder(order) {
    if (CONFIG.SCRIPT_URL) {
      // Apps Script รับ text/plain เพื่อเลี่ยง CORS preflight
      await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "add", order }),
      });
    } else {
      // โหมดทดลอง: เก็บในเบราว์เซอร์นี้ (admin.html เปิดจากเครื่องเดียวกันจะเห็น)
      const list = JSON.parse(localStorage.getItem("hh_orders") || "[]");
      order.items.forEach((i) =>
        list.push({
          orderId: order.orderId, timestamp: order.timestamp, sku: i.sku, product: i.name,
          image: i.image, qty: i.qty, unitPrice: i.price, lineTotal: i.price * i.qty,
          shipping: order.shipping, orderTotal: order.total, ...order.customer, status: "ใหม่",
        })
      );
      localStorage.setItem("hh_orders", JSON.stringify(list));
    }
  }

  const form = $("#orderForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#formError");
    err.textContent = "";
    form.querySelectorAll(".invalid").forEach((x) => x.classList.remove("invalid"));

    const c = calc();
    if (!c.items.length) {
      err.textContent = "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ";
      $("#products").scrollIntoView();
      return;
    }
    const f = Object.fromEntries(new FormData(form).entries());
    f.phone = (f.phone || "").replace(/[\s-]/g, "");
    f.zip = (f.zip || "").trim();
    let bad = [...form.querySelectorAll("[required]")].filter((el) => !el.value.trim());
    if (f.phone && !/^0\d{8,9}$/.test(f.phone)) bad.push(form.phone);
    if (f.zip && !/^\d{5}$/.test(f.zip)) bad.push(form.zip);
    if (bad.length) {
      bad.forEach((el) => el.classList.add("invalid"));
      bad[0].focus();
      err.textContent = "กรุณากรอกข้อมูลให้ครบและถูกต้อง (เบอร์โทร 9-10 หลัก, รหัสไปรษณีย์ 5 หลัก)";
      return;
    }

    const order = {
      orderId: newOrderId(),
      timestamp: new Date().toISOString(),
      items: c.items,
      shipping: c.shipping,
      total: c.total,
      customer: {
        name: f.name.trim(), phone: f.phone, address: f.address.trim(),
        subdistrict: f.subdistrict.trim(), district: f.district.trim(),
        province: f.province.trim(), zip: f.zip, note: (f.note || "").trim(),
      },
    };

    const btn = $("#submitBtn");
    btn.disabled = true;
    btn.textContent = "กำลังส่งคำสั่งซื้อ...";
    try {
      await sendOrder(order);
      $("#successId").textContent = order.orderId;
      $("#successModal").hidden = false;
      form.reset();
      PRODUCTS.forEach((p) => (cart[p.sku] = 0));
      document.querySelectorAll(".pcard").forEach((card) => {
        card.classList.remove("active");
        card.querySelector("[data-qty]").textContent = "0";
      });
      renderSummary();
    } catch (ex) {
      err.textContent = "ส่งคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    } finally {
      btn.disabled = false;
      btn.textContent = "ยืนยันสั่งซื้อ (เก็บเงินปลายทาง)";
    }
  });

  $("#closeModal").addEventListener("click", () => ($("#successModal").hidden = true));
})();
