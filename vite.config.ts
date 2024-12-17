import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
})
