/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local images live in /public/images. Allow large source photos to be optimized.
    formats: ["image/webp"],
    remotePatterns: [],
  },
};

export default nextConfig;
