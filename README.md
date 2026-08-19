# Eisha's

One landing page, three stores: **Eisha's Collection** (apparel), **Eisha's Beauty**, and **Eisha's Jewelry**. Shared cart, shared customer accounts, shared admin panel — each store has its own visual identity, and every image (logos, hero banners, landing page panels, product photos) is uploaded straight from the admin panel.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- MongoDB Atlas via Mongoose
- Cloudinary for images (direct browser upload, no server proxy)
- NextAuth for customer login (email/password + Google)

## Project structure

```
app/
  page.js                 → landing page, full-height 3-way image split
  apparel/                 → Eisha's Collection home (maroon/gold, Fraunces)
    collection/                → full catalog: search, filter, sort
    [slug]/                    → product detail page
  beauty/                   → Eisha's Beauty home (blush/sage, Manrope)
    collection/
    [slug]/
  jewelry/                    → Eisha's Jewelry home (onyx/gold, Bodoni Moda)
    collection/
    [slug]/
  cart/                          → shared cart, grouped by store
  checkout/                       → shipping form, payment method → creates an order
  order-confirmation/[orderNumber] → payment instructions for the chosen method
  contact/                          → WhatsApp/phone/Instagram links, accepted payment methods
  login/                          → shared sign in / sign up
  admin/                           → password-gated: Products, Store design, Orders, Payment tabs
  api/
    auth/[...nextauth]            → NextAuth handler
    signup                         → customer account creation
    products, products/[id]         → list/create/delete/update products
    settings                          → per-store logo/hero/door image/Instagram settings
    orders, orders/[id]                → create/list orders, update payment/fulfillment status
    payment-settings                     → bank/EasyPaisa/JazzCash/SadaPay/contact details
    admin/login                        → admin password check
lib/
  mongodb.js     → cached DB connection
  cloudinary.js  → server-side Cloudinary config (available for future signed ops)
  auth.js        → NextAuth options (Google provider auto-disables without real credentials)
  currency.js    → PKR price formatting used everywhere
  orderNumber.js → generates sequential ES-0001 style order numbers
models/
  Product.js        → shared schema, has a `store` field (apparel/beauty/jewelry)
  Settings.js        → one doc per store: logo, doorImage, heroImage (+ mobile variants), instagramUrl
  PaymentSettings.js  → single doc: all payment methods + WhatsApp/phone/instructions
  Counter.js           → backs the sequential order number generator
  User.js
  Order.js
context/
  CartContext.js → shared cart, persisted to localStorage
components/
  ImageUploader.js → drag-and-drop upload straight to Cloudinary
  HeroBanner.js → hero banner with optional separate mobile image (art-directed crop, not just resized)
  Footer.js → adapts to store theme or the neutral shell; Instagram/WhatsApp/phone links
  StoreNav.js, ProductGrid.js, FeaturedProducts.js, StoreCatalog.js, ProductDetail.js
  AdminLogin.js
  admin/OrdersPanel.js, admin/PaymentPanel.js
```


## How the theming works

Each store's `layout.js` loads its own Google Fonts and wraps its pages in a
themed `<div>` (`.apparel-theme`, `.beauty-theme`, `.jewelry-theme`). Each
theme file defines the same CSS variables — `--bg`, `--ink`, `--accent`,
`--accent-2`, `--gold`, `--font-display`, `--font-body` — with different
values. Tailwind's config maps generic classes (`bg-theme-bg`,
`text-theme-accent`, `font-display`, etc.) to those variables, so
`StoreNav`, `ProductGrid`, and friends are written once and automatically
pick up whichever store they're rendered inside.

## Image uploads

The admin panel uploads directly from the browser to Cloudinary using an
**unsigned upload preset** — this deliberately avoids routing large files
through our own API routes, since Vercel serverless functions cap request
bodies at 4.5MB (the same limit you hit with CRC Core's video uploads).

To set this up:
1. In your Cloudinary dashboard, go to Settings → Upload → Upload presets
2. Add an upload preset, set **Signing Mode** to "Unsigned", give it a name
3. Put that name in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — your Atlas connection string (non-SRV format if you hit
     the same Windows DNS issue as CRC Core)
   - `CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — same value,
     just needs to exist in both a server and a client-exposed variable
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — from the step above
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate one
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional, from Google Cloud Console
   - `ADMIN_PASSWORD` — whatever you want the admin password to be
3. `npm run dev` → http://localhost:3000

## Using the admin panel

Go to `/admin`, enter the admin password. Two tabs per store:

- **Products** — drag and drop (or click to browse) as many images as you
  want per product; the first one becomes the main product image. Set
  price, category, stock, size/color/material/skin-type fields depending
  on the store, and optionally mark it "Featured" to show it in that
  store's Featured section.
- **Store design** — upload the nav logo, the landing page split-screen
  image, and the store's own hero banner. For the split-screen image and
  the hero banner, there's also an optional mobile version of each — if
  a desktop photo is a wide shot that would crop awkwardly on a tall
  phone screen, upload a differently-cropped mobile version and it'll
  automatically be served to phones instead (falls back to the desktop
  image if you don't bother uploading one). Nothing shows on the
  storefront for a store until you've uploaded at least a door image
  (landing page) and ideally a hero image too.

## What each store page has

- Full-bleed hero banner (from Store design settings) with the store name
- A Featured section (products marked "Featured" in the admin panel)
- Search bar, category filter, and sort (newest / price low-high / high-low)
- Product grid → click through to a full product detail page with an
  image gallery, size selector (apparel), and add-to-cart

## Checkout, orders & payment

Checkout offers a choice of manual payment methods, designed so a real
gateway can be dropped in later without rebuilding the flow:

1. Customer fills out shipping details at `/checkout` and picks a payment
   method — **EasyPaisa, JazzCash, SadaPay, Bank Transfer, or Cash on
   Delivery**. Only methods you've actually configured in the admin
   **Payment** tab show up as options; COD has its own on/off toggle since
   it doesn't have account details to check for.
2. An order is created with a sequential order number (`ES-0001`, `ES-0002`, ...),
   stock is decremented, and `paymentStatus` starts as `pending_verification`
   (for COD this just means "not yet collected")
3. They land on `/order-confirmation/[orderNumber]`, which shows instructions
   for whichever method they picked, plus a WhatsApp button to send payment
   proof (skipped for COD, since there's nothing to send proof of yet)
4. You confirm payment came in and mark the order **Paid** from the admin
   **Orders** tab, and update fulfillment status (processing/shipped/etc.)
   from there too, with a Print invoice button for each order

To swap in a real gateway later (Safepay, a direct EasyPaisa/JazzCash
merchant API, etc.): the pieces that change are the payment step in
`/checkout` and `paymentMethod`/`paymentStatus` on the `Order` model —
everything else (order numbers, stock, the Orders admin tab) stays the same.

All prices display in PKR (`Rs 1,200` format) via `lib/currency.js`.

## Collection pages & Contact page

Each store's home page (hero + featured products) is now separate from its
**Collection** page (`/apparel/collection`, etc.) — the full catalog with
search, category filter, and sort. `StoreNav`'s "Shop" link and the "Shop
the full collection" button on each home page both point there.

`/contact` is a site-wide page (not store-specific) showing your WhatsApp
and phone links, each store's Instagram (set per-store in the admin Design
tab), and a summary of which payment methods you currently accept. The
footer links to it from everywhere.

## What's not built yet (on purpose — this is a solid base to build on)

- **A real payment gateway** — currently manual transfer/COD with
  admin-side verification (see above). Fine to start with, worth upgrading
  once you're getting consistent volume.
- **Order history** on the customer account page (the `Order` model tracks
  `user` when someone's signed in, but there's no page listing a customer's
  past orders yet).
- **Deleting a product's Cloudinary images when the product is deleted** —
  currently just removes the database record.
- **Shipping cost** — checkout currently has no delivery fee logic, `total`
  is just the cart subtotal.

## Deploying

Push to GitHub, import into Vercel, add the environment variables in the
Vercel dashboard, connect your domain the same way you did for CRC Core.

