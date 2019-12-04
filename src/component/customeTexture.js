import * as THREE from 'three'

function createLinesTexture(color = 0x00e1ca) {
  const width = 2000
  const height = 2000
  const threeColor = new THREE.Color(color)
  const size = width * height

  // used the buffer to create a DataTexture
  const data = new Uint8Array(3 * size)
  const squareWidth = 20
  const r = Math.floor(threeColor.r * 255)
  const g = Math.floor(threeColor.g * 255)
  const b = Math.floor(threeColor.b * 255)
  const colorArray = [r, g, b]
  const dim = 3
  for (let i = 0; i < size; i++) {
    const strides = [
      i,
      i - 1,
      // i - 2,
      i - width,
      // i - 2 * width,
    ].map(s => s * dim)
    const [verticalLine, horizontalLine] = [
      (i % (squareWidth * width)) / width < 1,
      i % squareWidth === 0,
    ]
    for (let j = 0; j < dim; j++) {
      for (let k = 0; k < strides.length; k++) {
        const p = strides[k]
        if (verticalLine && (k > 1 || k === 0)) {
          data[p + j] = colorArray[j]
        } else if (horizontalLine && k <= 1) {
          data[p + j] = colorArray[j]
        } else {
          if (k === 0) data[p + j] = 255
        }
      }
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  texture.needsUpdate = true
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearMipmapLinearFilter
  return texture
}

function createColorTexture(color = 0x0) {
  const width = 512
  const height = 512
  const threeColor = new THREE.Color(color)
  const size = width * height
  const dim = 4

  // used the buffer to create a DataTexture
  const data = new Uint8ClampedArray(dim * size)
  const r = Math.floor(threeColor.r * 255)
  const g = Math.floor(threeColor.g * 255)
  const b = Math.floor(threeColor.b * 255)
  const a = 0
  const colorArray = [r, g, b, a]

  for (let i = 0; i < size; i++) {
    const point = i * dim
    for (let j = 0; j < dim; j++) {
      data[point + j] = colorArray[j]
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  texture.needsUpdate = true
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearMipmapLinearFilter
  return texture
}

const lineTextureMap = createLinesTexture()

/**
 * @param {ImageData} imageData
 */
const generateImg = color => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const colorHexString = new THREE.Color(color).getHexString()
  ctx.fillStyle = `#${colorHexString}`
  ctx.fillRect(0, 0, 512, 512)
  const img = new Image()
  img.src = canvas.toDataURL('image/jpeg')
  return img
}

const createCubeColorTextureMap = color => {
  const linearCubeColorTextureMap = new THREE.CubeTexture(
    Array(6)
      .fill(null)
      .map(() => generateImg(color)),
    THREE.CubeReflectionMapping,
  )
  linearCubeColorTextureMap.format = THREE.RGBFormat
  return linearCubeColorTextureMap
}

export {
  lineTextureMap,
  createLinesTexture,
  createColorTexture,
  createCubeColorTextureMap,
}
