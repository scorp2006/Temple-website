/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow remote images (Unsplash for demo, Cloudinary/S3 in production).
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
};

export default nextConfig;
