import { dbConnect } from "./mongodb";
import { GalleryImage, Video, Setting, Section } from "./models";
import { DEFAULT_SETTINGS, DEFAULT_SECTIONS } from "./defaults";

/**
 * Returns the merged settings object (DB values override defaults). Falls back
 * entirely to defaults if the database is unreachable so the public site never
 * crashes.
 */
export async function getSettings() {
  try {
    await dbConnect();
    const rows = await Setting.find({}).lean();
    const fromDb = {};
    for (const r of rows) fromDb[r.key] = r.value;
    return { ...DEFAULT_SETTINGS, ...fromDb };
  } catch (e) {
    console.error("getSettings fallback to defaults:", e.message);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getImages(filter = {}) {
  try {
    await dbConnect();
    const q = {};
    if (filter.category) q.category = filter.category;
    if (filter.year) q.year = filter.year;
    const imgs = await GalleryImage.find(q)
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return imgs.map((i) => ({ ...i, _id: i._id.toString() }));
  } catch (e) {
    console.error("getImages error:", e.message);
    return [];
  }
}

export async function getVideos() {
  try {
    await dbConnect();
    const vids = await Video.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return vids.map((v) => ({ ...v, _id: v._id.toString() }));
  } catch (e) {
    console.error("getVideos error:", e.message);
    return [];
  }
}

/**
 * Returns the ordered list of sections for a given page (default "home").
 * Falls back to the built-in defaults if none have been seeded/created yet,
 * so the site never renders blank.
 */
export async function getSections(page = "home", { onlyVisible = true } = {}) {
  try {
    await dbConnect();
    const q = { page };
    if (onlyVisible) q.visible = { $ne: false };
    const rows = await Section.find(q).sort({ order: 1, createdAt: 1 }).lean();
    if (!rows.length && page === "home") {
      return onlyVisible
        ? DEFAULT_SECTIONS.filter((s) => s.visible !== false)
        : DEFAULT_SECTIONS;
    }
    return rows.map((r) => ({ ...r, _id: r._id.toString() }));
  } catch (e) {
    console.error("getSections fallback to defaults:", e.message);
    return onlyVisible
      ? DEFAULT_SECTIONS.filter((s) => s.visible !== false)
      : DEFAULT_SECTIONS;
  }
}

/** Group event images by year, newest year first. */
export function groupByYear(images) {
  const groups = {};
  for (const img of images) {
    const y = img.year || "Other";
    (groups[y] = groups[y] || []).push(img);
  }
  return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}
