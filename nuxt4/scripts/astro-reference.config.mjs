// Comparison harness only. The Nuxt application never imports this file.
// Keep edits in the nested application from restarting the Astro reference server.
import original from '../../astro.config.mjs';
export default {
  ...original,
  vite: { server: { watch: { ignored: ['**/nuxt4/**'] } } },
};
