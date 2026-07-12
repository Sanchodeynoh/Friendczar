# Friendczar — Frontend

A dating web app: swipeable discovery feed (photos + 90s video clips), likes/comments, in-app messaging, user profiles, and an admin dashboard.

Built with React + Vite + Tailwind CSS + react-router-dom + recharts (admin charts) + lucide-react (icons).

Everything here is **frontend only** — profile data, messages, and uploads are mocked in local state. Wiring it to your backend (on Render) is the next step.

## Pages

| Route | Page |
|---|---|
| `/` | Landing + signup/login |
| `/discover` | Swipeable card feed |
| `/messages` | Inbox |
| `/messages/:threadId` | Chat thread |
| `/profile` | Own profile, photo/video upload |
| `/admin` | Admin dashboard (overview, users, reports, content review) |

## Run it locally

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Push this to GitHub

1. **Create a repo on GitHub**
   Go to github.com → New repository → name it e.g. `friendczar-frontend` → **do not** initialize with a README (you already have one) → Create repository.

2. **From this project folder, run:**
   ```bash
   git init
   git add .
   git commit -m "Initial Friendczar frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/friendczar-frontend.git
   git push -u origin main
   ```

3. **Every time you make changes later:**
   ```bash
   git add .
   git commit -m "describe what changed"
   git push
   ```

## Deploy the frontend

Two easy options once it's on GitHub:

- **Vercel** (recommended for a Vite/React app): go to vercel.com → New Project → import your GitHub repo → it auto-detects Vite → Deploy. Set your Render backend URL as an environment variable (e.g. `VITE_API_URL`) in Vercel's project settings once the backend exists.
- **GitHub Pages**: works too, but needs `vite.config.js` updated with a `base: "/friendczar-frontend/"` path and a small build workflow — ask me when you're ready and I'll set that up.

## Connecting to the backend later

When the backend (on Render) is ready, the main things to wire up are:
- `Landing.jsx` → replace the fake `navigate("/discover")` with a real signup/login API call
- `Discover.jsx` → fetch real profiles instead of the `PROFILES` mock array
- `Messages.jsx` → replace `THREADS` mock with real conversations, and hook `send()` up to your messaging API (consider WebSockets or polling for real-time delivery)
- `Profile.jsx` → upload selected files to your backend/storage (e.g. S3, Cloudinary) instead of just local preview URLs
- `Admin.jsx` → replace `USERS`, `REPORTS`, and `GROWTH` mocks with real admin API data

I can help build that backend and this wiring whenever you're ready.
