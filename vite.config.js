import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths for assets so that the site works on any subpath (like GitHub Pages)
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
