# PA 2569 Image Collector

เว็บแอป Google Apps Script สำหรับรวบรวมภาพหลักฐานเพื่อจัดทำ Presentation รายงานผลการพัฒนางานตามข้อตกลง (PA) ประจำปีงบประมาณ พ.ศ. 2569

## จุดประสงค์

- แปลงแผน Presentation 10 สไลด์เป็น Checklist ที่ใช้เก็บภาพได้จริง
- แสดงหัวข้อที่เก็บแล้ว/ยังขาด และความพร้อมของหลักฐานจำเป็น
- อัปโหลดภาพจากกล้องโทรศัพท์หรือคลังภาพโดยตรง
- บันทึกคำอธิบายภาพเป็น metadata ใน Google Drive
- จัดไฟล์ลงโฟลเดอร์รายสไลด์และตั้งชื่ออัตโนมัติตามแผน
- เปิดดู ลบ ดาวน์โหลด ZIP และเปิดโฟลเดอร์ Drive ได้จากหน้าเดียว

## โครงสร้างหลัก

- `Code.js` — Apps Script ฝั่งเซิร์ฟเวอร์ รายการสไลด์/ภาพ การจัดโฟลเดอร์ อัปโหลด ลบ และ ZIP
- `index.html` — UI แบบ mobile-first พร้อม Dashboard, Filter, Preview และ Upload
- `appsscript.json` — Manifest ของ Web App
- `PA_2569_Slide_Layout_and_Image_Plan.md` — เอกสารต้นฉบับที่ใช้กำหนดหัวข้อภาพ

## การจัดเก็บใน Drive

ระบบสร้างโฟลเดอร์ `PA_2569_Presentation` ภายในโฟลเดอร์ Drive ที่กำหนดใน `DRIVE_FOLDER_ID` และสร้างโฟลเดอร์ย่อย 10 หมวด:

```text
PA_2569_Presentation/
├── 01_Cover/
├── 02_Workload/
├── 03_Learning_Management/
├── 04_Student_Support/
├── 05_Professional_Development/
├── 06_Outcomes/
├── 07_Challenge_Problem/
├── 08_Challenge_Process/
├── 09_Challenge_Results/
└── 10_Summary/
```

ชื่อไฟล์ถูกสร้างในรูปแบบ:

```text
S03_Phonics_Teaching_Hero_25690907_142530_123.jpg
```

## การเผยแพร่

เพื่อคง URL เดิม ห้ามใช้ `clasp deploy` แบบไม่มี deployment ID สำหรับการอัปเดต

```bash
clasp push -f
clasp version "PA 2569 image collector"
clasp redeploy DEPLOYMENT_ID -V VERSION_NUMBER -d "PA 2569 image collector"
```

## ความเป็นส่วนตัว

ก่อนอัปโหลด Screenshot หรือเอกสาร ควรปิดชื่อ เลขประจำตัว เบอร์โทร และข้อมูลส่วนบุคคลของนักเรียนหรือผู้ปกครอง ระบบตั้งค่าไฟล์เป็น “ทุกคนที่มีลิงก์ดูได้” เพื่อให้แสดง Thumbnail บนอุปกรณ์มือถือได้
