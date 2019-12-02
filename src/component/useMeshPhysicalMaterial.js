import * as THREE from 'three'
import React, { useReducer, useCallback, useMemo, useState } from 'react'
import { Radio } from 'semantic-ui-react'
import { ParametricGeometries } from 'three/examples//jsm/geometries/ParametricGeometries'
import { Curves } from 'three/examples//jsm/curves/CurveExtras'
import './useMeshPhysicalMaterial.scss'
import { ColorSelector, adjustableAmbientLight } from './helper'

const matInit = {
  PHYSIC_MAT(mat) {
    mat.metalness = 0
  },
  PHONG_MAT(mat) {
    mat.shininess = 0
  },
}

const matProps = {
  PHYSIC_MAT: [
    'envMap',
    'flatShading',
    'metalness',
    'roughness',
    'wireframe',
    'color',
    'clearcoat',
    'reflectivity',
  ],
  PHONG_MAT: [
    'reflectivity',
    'shininess',
    'color',
    'envMap',
    'flatShading',
    'wireframe',
  ],
}

const matTypes = {
  PHYSIC: 'PHYSIC_MAT',
  PHONG: 'PHONG_MAT',
}

const matLib = {
  PHYSIC_MAT: THREE.MeshPhysicalMaterial,
  PHONG_MAT: THREE.MeshPhongMaterial,
}

export const currentMeshStore = {
  PHYSIC_MAT: new THREE.MeshPhysicalMaterial(),
  PHONG_MAT: new THREE.MeshPhongMaterial(),
  originalMaterial: null,
  /**
   * @type {THREE.Mesh}
   */
  childAddress: null,
  envMap: null,
  /**
   * @param {object} child
   * @param {THREE.Mesh} child.material
   */
  storeCurrentMesh: child => {
    currentMeshStore.childAddress = child
    currentMeshStore.originalMaterial = child.material.clone(true)
    currentMeshStore.envMap = child.material.envMap
  },
}

function createGeometry() {
  const heartShape = new THREE.Shape() // From http://blog.burlock.org/html5/130-paths
  const x = 0
  const y = 0
  heartShape.moveTo(x + 25, y + 25)
  heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y)
  heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35)
  heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95)
  heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35)
  heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y)
  heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25)
  const extrudeSettings = {
    depth: 16,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1,
  }
  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
  geometry.rotateX(Math.PI)
  geometry.scale(0.4, 0.4, 0.4)
  return geometry
}

export const heartsSample = new THREE.Mesh(
  createGeometry(),
  currentMeshStore[currentMeshStore.CURRENT],
)

heartsSample.scale.set(10, 10, 10)
heartsSample.position.set(-1000, 1000, 0)

const geometry = new THREE.SphereBufferGeometry(250, 32, 16)
export const sphereSample = new THREE.Mesh(
  geometry,
  currentMeshStore[currentMeshStore.CURRENT],
)
sphereSample.position.set(1000, 1000, 0)

const GrannyKnot = new Curves.GrannyKnot()
const tube = new ParametricGeometries.TubeGeometry(
  GrannyKnot,
  100,
  3,
  8,
  true,
  false,
)

export const tubeSample = new THREE.Mesh(
  tube,
  currentMeshStore[currentMeshStore.CURRENT],
)
tubeSample.position.set(-1000, 1000, 0)
tubeSample.scale.set(10, 10, 10)

const meshList = [heartsSample, sphereSample, heartsSample]

function switchMaterial(name) {
  activate(name)
}

function activate(currentType) {
  const list = [currentMeshStore.childAddress, ...meshList]
  const correctPropKeys = Object.keys(currentMeshStore.originalMaterial).filter(
    key => matProps[currentType].includes(key),
  )
  const correctProps = correctPropKeys.reduce((pre, curKey) => {
    return { ...pre, [curKey]: currentMeshStore.originalMaterial[curKey] }
  }, {})
  const renewMaterial = new matLib[currentType]({
    ...correctProps,
  })
  matInit[currentType](renewMaterial)
  list.forEach(m => {
    m.material = renewMaterial
  })
  currentMeshStore[currentType] = renewMaterial
}

const actionTypes = {
  TURN_ON_PHYSICALMESH: 'ON',
  TURN_OFF_USE_PHYSICALMESH: 'OFF',
  SWITCH_MATERIAL: 'switch material type',
  ACTIVATE: 'activate',
  change: {
    COLOR: 'color',
    ROUGHTNESS: 'roughness',
    METALNESS: 'metalness',
    REFLECTIVITY: 'reflectivity',
    CLEARCOAT: 'clearcoat',
    FLATSHADIN: 'flatShading',
    WIREFRAME: 'wireframe',
    SHININESS: 'shininess',
    REFLECTION: 'envMap',
  },
}

const syncChange = (callback, ...targets) => targets.forEach(callback)

const useMeshPhysicalMaterial = () => {
  return useReducer(
    /**
     * @param {THREE.MeshPhysicalMaterial} meshPhysicalMaterial
     */
    (state, action) => {
      const { payload } = action
      const chageValue = payload ? payload[action.type] : null
      const {
        childAddress: { material },
      } = currentMeshStore
      switch (action.type) {
        case actionTypes.change.COLOR: {
          material.color = new THREE.Color(chageValue)
          return { ...state, changeColor: chageValue }
        }
        case actionTypes.change.SHININESS: {
          material.shininess = chageValue
          break
        }
        case actionTypes.change.ROUGHTNESS: {
          material.roughness = chageValue * 0.01
          break
        }
        case actionTypes.change.METALNESS: {
          material.metalness = chageValue * 0.01
          break
        }
        case actionTypes.change.REFLECTIVITY: {
          material.reflectivity = chageValue * 0.01
          break
        }
        case actionTypes.change.CLEARCOAT: {
          material.clearcoat = chageValue * 0.01
          break
        }
        case actionTypes.change.REFLECTION: {
          const { currentType } = state
          const correctPropKeys = Object.keys(material).filter(key =>
            matProps[currentType].includes(key),
          )
          const correctProps = correctPropKeys.reduce((pre, curKey) => {
            return { ...pre, [curKey]: material[curKey] }
          }, {})
          const renewMaterial = new matLib[currentType]({
            ...correctProps,
            envMap: chageValue,
          })
          syncChange(
            t => (t.material = renewMaterial),
            currentMeshStore.childAddress,
            ...meshList,
          )
          break
        }
        case actionTypes.change.FLATSHADIN: {
          const { currentType } = state
          const correctPropKeys = Object.keys(material).filter(key =>
            matProps[currentType].includes(key),
          )
          const correctProps = correctPropKeys.reduce((pre, curKey) => {
            return { ...pre, [curKey]: material[curKey] }
          }, {})
          const renewMaterial = new matLib[currentType]({
            ...correctProps,
            flatShading: !!chageValue,
          })
          syncChange(
            t => (t.material = renewMaterial),
            currentMeshStore.childAddress,
            ...meshList,
          )
          break
        }
        case actionTypes.change.WIREFRAME: {
          material.wireframe = !!chageValue
          break
        }
        case actionTypes.ACTIVATE: {
          const { currentType } = state
          activate(currentType)
          return { ...state }
        }
        case actionTypes.SWITCH_MATERIAL: {
          const { currentType } = state
          const nextType = {
            PHONG_MAT: 'PHYSIC_MAT',
            PHYSIC_MAT: 'PHONG_MAT',
          }[currentType]
          switchMaterial(nextType)
          return { ...state, currentType: nextType }
        }
        default: {
          return { ...state }
        }
      }
      return { ...state }
    },
    {
      currentType: matTypes.PHYSIC,
    },
  )
}

const openControllerType = {
  OPEN: 'c-open',
  CLOSE: 'c-close',
}

export const MeshPhysicalMaterialController = () => {
  const [openController, setOpenController] = useState(openControllerType.OPEN)
  const isControllerOpen = openController === openControllerType.OPEN
  const handleOpenButtonOnClick = useCallback(
    () =>
      setOpenController(
        isControllerOpen ? openControllerType.CLOSE : openControllerType.OPEN,
      ),
    [isControllerOpen],
  )

  const [
    { currentType, changeColor },
    changeMeshPhysicalMaterial,
  ] = useMeshPhysicalMaterial()

  const handleSwitchButtonOnClick = useCallback(
    () =>
      changeMeshPhysicalMaterial({
        type: actionTypes.SWITCH_MATERIAL,
      }),
    [changeMeshPhysicalMaterial],
  )

  const handleActivateButtonOnClick = useCallback(
    () =>
      changeMeshPhysicalMaterial({
        type: actionTypes.ACTIVATE,
      }),
    [changeMeshPhysicalMaterial],
  )

  const handleOnChange = useCallback(
    type => (event, props) =>
      changeMeshPhysicalMaterial({
        type,
        payload: {
          [type]:
            {
              [actionTypes.change.FLATSHADIN]: props && props.checked,
              [actionTypes.change.WIREFRAME]: props && props.checked,
              [actionTypes.change.REFLECTION]:
                props &&
                { true: currentMeshStore.envMap, false: null }[props.checked],
              [actionTypes.change.COLOR]: event.hex,
            }[type] || event.target.value,
        },
      }),
    [changeMeshPhysicalMaterial],
  )

  const { [currentType]: currentMat } = currentMeshStore

  const controllerMap = useMemo(
    () => ({
      [actionTypes.change.SHININESS]: () => (
        <input
          type='range'
          defaultValue={currentMat[actionTypes.change.SHININESS]}
          min={0}
          max={100}
          disabled={currentType === matTypes.PHYSIC}
          onChange={handleOnChange(actionTypes.change.SHININESS)}
        />
      ),
      [actionTypes.change.ROUGHTNESS]: () => (
        <input
          type='range'
          defaultValue={currentMat[actionTypes.change.ROUGHTNESS]}
          min={0}
          max={100}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(actionTypes.change.ROUGHTNESS)}
        />
      ),
      [actionTypes.change.METALNESS]: () => (
        <input
          type='range'
          defaultValue={currentMat[actionTypes.change.METALNESS]}
          min={0}
          max={100}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(actionTypes.change.METALNESS)}
        />
      ),
      [actionTypes.change.REFLECTIVITY]: () => (
        <input
          type='range'
          defaultValue={currentMat[actionTypes.change.REFLECTIVITY]}
          min={0}
          max={100}
          onChange={handleOnChange(actionTypes.change.REFLECTIVITY)}
        />
      ),
      [actionTypes.change.CLEARCOAT]: () => (
        <input
          type='range'
          defaultValue={currentMat[actionTypes.change.CLEARCOAT]}
          min={0}
          max={100}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(actionTypes.change.CLEARCOAT)}
        />
      ),
      [actionTypes.change.FLATSHADIN]: () => (
        <Radio
          slider
          defaultChecked={currentMat[actionTypes.change.FLATSHADIN]}
          onClick={handleOnChange(actionTypes.change.FLATSHADIN)}
        />
      ),
      [actionTypes.change.WIREFRAME]: () => (
        <Radio
          slider
          defaultChecked={currentMat[actionTypes.change.WIREFRAME]}
          onClick={handleOnChange(actionTypes.change.WIREFRAME)}
        />
      ),
      [actionTypes.change.REFLECTION]: () => (
        <Radio
          slider
          defaultChecked={!!currentMat[actionTypes.change.REFLECTION]}
          onClick={handleOnChange(actionTypes.change.REFLECTION)}
        />
      ),
    }),
    [handleOnChange, currentType, currentMat],
  )

  return (
    <div className={`MeshPhysicalMaterialController ${openController}`}>
      <h1 className='m-title'>{currentType} Controller</h1>
      <span>SWITCHER</span>
      <button className='mesh-switcher' onClick={handleSwitchButtonOnClick}>
        {currentType}
      </button>
      <span>RE-ACTIVE</span>
      <button className='mesh-switcher' onClick={handleActivateButtonOnClick}>
        ACTIVATE
      </button>
      <div className='color-picker-part'>
        <div className={actionTypes.change.COLOR}>
          {actionTypes.change.COLOR}
          <ColorSelector
            color={changeColor}
            onChange={handleOnChange(actionTypes.change.COLOR)}
          />
        </div>
        <div className={actionTypes.change.COLOR}>
          Ambient Light
          <ColorSelector
            targetThreeObject={adjustableAmbientLight}
            onAlphaChange={alpha => (adjustableAmbientLight.intensity = alpha)}
          />
        </div>
      </div>
      <table>
        <tbody>
          {Object.keys(controllerMap).map(key => {
            const TdContent = controllerMap[key]
            return (
              <tr key={key}>
                <th>{key}</th>
                <td>
                  <TdContent />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        className={`controller-switcher${
          isControllerOpen ? ' open' : ' close'
        }`}
        onClick={handleOpenButtonOnClick}
      >
        {isControllerOpen ? 'CLOSE' : 'OPEN Material Controller'}
      </button>
    </div>
  )
}
