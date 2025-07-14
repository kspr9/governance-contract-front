import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import type { Plugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    sveltekit(), 
    //tailwindcss()
  ],
  ssr: {
    external: ['@taquito/taquito', '@taquito/beacon-wallet', '@airgap/beacon-sdk', '@airgap/beacon-blockchain-substrate']
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      process: 'process/browser',
      util: 'util',
      events: 'events',
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