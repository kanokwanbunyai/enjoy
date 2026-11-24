// ============================================================
//  ตั้งค่าร้านและสินค้า — แก้ไขที่ไฟล์นี้ไฟล์เดียว
// ============================================================
const CONFIG = {
  SHOP_NAME: "Herbi Hair",
  // วาง URL ของ Google Apps Script (Web app) ที่ได้หลัง Deploy ตรงนี้
  // ถ้าปล่อยว่าง เว็บจะทำงานโหมดทดลอง (เก็บออเดอร์ในเบราว์เซอร์เครื่องนี้)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbywk17AEs13CsSGusmTIdlbrJoocp5geRtfHhuubp4ZuDJBUKfbI4kp_u2sPLOD0O6G8w/exec",
  SHIPPING_FEE: 40,
  FREE_SHIPPING_OVER: 400,
  // ข้อมูลผู้ส่ง (แสดงบนใบจ่าหน้าพัสดุ)
  SENDER: {
    name: "ร้าน Herbi Hair",
    phone: "081-234-5678",
    address: "123 ถ.ตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000",
  },
};

// สินค้า (อย่างน้อย 2 SKUs) — image คือไฟล์ในโฟลเดอร์ images/
const PRODUCTS = [
  {
    sku: "SH-001",
    name: "แชมพูอัญชัน ลดผมร่วง",
    size: "250 มล.",
    price: 189,
    image: "images/sh-001.svg",
    tag: "ขายดี",
    desc: "สูตรอัญชันและขิง บำรุงรากผม ลดการหลุดร่วง ผมนุ่มสลวย",
  },
  {
    sku: "SH-002",
    name: "แชมพูมิ้นต์ ขจัดรังแค",
    size: "250 มล.",
    price: 169,
    image: "images/sh-002.svg",
    tag: "สดชื่น",
    desc: "มิ้นต์และน้ำมันทีทรี ขจัดรังแค ลดคัน หนังศีรษะเย็นสบาย",
  },
];
