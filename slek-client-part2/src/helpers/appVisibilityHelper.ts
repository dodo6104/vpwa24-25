import { AppVisibility } from 'quasar'

/**
 * Funkcia na kontrolu, či je aplikácia viditeľná.
 * @returns {boolean} - `true`, ak je aplikácia viditeľná, inak `false`.
 */
export function isAppVisible (): boolean {
  return AppVisibility.appVisible
}

/**
 * Funkcia na sledovanie zmien viditeľnosti aplikácie.
 * @param callback - Funkcia, ktorá sa spustí pri zmene viditeľnosti.
 */
export function watchVisibility (callback: (isVisible: boolean) => void): () => void {
  const visibilityChangeHandler = () => {
    callback(AppVisibility.appVisible)
  }

  document.addEventListener('visibilitychange', visibilityChangeHandler)

  // Voliteľné: vrátiť funkciu na odstránenie event listenera
  return () => {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
  }
}
