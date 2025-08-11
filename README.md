
# CollabNote

An online marketplace for study notes where **senior students upload and sell notes**, and **junior students browse, purchase, and access them** after payment verification. Built with React, Firebase, and Tailwind CSS — deployed on Vercel with SPA-friendly routing.

---

## Features

- User authentication (Firebase Auth)
- Cart management with add/remove notes
- Payment via external QR code + transaction ID submission
- Firestore storage of purchase data with pending verification
- Success page confirming pending payment status
- Admin panel for note access requests & approvals (in `features/admin`)
- Senior upload requests feature (`RequestUpload.jsx`)
- Fully responsive with Tailwind CSS
- React Router DOM v6 for SPA routing
- Vercel deployment with routing rewrites

---

## Project Structure

```plaintext
src/
├─ Components/           # Reusable React components (Navbar, Payment, Success, etc.)
├─ assets/               # Static images, gifs, QR codes
├─ config/               # Firebase configuration
├─ constants/            # Constant values used throughout the app
├─ contexts/             # React Contexts for auth & cart state
├─ features/             # Feature-based folder structure
│  ├─ admin/             # Admin pages & components
│  ├─ auth/              # Authentication components (Login)
│  ├─ Home/              # Homepage & related UI components
│  ├─ misc/              # Miscellaneous features (post-login home, scanner)
│  ├─ profile/           # User profile pages
│  ├─ Resources/         # Resource browsing UI (Branches, Semesters, Years)
├─ services/             # API and Firestore interaction logic
├─ styles/               # Additional styles (e.g. Particles.scss)
├─ App.jsx               # Main routing and app structure
├─ main.jsx              # React app entry point
```

---

## Getting Started

### Prerequisites

- Node.js (>=16 recommended)
- Firebase project with Firestore and Authentication enabled

### Installation

```bash
git clone https://github.com/vinay-sikarwar/collabnote.git
cd collabnote
npm install
```

### Setup Firebase

- Add your Firebase config to `src/config/firebase.js`.
- Make sure Firestore rules and Authentication are properly configured.

### Run Locally

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)


Then deploy your repo connected to Vercel.

---

## Use Case

- **Seniors:** Upload notes, set prices, and earn money from sales.
- **Juniors:** Browse, add notes to cart, pay externally, submit payment ID, and access notes after admin approval.
- **Admins:** Verify payments, approve note access, and manage platform content.

---

## Contribution

Feel free to open issues or pull requests for improvements!

---

## License

MIT License

---

## Contact

Vinay Sikarwar — [GitHub](https://github.com/vinay-sikarwar)  
Project Repo: https://github.com/vinay-sikarwar/collabnote

---
