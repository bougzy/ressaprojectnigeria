# Ressa Project Nigeria — Real Estate Website

A complete, mobile-first real-estate website for **Ressa Project Nigeria
(Ressa Real Estate Project Ltd)**, rebuilt with **Next.js (App Router) +
MongoDB**. It uses every image, flyer and logo from the original
`ressaprojectnig.com.ng`, fixes the issues identified in the review (SEO,
structure, CTAs, branding, trust signals) and ships with a full **admin
dashboard** so the whole site can be managed without touching code.

---

## ✨ What's included

**Public site (mobile-first, fast, SEO-ready)**
- **Home** – hero with clear value proposition + CTAs, stats strip, about
  teaser, "What we offer" services, featured projects, events gallery, video
  teaser, call-to-action banner.
- **About** – real text content, mission & vision, both office locations.
- **Projects & Estates** – filterable gallery (by category and by year) with a
  lightbox. **All 58 images are used here.**
- **Videos** – embedded video grid (YouTube or direct links).
- **Contact** – working contact form (saved to the database), phone/email/
  WhatsApp, office addresses, Google-map embed.
- Floating **WhatsApp** chat button, proper **footer** (no leftover theme text),
  **SEO** metadata, Open Graph/Twitter cards, `sitemap.xml` and `robots.txt`.

**Admin dashboard** (`/admin`)
- **Hardcoded login** (set in `.env.local`).
- **Images & Gallery** – add/upload, change the actual file, edit alt/caption/
  category/year/featured, delete. Every original image is pre-loaded.
- **Videos** – add / edit / delete (YouTube links auto-convert to embeds).
- **Site Text & Settings** – edit hero, about, services, stats, CTA, contact
  details, socials and SEO — all without code.
- **Messages** – read / mark / delete contact-form submissions.

---

## 🔑 Admin login (default)

```
URL:      http://localhost:3000/admin
Username: admin
Password: Ressa@2024
```

Change these in **`.env.local`** (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) before
deploying. Sessions are signed JWTs stored in an httpOnly cookie; admin pages
and write APIs are protected by middleware.

---

## 🚀 Getting started

### 1. Prerequisites
- **Node.js 18.18+**
- **MongoDB** — either local or a free MongoDB Atlas cluster.

### 2. Configure environment
Edit **`.env.local`** (already created):

```env
MONGODB_URI="mongodb://127.0.0.1:27017/ressa"   # or your Atlas SRV string
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Ressa@2024"
AUTH_SECRET="change-me-to-a-long-random-string"
NEXT_PUBLIC_WHATSAPP="2347043331195"
```

### 3. Install, seed, run

```bash
npm install        # already done
npm run seed       # loads all 58 images + default content into MongoDB
npm run dev        # http://localhost:3000
```

> `npm run seed` reads every file in `public/images`, auto-categorises it
> (logo / flyer / project / event), and inserts the editable default text. Run
> it again any time to reset content to defaults. **Re-seeding does not delete
> contact messages.**

### 4. Production

```bash
npm run build
npm run start
```

---

## 🗄️ MongoDB notes
- **Local (macOS, Homebrew):** `brew services start mongodb-community`
- **Atlas:** create a free cluster, whitelist your IP, and paste the connection
  string into `MONGODB_URI`.
- Collections created: `galleryimages`, `videos`, `settings`, `messages`.

---

## 📁 Project structure

```
ressa-realestate/
├── public/images/             # all 58 source images (logo, flyers, events…)
├── scripts/seed.mjs           # seeds images + settings + videos
├── src/
│   ├── middleware.js          # protects /admin and /api/admin
│   ├── lib/
│   │   ├── mongodb.js         # cached Mongoose connection
│   │   ├── models.js          # GalleryImage, Video, Setting, Message
│   │   ├── auth.js            # JWT session + credential check
│   │   ├── defaults.js        # default editable content + image categoriser
│   │   └── content.js         # data getters (graceful fallback to defaults)
│   ├── components/
│   │   ├── Navbar, Footer, Gallery, ContactForm, WhatsAppButton, icons
│   │   └── admin/             # AdminDashboard, ImagesManager, VideosManager,
│   │                          # SettingsManager, MessagesManager
│   └── app/
│       ├── (site)/            # public pages (home, about, projects, videos, contact)
│       ├── admin/             # login + dashboard
│       └── api/               # auth, contact, admin CRUD + upload
```

---

## ⚠️ Deployment note (image uploads)
New images uploaded through the admin panel are written to
`public/images`. This works locally and on a normal Node/VPS host. On
**serverless platforms (e.g. Vercel)** the filesystem is read-only, so for
production there you should switch the upload route
(`src/app/api/admin/upload/route.js`) to a storage service such as Cloudinary,
S3 or Vercel Blob. Editing existing content and text works everywhere.

---

## 🔧 Customising
- **Colours / fonts:** `tailwind.config.js` (brand orange + navy palette).
- **Default content:** `src/lib/defaults.js` (or just edit live in the admin
  panel after seeding).
- **Add nav links:** `src/components/Navbar.js`.

---

Built with Next.js 14 (App Router), MongoDB/Mongoose, Tailwind CSS and `jose`.
