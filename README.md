# Take Me Home & Chauffeur Fleet Tracker 🚗💨
### Full-Stack Next.js 16 App • Jabbz, Tebza & Fresh • Vercel & MongoDB Ready

A secure, modern, mobile-first full-stack **Next.js** application built for **Jabbz, Tebza, and Fresh** to track Take Me Home (dual-driver) and Chauffeur trips, manage dynamic fleet vehicles (Polo, Fiesta, i20), update driver profiles, and generate official printable PDF vouchers.

---

## 🚀 Key Highlights & Architectural Features

- **Full-Stack Next.js 16 App Router**: Unified frontend and serverless API endpoints (`/api/auth/*`, `/api/trips/*`, `/api/cars/*`, `/api/health`).
- **Clean, Uncluttered Top Bar**: Streamlined navigation featuring driver profile avatar & name with `Admin` badge, quick `🚗 Fleet` trigger, and an options `⚙️` dropdown menu.
- **Compact Trip Feed & Dedicated Trip Detail View**:
  - Main trip list uses compact, scannable cards.
  - Clicking any trip card opens a dedicated **Trip Detail View** displaying route flow, dual-driver audit breakdown, live editable trip notes, agreed fare, and one-tap `📞 Call Client`.
- **Driver Profile Management**:
  - Full photo upload (base64 Data URL up to 2.5MB with instant preview and remove button).
  - 7 custom avatar theme color palettes.
  - Profile updates for Driver Name, Email, and Mobile Phone.
- **Fixed & Fully Functional Official PDF Voucher**:
  - Formatted printable trip receipt voucher with isolated print engine (`window.print()` / save to PDF).
- **Security & Authentication**:
  - Signed **JWT (JSON Web Tokens)** with 7-day validity.
  - Salted **bcrypt (10 rounds)** password encryption.
  - **Mandatory First-Login Password Change**: All initial seeded accounts are forced to personalize their password upon first login before accessing the dashboard.
- **Dynamic Fleet CRUD (Polo, Fiesta, i20)**:
  - Add, inspect, and retire fleet vehicles stored dynamically in MongoDB with persistent fallback.
- **POPIA Compliant**:
  - South Africa Protection of Personal Information Act (Act 4 of 2013) compliance statement, 8 conditions adherence, and audit controls.
- **Top-Sliding Alerts**:
  - Toast notifications smoothly animate from the top of the screen.

---

## 👥 Seed Driver Accounts (First-Login Flow)

All 3 drivers have full admin powers across the entire system.

| Driver | Email | Initial Seed Password | Status on First Login |
|---|---|---|---|
| **Jabbz** | `jabbz@tmh-fleet.co.za` | `Jabbz@TMH2026!` | ⚠️ **Must Change Password** |
| **Tebza** | `tebza@tmh-fleet.co.za` | `Tebza@TMH2026!` | ⚠️ **Must Change Password** |
| **Fresh** | `fresh@tmh-fleet.co.za` | `Fresh@TMH2026!` | ⚠️ **Must Change Password** |

---

## 🚘 Dynamic Fleet Rotation

- 🚗 **VW Polo Hatch** (`GP 884-POL`, TSI Comfortline)
- 🚙 **Ford Fiesta** (`GP 419-FIE`, 1.0 EcoBoost)
- 🚗 **Hyundai i20** (`GP 302-I20`, 1.2 Motion)

---

## 🚗 The Two Service Trip Types

1. **Take Me Home Trips (2 Drivers Dispatched)**:
   - Driving the client home in **their own vehicle**.
   - **Driver 1 (Lead Driver)**: Drives the client's car.
   - **Driver 2 (Chase Escort Driver)**: Follows in one of our fleet cars (**Polo**, **Fiesta**, or **i20**) for return escort.
2. **Chauffeur Trips (1 Driver Dispatched)**:
   - Direct VIP passenger transfer using our company fleet vehicle.
   - **Chauffeur Driver**: Single driver behind the wheel of a fleet car.

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Start production server
npm run start
```

Open in your browser:
👉 **`http://localhost:3000`**

---

## ☁️ Deploying to Vercel

Because this project is built on **Next.js 16**, deploying to Vercel requires zero complex configuration:
1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set your Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (e.g. `mongodb+srv://...`).
   - `JWT_SECRET`: A secure production secret for signing JWTs.
4. Click **Deploy**. Vercel will automatically build the Next.js app and deploy serverless functions.
