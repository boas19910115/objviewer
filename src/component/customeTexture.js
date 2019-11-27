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

  const texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBFormat,
    // THREE.UnsignedByteType,
    // THREE.UVMapping,
  )
  texture.needsUpdate = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearMipmapLinearFilter
  console.log(texture)

  return texture
}

function createColorTexture(color = 0x0) {
  const width = 2000
  const height = 2000
  const threeColor = new THREE.Color(color)
  const size = width * height

  // used the buffer to create a DataTexture
  const data = new Uint8Array(3 * size)
  const r = Math.floor(threeColor.r * 255)
  const g = Math.floor(threeColor.g * 255)
  const b = Math.floor(threeColor.b * 255)
  const colorArray = [r, g, b]
  const dim = 3
  for (let i = 0; i < size; i++) {
    const point = i * 3
    for (let j = 0; j < dim; j++) {
      data[point + j] = colorArray[j]
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  texture.needsUpdate = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearMipmapLinearFilter
  console.log(texture)

  return texture
}

const lineTextureMap = createLinesTexture()
const linearCubeTextrueMap = new THREE.CubeTexture(
  Array(6).fill(lineTextureMap.image),
)

linearCubeTextrueMap.format = THREE.RGBFormat

export {
  lineTextureMap,
  createLinesTexture,
  createColorTexture,
  linearCubeTextrueMap,
}
