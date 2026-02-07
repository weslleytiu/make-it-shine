import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** SPA fallback: serve index.html for client routes so refresh on e.g. /professionals doesn't 404 */
function spaFallback() {
  const staticExtensions = /\.(js|ts|tsx|jsx|css|json|ico|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|map)(\?.*)?$/i
  const rewrite = (url: string) => {
    const q = url.includes('?') ? url.slice(url.indexOf('?')) : ''
    return '/' + q
  }
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || !req.url) return next()
        const pathname = req.url.replace(/\?.*/, '')
        if (pathname.startsWith('/@') || pathname.startsWith('/node_modules') || staticExtensions.test(pathname)) return next()
        req.url = rewrite(req.url)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || !req.url) return next()
        const pathname = req.url.replace(/\?.*/, '')
        if (pathname.startsWith('/@') || staticExtensions.test(pathname)) return next()
        req.url = rewrite(req.url)
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
