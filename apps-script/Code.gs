/**
 * Google Apps Script — เก็บออเดอร์ลง Google Sheet
 * วิธีใช้: ดูขั้นตอนใน README.md ข้อ 1
 */

// รหัสสำหรับเข้าหน้า admin.html (เปลี่ยนเป็นของคุณเอง)
const ADMIN_KEY = "change-me-1234";
const SHEET_NAME = "Orders";

const HEADERS = [
  "OrderID", "Timestamp", "SKU", "Product", "Image", "Qty", "UnitPrice", "LineTotal",
  "Shipping", "OrderTotal", "Name", "Phone", "Address", "Subdistrict", "District",
  "Province", "Zip", "Note", "Status",
];
// ชื่อ key ที่ส่งให้หน้า admin (เรียงตรงกับ HEADERS)
const KEYS = [
  "orderId", "timestamp", "sku", "product", "image", "qty", "unitPrice", "lineTotal",
  "shipping", "orderTotal", "name", "phone", "address", "subdistrict", "district",
  "province", "zip", "note", "status",
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#e9e2fb");
    sh.getRange("L:L").setNumberFormat("@"); // เบอร์โทร เก็บเป็นข้อความ เพื่อไม่ให้เลข 0 หาย
    sh.getRange("Q:Q").setNumberFormat("@"); // รหัสไปรษณีย์
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// รับออเดอร์จากหน้าเว็บ (1 สินค้า = 1 แถว)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action !== "add") return json_({ ok: false, error: "unknown action" });
    const o = body.order;
    const c = o.customer;
    const sh = getSheet_();
    const rows = o.items.map((i) => [
      o.orderId, o.timestamp, i.sku, i.name, i.image, i.qty, i.price, i.price * i.qty,
      o.shipping, o.total, c.name, "'" + c.phone, c.address, c.subdistrict, c.district,
      c.province, "'" + c.zip, c.note, "ใหม่",
    ]);
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return json_({ ok: true, orderId: o.orderId });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// หน้า admin อ่านรายการ / เปลี่ยนสถานะ
function doGet(e) {
  const p = e.parameter || {};
  if (p.key !== ADMIN_KEY) return json_({ ok: false, error: "unauthorized" });
  const sh = getSheet_();

  if (p.action === "status") {
    const ids = String(p.orderIds || "").split(",");
    const data = sh.getDataRange().getValues();
    for (let r = 1; r < data.length; r++) {
      if (ids.indexOf(String(data[r][0])) !== -1) sh.getRange(r + 1, HEADERS.length).setValue(p.status);
    }
    return json_({ ok: true });
  }

  const data = sh.getDataRange().getValues().slice(1);
  const orders = data.map((row) => {
    const o = {};
    KEYS.forEach((k, i) => (o[k] = row[i] instanceof Date ? row[i].toISOString() : String(row[i]).replace(/^'/, "")));
    o.qty = Number(o.qty); o.unitPrice = Number(o.unitPrice); o.lineTotal = Number(o.lineTotal);
    o.shipping = Number(o.shipping); o.orderTotal = Number(o.orderTotal);
    return o;
  });
  return json_({ ok: true, orders: orders });
}
