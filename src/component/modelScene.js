import * as THREE from 'three'

// const r = './assets/thehive.'

const r = './assets/'
const whtUrls = [
  'wht.x+.jpg',
  'wht.x-.png',
  'wht.y-.jpg',
  'wht.y+.jpg',
  'wht.z+.jpg',
  'wht.z-.png',
]
const textureGeneral = new THREE.TextureLoader().setPath(r).load(whtUrls[0])

const textureCubeWht = new THREE.CubeTextureLoader().setPath(r).load(whtUrls)

const textureCubeRefractionWht = new THREE.CubeTextureLoader()
  .setPath(r)
  .load(whtUrls)
textureCubeRefractionWht.mapping = THREE.CubeRefractionMapping

const scene = new THREE.Scene()

const cubes = [
  'desert',
  'greenland',
  'horsefarm',
  'mountains',
  'mountainsmoon',
  'nightmoon',
  'starssky',
  'sea',
  'sky',
]
const options = [['White', 'Wht'], ...cubes.map(n => [n, n])]
const directions = ['x+', 'x-', 'y+', 'y-', 'z+', 'z-']
const [
  [textureCubedesert, textureCubeRefractiondesert],
  [textureCubegreenland, textureCubeRefractiongreenland],
  [textureCubehorsefarm, textureCubeRefractionhorsefarm],
  [textureCubemountains, textureCubeRefractionmountains],
  [textureCubemountainsmoon, textureCubeRefractionmountainsmoon],
  [textureCubenightmoon, textureCubeRefractionnightmoon],
  [textureCubestarssky, textureCubeRefractionstarssky],
  [textureCubesea, textureCubeRefractionsea],
  [textureCubesky, textureCubeRefractionsky],
] = cubes.map(dir => {
  const textureCube = new THREE.CubeTextureLoader()
    .setPath(`${r}${dir}/`)
    .load(directions.map(n => `${n}.jpg`))
  textureCube.mapping = THREE.CubeReflectionMapping
  const textureCubeRefraction = new THREE.CubeTextureLoader()
    .setPath(`${r}${dir}/`)
    .load(directions.map(n => `${n}.jpg`))
  textureCubeRefraction.mapping = THREE.CubeRefractionMapping

  return [textureCube, textureCubeRefraction]
})

export {
  scene as default,
  options as backgroundOptions,
  textureGeneral,
  textureCubeWht,
  textureCubesky,
  textureCubedesert,
  textureCubegreenland,
  textureCubehorsefarm,
  textureCubemountains,
  textureCubemountainsmoon,
  textureCubenightmoon,
  textureCubestarssky,
  textureCubesea,
  textureCubeRefractionWht,
  textureCubeRefractionsky,
  textureCubeRefractiondesert,
  textureCubeRefractiongreenland,
  textureCubeRefractionhorsefarm,
  textureCubeRefractionmountains,
  textureCubeRefractionmountainsmoon,
  textureCubeRefractionnightmoon,
  textureCubeRefractionstarssky,
  textureCubeRefractionsea,
}
