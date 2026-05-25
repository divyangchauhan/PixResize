import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Canvas stub
// happy-dom doesn't implement HTMLCanvasElement.getContext / toDataURL / toBlob,
// so we provide lightweight stubs for unit tests that import imageProcessing.
// ---------------------------------------------------------------------------
class CanvasRenderingContext2DStub {
  canvas: HTMLCanvasElement
  filter = ''
  globalAlpha = 1
  font = ''
  fillStyle = ''
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  scale() {}
  drawImage() {}
  fillText() {}
  measureText(text: string) { return { width: text.length * 8 } }
  clearRect() {}
  fillRect() {}
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value(type: string) {
    if (type === '2d') return new CanvasRenderingContext2DStub(this)
    return null
  },
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value() { return 'data:image/png;base64,stub' },
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value(cb: (b: Blob | null) => void, _mime?: string) {
    cb(new Blob(['stub'], { type: _mime ?? 'image/png' }))
  },
})
