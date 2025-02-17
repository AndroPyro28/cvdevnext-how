/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.cvconnect.app',
          pathname: '/**',
        },
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          pathname: '/**',
        },
        {
          protocol: 'http', // Allow HTTP images from Cloudinary
          hostname: 'res.cloudinary.com',
          pathname: '/**',
        }
      ],
    },
    reactStrictMode: true, // Enable strict mode for React
  };
  
  export default nextConfig;