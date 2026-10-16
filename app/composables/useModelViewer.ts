let loading: Promise<void> | null = null

/** Lazily registers <model-viewer> and points its decoders at our own
 *  self-hosted copies (no third-party requests). */
export function loadModelViewer() {
  if (!import.meta.client) return Promise.resolve()
  loading ??= import('@google/model-viewer').then(() => {
    const MV = customElements.get('model-viewer') as unknown as { dracoDecoderLocation: string }
    MV.dracoDecoderLocation = '/draco/'
  })
  return loading
}

export const absoluteUrl = (path: string) => (import.meta.client ? new URL(path, window.location.origin).href : path)
