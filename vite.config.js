import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost/hitty-deliveries/public',
        changeOrigin: true,
      }
    }
  }
})
