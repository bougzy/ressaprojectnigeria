/**
 * Seed script — populates MongoDB with:
 *   1. Every image in /public/images (auto-categorised, none left out)
 *   2. The default editable site settings
 *   3. A couple of starter videos
 *
 * Run with:  npm run seed
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Pull in defaults + helpers (plain ESM import of the lib file).
const { DEFAULT_SETTINGS, categorise, prettyAlt } = await import(
  path.join(ROOT, "src/lib/defaults.js")
);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ressa";

/* --- inline schemas (mirror src/lib/models.js) --- */
const { Schema } = mongoose;
const GalleryImage = mongoose.model(
  "GalleryImage",
  new Schema(
    {
      src: String,
      alt: String,
      caption: String,
      category: String,
      year: String,
      order: Number,
      featured: Boolean,
    },
    { timestamps: true }
  )
);
const Video = mongoose.model(
  "Video",
  new Schema(
    { title: String, url: String, description: String, order: Number },
    { timestamps: true }
  )
);
const Setting = mongoose.model(
  "Setting",
  new Schema({ key: String, value: Schema.Types.Mixed }, { timestamps: true })
);

async function main() {
  console.log("→ Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("✓ Connected");

  // ---- 1. Images -----------------------------------------------------------
  const imgDir = path.join(ROOT, "public/images");
  const files = fs
    .readdirSync(imgDir)
    .filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f))
    .sort();

  await GalleryImage.deleteMany({});
  let order = 0;
  const docs = files.map((f) => {
    const { category, year } = categorise(f);
    return {
      src: `/images/${f}`,
      alt: prettyAlt(f, category),
      caption: "",
      category,
      year,
      order: order++,
      featured: category === "flyer" || category === "project",
    };
  });
  await GalleryImage.insertMany(docs);
  const counts = docs.reduce((a, d) => {
    a[d.category] = (a[d.category] || 0) + 1;
    return a;
  }, {});
  console.log(`✓ Inserted ${docs.length} images:`, counts);

  // ---- 2. Settings ---------------------------------------------------------
  await Setting.deleteMany({});
  const settingDocs = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
    key,
    value,
  }));
  await Setting.insertMany(settingDocs);
  console.log(`✓ Inserted ${settingDocs.length} settings`);

  // ---- 3. Starter videos ---------------------------------------------------
  await Video.deleteMany({});
  await Video.insertMany([
    {
      title: "Ressa Project Nigeria — Who We Are",
      url: "https://www.youtube.com/embed/ScMzIvxBSi4",
      description:
        "An introduction to Ressa Project Nigeria and our mission to make land ownership affordable. (Replace this with your own video from the admin panel.)",
      order: 0,
    },
    {
      title: "Landlords' & Landladies' Support Conference",
      url: "https://www.youtube.com/embed/ScMzIvxBSi4",
      description:
        "Highlights from our annual member conference. (Replace from the admin panel.)",
      order: 1,
    },
  ]);
  console.log("✓ Inserted starter videos");

  await mongoose.disconnect();
  console.log("✓ Done. You can now run: npm run dev");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
