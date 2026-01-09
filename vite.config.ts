import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast process to any because the Process type definition is missing cwd in this environment
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    base: './',
    plugins: [react()],
    define: {
      // This ensures that 'process.env.API_KEY' in your code is replaced
      // with the actual string value from the .env file during build/serve.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    server: {
      proxy: {
        '/api/wp': {
          target: 'https://metarh.com.br/metarhnews/wp-json/wp/v2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/wp/, '')
        }
      }
    }
  };
});