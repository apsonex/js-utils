import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'happy-dom',
      },
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'ApsonexJsUtils',
            fileName: (format) => `apx-js-utils.${format}.js`,
        },
        rollupOptions: {
            // Exclude dependencies you don’t want to bundle
            external: [],
            output: {
                globals: {},
            },
        },
    },
});
