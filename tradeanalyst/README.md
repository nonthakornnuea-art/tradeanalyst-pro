# TradeAnalyst Pro v3

Personal Trading OS — วิเคราะห์หุ้น + Valuation + ข่าว Real-Time + พอร์ต ผ่าน AI

---

## 📋 สิ่งที่ต้องมีก่อนเริ่ม

1. บัญชี **GitHub** (ฟรี) → https://github.com
2. บัญชี **Vercel** (ฟรี) → https://vercel.com
3. **Anthropic API Key** → https://console.anthropic.com/settings/keys
   (ต้องเติมเงินใน console ขั้นต่ำ ~$5 เพื่อใช้ API)

---

## 🚀 วิธี Deploy (15 นาที)

### ขั้นที่ 1 — เอา code ขึ้น GitHub

1. ไปที่ github.com → กด **New repository**
2. ตั้งชื่อ เช่น `tradeanalyst-pro` → กด **Create**
3. ลากไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้นไป (หรือใช้ git):

```bash
cd tradeanalyst
git init
git add .
git commit -m "TradeAnalyst Pro v3"
git branch -M main
git remote add origin https://github.com/USERNAME/tradeanalyst-pro.git
git push -u origin main
```

### ขั้นที่ 2 — เชื่อม Vercel

1. ไปที่ vercel.com → **Login with GitHub**
2. กด **Add New → Project**
3. เลือก repo `tradeanalyst-pro` → กด **Import**
4. **สำคัญ:** ก่อนกด Deploy ให้ไปที่ **Environment Variables** เพิ่ม:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (key ของเหนือ)
5. กด **Deploy** → รอ 1-2 นาที

### ขั้นที่ 3 — เสร็จ!

จะได้ URL เช่น `https://tradeanalyst-pro.vercel.app`
เปิดจากมือถือได้เลย · upload รูป chart/พอร์ตได้จริง

---

## ✏️ วิธีแก้ Code ในอนาคต

**วิธีที่ง่ายที่สุด:**
1. แก้ไฟล์บน github.com โดยตรง (กดดินสอที่ไฟล์)
2. กด Commit
3. Vercel จะ auto-deploy ให้เองภายใน 1 นาที

**หรือบอก Claude:** "ช่วยแก้ code ตรงนี้ให้หน่อย" → copy code ใหม่ไปวางใน GitHub

---

## 📁 โครงสร้างไฟล์

```
tradeanalyst/
├── app/
│   ├── page.js              ← UI หลัก (แก้หน้าตาที่นี่)
│   ├── layout.js            ← layout + fonts
│   └── api/
│       ├── analyze/route.js   ← วิเคราะห์หุ้น
│       ├── news/route.js      ← ดึงข่าว (web search)
│       └── portfolio/route.js ← วิเคราะห์พอร์ต
├── lib/
│   └── prompts.js           ← system prompts (แก้วิธีวิเคราะห์ที่นี่)
├── package.json
└── .env.local               ← API key (ห้าม push ขึ้น GitHub!)
```

---

## 🔧 รันทดสอบบนเครื่องตัวเอง (optional)

```bash
npm install
cp .env.example .env.local   # แล้วใส่ API key ใน .env.local
npm run dev                  # เปิด http://localhost:3000
```

---

## ⚠️ หมายเหตุสำคัญ

- **API key ห้าม commit ขึ้น GitHub เด็ดขาด** — ใส่ใน Vercel Environment Variables เท่านั้น
- ทุก analysis เสียค่า API ตาม token ที่ใช้ (Sonnet 4 ~$3/$15 ต่อล้าน token)
- News tab ใช้ web search → เสียค่า search tool เพิ่มเล็กน้อย
- แอปนี้เป็นเครื่องมือช่วยวิเคราะห์ ไม่ใช่คำแนะนำการลงทุน ตัดสินใจเองทุกครั้ง

---

Built for Nuea · Personal Trading OS
