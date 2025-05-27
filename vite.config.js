import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Split chunks for better caching
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  server: {
    host: 'localhost',
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Keep the /api prefix
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Optimize output bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons', 'framer-motion', 'react-hot-toast'],
        },
      },
    },
    // Optimize asset size
    assetsInlineLimit: 4096, // 4kb
    // Gzip compressed files
    brotliSize: true,
    // Adjust chunk size warning limit
    chunkSizeWarningLimit: 1000,
  }
})
