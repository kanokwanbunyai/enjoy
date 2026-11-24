# Herbi Hair — แลนดิ้งเพจขายแชมพู (LSM496 ข้อ 004)

เว็บสั่งซื้อแชมพู 2 SKUs เก็บออเดอร์ลง Google Sheet มีหน้าแอดมินสำหรับหยิบสินค้าและพิมพ์ใบจ่าหน้าพัสดุ
เป็นเว็บ static (HTML/CSS/JS) ไม่ต้อง build deploy ขึ้น Vercel ได้ทันที

## โครงสร้างไฟล์

```
index.html        หน้าแลนดิ้งเพจ + ฟอร์มสั่งซื้อ
admin.html        หน้าแอดมิน: สรุปที่ต้องหยิบ / พิมพ์ใบจ่าหน้า / เปลี่ยนสถานะ
products.js       ตั้งค่าร้าน, SKU, ราคา, ชื่อไฟล์รูป, SCRIPT_URL
app.js, style.css
images/           โฟลเดอร์เก็บรูปสินค้า (sh-001.svg, sh-002.svg)
apps-script/Code.gs   สคริปต์สำหรับ Google Sheet
```

## 1) เชื่อม Google Sheet (ประมาณ 5 นาที)

1. สร้าง Google Sheet ใหม่ → เมนู **ส่วนขยาย → Apps Script**
2. ลบโค้ดเดิม แล้ววางโค้ดจาก `apps-script/Code.gs`
3. แก้ `ADMIN_KEY` เป็นรหัสของคุณเอง
4. กด **Deploy → New deployment → ประเภท Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กดอนุญาตสิทธิ์ แล้วคัดลอก **Web app URL**
6. เปิด `products.js` วาง URL ที่ `SCRIPT_URL: "..."`
7. ลองสั่งซื้อจากหน้าเว็บ จะเห็นชีต `Orders` สร้างขึ้นและมีแถวใหม่ (1 สินค้า = 1 แถว)

> ถ้าแก้ Code.gs ภายหลัง ต้อง Deploy → Manage deployments → แก้เป็น New version

## 2) อัปโหลดขึ้น GitHub

```bash
cd shampoo-shop
git init
git add .
git commit -m "shampoo landing page"
git branch -M main
git remote add origin https://github.com/<ชื่อผู้ใช้>/<ชื่อ-repo>.git
git push -u origin main
```

หรือสร้าง repo บน github.com แล้วลากไฟล์ทั้งหมด (รวมโฟลเดอร์ `images/`) ไปวางได้เลย

## 3) Deploy ขึ้น Vercel

1. เข้า vercel.com → **Add New → Project**
2. เลือก repo จาก GitHub
3. Framework Preset: **Other** (ไม่ต้องใส่ build command) → **Deploy**
4. ได้โดเมน `https://<ชื่อโปรเจกต์>.vercel.app` ส่งลิงก์นี้เป็นคำตอบ

## 4) วิธีใช้หน้าแอดมิน (`/admin.html`)

1. กรอกรหัส `ADMIN_KEY` ตอนเปิดหน้า
2. ติ๊กเลือกออเดอร์ที่จะแพ็ค → ตารางด้านบนจะรวมจำนวนที่ต้องหยิบแต่ละ SKU
3. กด **พิมพ์ใบหยิบสินค้า** / **พิมพ์ใบจ่าหน้าพัสดุ** (ขนาด 100×150 มม. เลือก Save as PDF ได้)
4. กด **ทำเครื่องหมาย "แพ็คแล้ว"** เพื่อปิดงาน (อัปเดตคอลัมน์ Status ในชีต)

## เพิ่ม/แก้สินค้า

แก้อาร์เรย์ `PRODUCTS` ใน `products.js` แล้วใส่รูปในโฟลเดอร์ `images/` ด้วยชื่อที่ตรงกับ `image`

## หมายเหตุ

- ถ้ายังไม่ใส่ `SCRIPT_URL` เว็บจะทำงาน "โหมดทดลอง" เก็บออเดอร์ใน localStorage ของเบราว์เซอร์ (ใช้ทดสอบหน้าแอดมินได้)
- `ADMIN_KEY` ป้องกันแบบเบื้องต้นเท่านั้น ไม่ควรใช้รหัสเดียวกับที่อื่น
