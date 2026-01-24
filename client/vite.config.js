import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
})

/**
 * target: 'http://localhost:3000',

That’s your backend server address and port.

Vite acts like a middleman:

Browser talks to Vite (5173)

Vite talks to backend (3000)
 */ 
