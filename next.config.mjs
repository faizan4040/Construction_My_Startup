/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
        search: ''
      }
    ]
  },
  // Only compile the icons/components actually used instead of whole libraries
  // (prevents dev server running out of memory).
  experimental: {
    optimizePackageImports: [
      '@mui/icons-material',
      '@mui/material',
      'react-icons',
      'lucide-react',
      'recharts',
      'framer-motion',
      'dayjs',
    ],
  },
};

export default nextConfig;
