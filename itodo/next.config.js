/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  output: 'export',
    distDir: 'dist',
    typescript: {
       ignoreBuildErrors: true,
    },
  };

  

module.exports = nextConfig