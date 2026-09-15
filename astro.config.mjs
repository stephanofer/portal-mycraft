// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/inter-latin-400-normal.woff2'],
            weight: 400,
            style: 'normal'
          },
          {
            src: ['./src/assets/fonts/inter-latin-500-normal.woff2'],
            weight: 500,
            style: 'normal'
          }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'Clash Display',
      cssVariable: '--font-clash-display',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/ClashDisplay-Variable.woff2'],
            weight: '200 700',
            style: 'normal'
          }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'Minecraft Seven',
      cssVariable: '--font-minecraft-seven',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/Seven.woff2'],
            weight: 400,
            style: 'normal'
          }
        ]
      }
    }
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
