import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const isDev = mode !== 'production';

    return {
        plugins: [
            react({
                babel: isDev
                    ? {
                          plugins: [
                              '@babel/plugin-transform-react-jsx-self',
                              '@babel/plugin-transform-react-jsx-source',
                          ],
                      }
                    : undefined,
            }),
        ],
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    builder: resolve(__dirname, 'builder/index.html'),
                },
            },
        },
    };
});
