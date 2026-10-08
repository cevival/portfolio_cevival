// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Page de labo de la ville (/lab) : la scène 3D seule, pilotée par l'URL, pour
 * régler un bâtiment ou régénérer les images d'attente. Elle n'est servie que
 * par `npm run dev` et n'existe pas dans le site construit.
 * @type {import('astro').AstroIntegration}
 */
const cityLab = {
  name: 'city-lab',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') injectRoute({ pattern: '/lab', entrypoint: './src/lab/lab.astro' });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // Adresse publique : sert aux liens absolus (carte de partage, URL canonique)
  site: 'https://guillaume-desplan.vercel.app',
  integrations: [react(), cityLab],

  vite: {
    plugins: [tailwindcss()]
  }
});
