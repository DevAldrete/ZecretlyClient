/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Assuming this project might use Vite or can benefit from its React plugin for Vitest

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Using react plugin for JSX/TSX transformation if needed by Vitest
  test: {
    globals: true, // Makes describe, test, expect, etc. available globally
    environment: 'jsdom', // Use JSDOM for simulating browser environment
    setupFiles: './src/setupTests.ts', // Optional setup file for tests
    css: false, // Disable CSS processing for tests if not needed, can speed up tests
  },
});
