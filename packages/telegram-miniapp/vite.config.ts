import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import path from 'path';

// Path to your common .env file
const envPath = path.resolve(__dirname, '../../.env');

// Load environment variables manually
dotenv.config({ path: envPath });

console.log('API_URL', process.env.API_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/idiom-bot/',
  server: {
    open: true,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.API_URL),
  }
})
