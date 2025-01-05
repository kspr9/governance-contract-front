import { Buffer } from 'buffer'
window.Buffer = Buffer
globalThis.Buffer = Buffer

import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Correct Svelte 5 mounting syntax
mount(App, {
  target: document.getElementById('app')!
})

// If you need to export the app instance
export default App