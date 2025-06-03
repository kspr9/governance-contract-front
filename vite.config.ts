import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import type { Plugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(), 
    //tailwindcss()
  ],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      crypto: 'rollup-plugin-node-polyfills/polyfills/crypto-browserify',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis for esbuild
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins for Node.js globals and modules.
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
    include: [
      '@taquito/beacon-wallet',
      '@airgap/beacon-dapp',
      'buffer', 
      'events', 
      'util', 
      'stream-browserify',
      'crypto-browserify'
    ]
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill() as Plugin,
      ],
    },
  },
})