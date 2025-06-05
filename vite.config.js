import { defineConfig } from 'vite';

export default defineConfig({
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
