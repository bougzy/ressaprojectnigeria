import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

/* -------------------------------------------------------------------------- */
/* GalleryImage — every photo, flyer and logo used across the site            */
/* -------------------------------------------------------------------------- */
const GalleryImageSchema = new Schema(
  {
    src: { type: String, required: true }, // e.g. /images/SC-2.jpg
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    // category: hero | flyer | project | event | logo | about | misc
    category: { type: String, default: "event", index: true },
    year: { type: String, default: "" }, // "2020".."2024" for events
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/* Video — embedded videos (YouTube / direct URL)                             */
/* -------------------------------------------------------------------------- */
const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true }, // youtube watch/embed or mp4
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/* Setting — singleton-ish key/value store for all editable site text         */
/* -------------------------------------------------------------------------- */
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

/* -------------------------------------------------------------------------- */
/* Message — contact form submissions                                         */
/* -------------------------------------------------------------------------- */
const MessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GalleryImage =
  models.GalleryImage || model("GalleryImage", GalleryImageSchema);
export const Video = models.Video || model("Video", VideoSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);
export const Message = models.Message || model("Message", MessageSchema);
