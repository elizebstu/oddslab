import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            // React and React-Dom
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // i18n
            if (id.includes('i18next')) {
              return 'i18n-vendor'
            }
            // Other vendor
            return 'vendor'
          }

          // Split application code
          if (id.includes('/src/components/ui')) {
            return 'ui-components'
          }
          if (id.includes('/src/components/')) {
            return 'components'
          }
          if (id.includes('/src/pages/')) {
            return 'pages'
          }
          if (id.includes('/src/hooks/')) {
            return 'hooks'
          }
          if (id.includes('/src/services/')) {
            return 'services'
          }
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600 // Increase limit slightly for realistic app size
  }
})
