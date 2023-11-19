import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    server: {
      port: 45002
    },
    preview: {
      port: 45002
    },
    plugins: [
      basicSsl()
    ]
  })