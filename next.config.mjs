/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local images live in /public/images. Allow large source photos to be optimized.
    formats: ["image/webp"],
    remotePatterns: [],
  },
  // ffmpeg-static resolves its binary path dynamically at runtime (based on
  // os.platform()/os.arch()), so Next's automatic file tracing can't detect
  // it as a dependency of the upload route — without this, the ffmpeg
  // binary would be silently missing from the deployed serverless function.
  experimental: {
    outputFileTracingIncludes: {
      "/api/admin/upload": ["./node_modules/ffmpeg-static/**"],
    },
  },
};

export default nextConfig;
