import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://heraldsclothing.com',
      dynamicRoutes: [
        '/',
        '/products',
        '/customizable',
        '/about',
        '/contact',
      ],
      // Exclude dynamic product detail pages (can't enumerate at build time)
      exclude: ['/product/*'],
      // Default values (overridden per-route below)
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
      // Generate robots.txt pointing to the sitemap
      generateRobotsTxt: false, // we have our own robots.txt in /public
    }),
  ],
  optimizeDeps: {
    include: ['fabric']
  }
})
