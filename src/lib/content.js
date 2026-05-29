import { dbConnect } from "./mongodb";
import { GalleryImage, Video, Setting } from "./models";
import { DEFAULT_SETTINGS } from "./defaults";

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

/** Group event images by year, newest year first. */
export function groupByYear(images) {
  const groups = {};
  for (const img of images) {
    const y = img.year || "Other";
    (groups[y] = groups[y] || []).push(img);
  }
  return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}
