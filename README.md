# 🧇 MOKKO — Shop Management System
> **Real-Time Dual-Screen Restaurant Management POS & Kitchen Display System (KDS)**  
> Built with **Next.js 16**, **NestJS 11**, **Socket.io**, **Puppeteer**, and **Twilio WhatsApp API**.

---

## 📌 Architecture Overview

MOKKO is designed specifically for high-efficiency waffle and dessert shops operating two synchronized physical screens:

```
                      ┌────────────────────────────────────────┐
                      │    MOKKO Backend Server (Port 4000)    │
                      │  NestJS 11 + Socket.io + Puppeteer PDF │
                      └──────────────────┬─────────────────────┘
                                         │  WebSocket + REST
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
   ┌───────────────────────────────────┐     ┌───────────────────────────────────┐
   │    SCREEN 1: COUNTER POS & DASH    │     │   SCREEN 2: KITCHEN DISPLAY (KDS) │
   │      (Billing Terminal - Port 3000)│     │      (Kitchen Station - Port 3000)│
   │                                   │     │                                   │
   │  • Menu Selection & Cart          │     │  • Live Real-Time Kanban Board    │
   │  • Customer Details Validation    │     │  • Incoming ➔ Preparing ➔ Ready   │
   │  • Payment (Cash / UPI / Split)   │     │  • Drag & Drop Card Progression   │
   │  • Automatic PDF Receipt Gen      │     │  • High-Pitched Order Alert Chime │
   │  • WhatsApp Receipt to Customer   │     │  • Urgent Order Priority Badging  │
   │  • Analytics & Sales Charts       │     │  • Kitchen Broadcast Banners      │
   └───────────────────────────────────┘     └───────────────────────────────────┘
```

---

## 🔐 Terminal Access & Default PINs

Open `http://localhost:3000/login` to select your terminal:

| Terminal | Target URL | Default PIN | Features |
|---|---|---|---|
| **Billing Counter POS** | `/cart` or `/dashboard` | `1234` | Point-of-Sale, Cart, Customer Checkout, Sales Analytics, Inventory, Reports |
| **Kitchen Display (KDS)** | `/kitchen` | `5678` | Live Kanban Board, Audio Chime Alerts, Order Timer, Station Status Updates |

> **Note:** The login screen also includes **1-Click Quick Launch** buttons for rapid startup without typing PINs during testing.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: v18+ (v20 or v22 recommended)
- **Git**

---

### Step 1: Open Two Terminal Windows

#### Terminal 1 — Start the Backend (Port 4000)
```powershell
cd "e:\Shop Management\backend"
npm run dev
```
*You will see:*
```
[Bootstrap] 🚀 Mokko Backend is running on: http://localhost:4000
[Bootstrap] 📄 Receipt API: http://localhost:4000/api/receipt/generate
[Bootstrap] 📱 WhatsApp API: http://localhost:4000/api/receipt/send
[OrdersGateway] 🔌 Socket.io Orders Gateway initialized on port 4000
```

#### Terminal 2 — Start the Frontend (Port 3000)
```powershell
cd "e:\Shop Management\frontend"
npm run dev
```
*You will see:*
```
▲ Next.js 16.4.1 (Turbopack)
- Local: http://localhost:3000
```

---

## 🧪 End-to-End Walkthrough with Sample Test Data

Follow these exact steps to test the entire shop operation:

### 1️⃣ Open Both Screens Side-by-Side
1. Open **Window 1** (Counter): `http://localhost:3000/cart`
2. Open **Window 2** (Kitchen): `http://localhost:3000/kitchen`
3. Notice the green indicator in the Kitchen header: `● Socket.io Live`.

---

### 2️⃣ Test Negative Validation (Invalid Customer Data)
1. In the **Counter Screen**, select any waffle (e.g. `Classic Butter Waffle`).
2. Click **Continue to Customer**.
3. **Test Case 2A (Short Phone Number):**
   - Customer Name: `Aarav Sharma`
   - Phone: `98765` *(Only 5 digits)*
   - Click **Select Payment Method**
   - 🔴 **Result:** Red toast notification triggers:  
     `Phone number is too short (5/10 digits). Please enter a full 10-digit mobile number.`
4. **Test Case 2B (Invalid Operator Prefix):**
   - Phone: `1234567890` *(Starts with 1, which is not an Indian mobile operator)*
   - Click **Select Payment Method**
   - 🔴 **Result:** Alert triggers:  
     `Invalid Indian mobile number. Must start with 6, 7, 8, or 9.`
5. **Test Case 2C (Empty Name):**
   - Clear the customer name and click next.
   - 🔴 **Result:** Alert triggers: `Customer name must be at least 2 characters`.

---

### 3️⃣ Test Successful Order Placement (Sample Data)
Enter this valid sample customer data:
- **Customer Name:** `Pooja Verma`
- **Phone Number:** `9876543210` *(Valid Indian 10 digits)*
- **Coupon Code:** `WELCOME10` *(Applies 10% discount)*
- **Kitchen Note:** `Extra crispy waffle, less chocolate sauce please`
- **Urgent Priority:** Check the **Urgent Priority Order** checkbox *(Highlights red)*
- Click **Select Payment Method**.
- Select **UPI / QR Code**.
- Click **✓ Confirm & Send to Kitchen**.

---

### 4️⃣ Observe Real-Time Live Sync on Kitchen Screen
**Instantly without refreshing Window 2:**
1. 🔔 **Dual-tone restaurant audio chime plays** in the kitchen browser.
2. 🎫 A new ticket card appears at the top of **Incoming Orders**:
   - Shows `🔴 URGENT` badge.
   - Shows Customer `Pooja Verma (9876543210)`.
   - Displays items and note: `📝 Extra crispy waffle, less chocolate sauce please`.
   - Shows badge `📱 UPI` and order total.

---

### 5️⃣ Progress Orders on Kitchen Kanban
1. Click **🍳 Start Preparing** (or drag the card) to move it to **Preparing**.
   - Live elapsed preparation timer starts counting up.
2. Click **✓ Mark Ready** to move it to **Ready to Serve**.
   - Emits an alert to the Counter terminal that the order is ready for pickup.
3. Click **🛎️ Served** to complete and archive the order ticket.

---

### 6️⃣ Verify Generated PDF Receipt & WhatsApp Message
1. In the backend directory, check the `backend/receipts/` folder:
   - A PDF formatted like a thermal POS receipt is generated (e.g. `receipt_MK-000125_....pdf`).
   - Includes shop logo `🧇 MOKKO`, GST breakdown, UPI transaction ID, items, and heartwarming footer message.
2. In the backend terminal logs, you will see:
   ```text
   [ReceiptService] 📄 Generating PDF receipt for Bill: MK-000125
   [ReceiptService] ✅ PDF generated: E:\Shop Management\backend\receipts\receipt_MK-000125_....pdf
   [WhatsAppService] 📱 Sending WhatsApp receipt to whatsapp:+919876543210
   [WhatsAppService] [SIMULATED] WhatsApp sent to whatsapp:+919876543210: 🧇 Thank you, Pooja Verma! 🧇 ...
   ```
   *(When live Twilio keys are supplied in `backend/src/config/whatsapp.config.ts`, this sends directly to WhatsApp).*

---

### 7️⃣ Test Kitchen Announcement Broadcast
1. In the Kitchen screen, in the broadcast input box at the top, type:
   `"Rush hour! Prioritize combos and waffle irons 1 & 2"`
2. Press **Enter** or click **Broadcast**.
3. A high-priority banner with an attention chime appears across the screens.

---

## 📡 API & WebSocket Reference

### REST Endpoints (Port 4000)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health & shop status check |
| `GET` | `/api/orders` | Retrieves all active order tickets |
| `POST` | `/api/orders` | Creates new order, emits socket event, creates PDF receipt |
| `PATCH` | `/api/orders/:id/status` | Updates order column (`incoming`, `preparing`, `ready`, `completed`) |
| `POST` | `/api/orders/announcement` | Broadcasts announcement banner to kitchen screens |
| `POST` | `/api/receipt/generate` | Generates receipt PDF via Puppeteer |
| `POST` | `/api/receipt/send` | Generates receipt and sends WhatsApp message |
| `GET` | `/api/receipt/file/:filename` | Streams / previews generated receipt PDF in browser |

### Socket.io Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ role: 'counter' \| 'kitchen' }` | Joins terminal station room |
| `initial-orders` | Server ➔ Client | `ShopOrder[]` | Initial state sync on screen connect |
| `create-order` | Client ➔ Server | `Partial<ShopOrder>` | Dispatches new order from counter |
| `order-created` | Server ➔ Broadcast | `ShopOrder` | Triggers kitchen card appearance + chime |
| `update-status` | Client ➔ Server | `{ orderId, status }` | Drag-and-drop column transition |
| `order-updated` | Server ➔ Broadcast | `ShopOrder` | Synchronizes card position across all screens |
| `order-ready-alert`| Server ➔ Counter | `{ orderId, customer }` | Alerts counter when food is ready |
| `kitchen-announcement`| Bi-directional | `{ message, urgent }` | Broadcasts announcement banner |

---

## 🔒 Push to Private GitHub Repository

Your local repository is initialized and committed on branch `main`.

To push to your private GitHub repo:

```powershell
cd "e:\Shop Management"

# Option A: Push directly (Browser authentication prompt will appear)
git push -u origin main

# Option B: Authenticate via GitHub CLI first
gh auth login
git push -u origin main

# Option C: Using a GitHub Personal Access Token (PAT)
git push https://YOUR_TOKEN@github.com/Ron12-star/Shop-Management.git main
```

---

## 📁 Repository Structure

```text
e:\Shop Management\
├── backend\
│   ├── src\
│   │   ├── config\             # Shop & WhatsApp credentials configuration
│   │   │   ├── shop.config.ts
│   │   │   └── whatsapp.config.ts
│   │   ├── modules\
│   │   │   ├── orders\         # Real-time Socket.io gateway & order controllers
│   │   │   ├── receipt\        # Puppeteer PDF generation & receipt templates
│   │   │   └── whatsapp\       # Twilio WhatsApp messaging & simulation mode
│   │   ├── types\              # Shared TypeScript interfaces (ShopOrder, etc.)
│   │   ├── app.module.ts       # Root NestJS module
│   │   └── main.ts             # Backend entrypoint (Port 4000)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend\
│   ├── app\
│   │   ├── cart\page.tsx       # Billing Counter POS & Checkout
│   │   ├── kitchen\page.tsx    # Kitchen Display System (KDS) Kanban board
│   │   ├── login\page.tsx      # Terminal login screen (Counter & Kitchen)
│   │   ├── dashboard\page.tsx  # Sales & Business Analytics
│   │   ├── inventory\page.tsx  # Stock & Low-supply tracking
│   │   ├── reports\page.tsx    # Shift & Financial reports
│   │   └── layout.tsx          # Root layout wrapped with ToastProvider
│   ├── components\             # Sidebar, Layouts, Nav
│   ├── lib\
│   │   ├── socket.ts           # Socket.io client & Web Audio chime
│   │   ├── validation.ts       # Centralized 10-digit phone & cart validation
│   │   └── toastContext.tsx    # Centralized alert toast notification system
│   └── package.json
│
├── .gitignore                  # Clean exclusions for node_modules, PDFs, dist
├── package.json                # Root convenience scripts
└── README.md                   # Complete system documentation
```
