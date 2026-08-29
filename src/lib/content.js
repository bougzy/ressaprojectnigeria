import { dbConnect } from "./mongodb";
import { GalleryImage, Video, Setting, Section } from "./models";
import { DEFAULT_SETTINGS, DEFAULT_SECTIONS, DEFAULT_EXTRA_IMAGES } from "./defaults";

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
    await ensureExtraImagesSeeded();
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

const HOME_LAYOUT_V2_FLAG = "migrationHomeLayoutV2";

/**
 * Ensures every image listed in DEFAULT_EXTRA_IMAGES exists in the Images
 * library — inserting only the ones that are missing (matched by src), so
 * new curated images can be added to the codebase later and will appear
 * automatically without ever duplicating or resetting the admin's own
 * uploads. Safe to call on every request.
 */
export async function ensureExtraImagesSeeded() {
  if (!DEFAULT_EXTRA_IMAGES?.length) return;
  await dbConnect();
  const srcs = DEFAULT_EXTRA_IMAGES.map((i) => i.src);
  const existing = await GalleryImage.find({ src: { $in: srcs } }, { src: 1 }).lean();
  const existingSrc = new Set(existing.map((i) => i.src));
  const missing = DEFAULT_EXTRA_IMAGES.filter((i) => !existingSrc.has(i.src));
  if (!missing.length) return;
  const top = await GalleryImage.find({}).sort({ order: -1 }).limit(1).lean();
  const start = (top[0]?.order || 0) + 1;
  await GalleryImage.insertMany(
    missing.map((i, idx) => ({
      src: i.src,
      alt: i.alt || "",
      caption: i.caption || "",
      category: i.category || "misc",
      year: i.year || "",
      order: start + idx,
      featured: !!i.featured,
    }))
  );
}

/**
 * One-time upgrade: if the homepage hero section still has no slider
 * images (i.e. it predates the hero-carousel redesign), populate it with
 * the current default slides. Never overwrites a hero that already has
 * slides — including ones the admin has customised themselves — so this
 * is safe to call on every request and only acts once per site.
 */
export async function ensureHeroSliderSeeded() {
  await dbConnect();
  const hero = await Section.findOne({ page: "home", key: "hero" });
  if (!hero) return;
  if (Array.isArray(hero.items) && hero.items.length > 0) return;
  const def = DEFAULT_SECTIONS.find((s) => s.key === "hero");
  if (!def?.items?.length) return;
  hero.items = def.items;
  await hero.save();
}

/**
 * Ensures every section defined in DEFAULT_SECTIONS exists in the DB for the
 * homepage — inserting only the ones that are missing (new defaults added in
 * an update), without touching or resetting anything the admin has already
 * customised. Safe to call on every request.
 *
 * Also runs a one-time structural migration (guarded by a Setting flag) that
 * replaces the old "stats" strip with the new intro carousel right before
 * "Who We Are", and brings the projects sections up higher on the page —
 * matching the layout in DEFAULT_SECTIONS. This only ever runs once per
 * database; after that, admins are free to reorder sections however they
 * like from the dashboard without it being reset.
 */
export async function ensureHomeSectionsSeeded() {
  await dbConnect();
  const existing = await Section.find({ page: "home" }).lean();
  if (!existing.length) {
    await Section.insertMany(
      DEFAULT_SECTIONS.map((s) => ({ ...s, page: "home" }))
    );
    await Setting.updateOne(
      { key: HOME_LAYOUT_V2_FLAG },
      { $set: { key: HOME_LAYOUT_V2_FLAG, value: true } },
      { upsert: true }
    );
    return;
  }

  const existingKeys = new Set(existing.map((s) => s.key));
  const missing = DEFAULT_SECTIONS.filter((s) => !existingKeys.has(s.key));
  if (missing.length) {
    const maxOrder = existing.reduce((m, s) => Math.max(m, s.order || 0), -1);
    await Section.insertMany(
      missing.map((s, i) => ({ ...s, page: "home", order: maxOrder + 1 + i }))
    );
  }
  const flag = await Setting.findOne({ key: HOME_LAYOUT_V2_FLAG }).lean();
  if (!flag?.value) {
    // Remove the old stats strip — replaced by the intro carousel.
    await Section.deleteOne({ page: "home", key: "stats" });

    // Renumber every home section to match DEFAULT_SECTIONS' canonical
    // order. Anything not in DEFAULT_SECTIONS (an admin's own custom
    // section) keeps its relative order, appended after the known ones.
    const all = await Section.find({ page: "home" }).lean();
    const priority = DEFAULT_SECTIONS.map((s) => s.key);
    const known = all
      .filter((s) => priority.includes(s.key))
      .sort((a, b) => priority.indexOf(a.key) - priority.indexOf(b.key));
    const custom = all
      .filter((s) => !priority.includes(s.key))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const ordered = [...known, ...custom];

    await Promise.all(
      ordered.map((s, i) => Section.findByIdAndUpdate(s._id, { order: i }))
    );

    await Setting.updateOne(
      { key: HOME_LAYOUT_V2_FLAG },
      { $set: { key: HOME_LAYOUT_V2_FLAG, value: true } },
      { upsert: true }
    );
  }

  await ensureHeroSliderSeeded();
}

/**
 * Returns the ordered list of sections for a given page (default "home").
 * Falls back to the built-in defaults if none have been seeded/created yet,
 * so the site never renders blank.
 */
export async function getSections(page = "home", { onlyVisible = true } = {}) {
  try {
    await dbConnect();
    if (page === "home") await ensureHomeSectionsSeeded();
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
