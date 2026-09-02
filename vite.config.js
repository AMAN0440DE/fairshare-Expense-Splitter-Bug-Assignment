import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173,
    strictPort: false // FIXED: Allows dynamic allocation scaling if 5173 is occupied
  },
});
