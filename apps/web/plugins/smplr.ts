import { loadSmplrJs, type Smplr } from "@smplrspace/smplr-loader";
import { defineNuxtPlugin } from '#app'

/**
 * Plugin pour injecter Smplr dans le contexte de l'application
 */
export default defineNuxtPlugin(async () => {
  let smplr: Smplr;

  /**
   * Empêche l'erreur document is not defined en console
   */
  if (typeof document !== 'undefined') {
    try {
      smplr = await loadSmplrJs('umd');
    } catch (e) {
      console.error('Failed to load Smplr', e);
    }
  }

  return {
    provide: {
      client: () => smplr
    }
  }
});