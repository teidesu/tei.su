import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [
        solid(),
    ],
    vite: {
        esbuild: { jsx: 'automatic' },
        define: {
            'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString().split('T')[0]),
        },
    },
    adapter: node({
        mode: 'standalone',
    }),
    server: {
        host: true,
    },
})
