/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    distDir: process.env.NEXT_DIST_DIR || ".next",
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
