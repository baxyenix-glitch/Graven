import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const parseDevOrigins = () => {
  const custom = process.env.DEV_ALLOWED_ORIGINS
    ? process.env.DEV_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  
  return [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.*:*',
    '10.*.*:*',
    '*.ngrok-free.app',
    '*.loca.lt',
    ...custom,
  ];
};

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: true,
  allowedDevOrigins: parseDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
