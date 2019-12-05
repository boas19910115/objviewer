import * as THREE from 'three'
import React, { useReducer, useCallback, useMemo, useState } from 'react'
import { Radio } from 'semantic-ui-react'
import { ParametricGeometries } from 'three/examples//jsm/geometries/ParametricGeometries'
import { Curves } from 'three/examples//jsm/curves/CurveExtras'
import './useMeshPhysicalMaterial.scss'
import { ColorSelector, adjustableAmbientLight, senceStore } from './helper'

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
  active: false,
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
  storeCurrentMesh(child) {
    this.childAddress = child
    this.originalMaterial = child.material.clone(true)
    this.envMap = child.material.envMap
    this.active = false
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

function switchMaterial(currentType) {
  sync(currentType)
}

function activate(currentType) {
  if (!currentMeshStore.active) {
    sync(currentType)
    currentMeshStore.active = true
  }
}

function sync(currentType) {
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

const propertyTypeLabelMap = {
  [actionTypes.change.REFLECTION]: 'Refection',
}

const propertyTypeMultiplyBase = {
  [actionTypes.change.COLOR]: null,
  [actionTypes.change.ROUGHTNESS]: v => v * 0.01,
  [actionTypes.change.METALNESS]: v => v * 0.01,
  [actionTypes.change.REFLECTIVITY]: v => v * 0.01,
  [actionTypes.change.FLATSHADIN]: v => Boolean(v),
  [actionTypes.change.CLEARCOAT]: v => v * 0.01,
  [actionTypes.change.WIREFRAME]: v => Boolean(v),
  [actionTypes.change.SHININESS]: v => v,
  [actionTypes.change.REFLECTION]: v => Boolean(v),
}

const syncChange = (callback, ...targets) => targets.forEach(callback)

const useMeshPhysicalMaterial = () => {
  const initValue = useMemo(() => {
    return Object.keys(propertyTypeMultiplyBase).reduce(
      (preObj, cur) => {
        return {
          ...preObj,
          properties: {
            ...preObj.properties,
            [cur]: currentMeshStore[matTypes.PHYSIC][cur],
          },
        }
      },
      {
        currentType: matTypes.PHYSIC,
        properties: {},
      },
    )
  }, [])
  return useReducer(
    /**
     * @param {THREE.MeshPhysicalMaterial} meshPhysicalMaterial
     */
    (state, action) => {
      const { properties } = state
      const { payload } = action
      const chageValue = payload ? payload[action.type] : null
      const {
        childAddress: { material },
      } = currentMeshStore
      switch (action.type) {
        case actionTypes.change.COLOR: {
          material.color = new THREE.Color(chageValue)
          return {
            ...state,
            changeColor: chageValue,
            properties: { [action.type]: { chageValue } },
          }
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
          return {
            ...state,
            properties: { ...properties, [action.type]: !!chageValue },
          }
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
          return {
            ...state,
            properties: { ...properties, [action.type]: !!chageValue },
          }
        }
        case actionTypes.change.WIREFRAME: {
          material.wireframe = !!chageValue
          return {
            ...state,
            properties: { ...properties, [action.type]: !!chageValue },
          }
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
          material[action.type] = chageValue
          break
        }
      }
      return {
        ...state,
        properties: { ...properties, [action.type]: chageValue },
      }
    },
    {
      ...initValue,
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
    { currentType, changeColor, properties },
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
      [actionTypes.change.SHININESS]: ({ handleBase, type, currentValue }) => (
        <input
          type='range'
          value={currentValue}
          step={handleBase(1)}
          min={0}
          max={handleBase(100)}
          disabled={currentType === matTypes.PHYSIC}
          onChange={handleOnChange(type)}
        />
      ),
      [actionTypes.change.ROUGHTNESS]: ({ handleBase, type, currentValue }) => (
        <input
          type='range'
          value={currentValue}
          step={handleBase(1)}
          min={0}
          max={handleBase(100)}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(type)}
        />
      ),
      [actionTypes.change.METALNESS]: ({ handleBase, type, currentValue }) => (
        <input
          type='range'
          value={currentValue}
          step={handleBase(1)}
          min={0}
          max={handleBase(100)}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(type)}
        />
      ),
      [actionTypes.change.REFLECTIVITY]: ({
        handleBase,
        type,
        currentValue,
      }) => (
        <input
          type='range'
          value={currentValue}
          step={handleBase(1)}
          min={0}
          max={handleBase(100)}
          onChange={handleOnChange(type)}
        />
      ),
      [actionTypes.change.CLEARCOAT]: ({ handleBase, type, currentValue }) => (
        <input
          type='range'
          value={currentValue}
          step={handleBase(1)}
          min={0}
          max={handleBase(100)}
          disabled={currentType === matTypes.PHONG}
          onChange={handleOnChange(type)}
        />
      ),
      [actionTypes.change.FLATSHADIN]: ({ handleBase, type, currentValue }) => (
        <Radio
          slider
          defaultChecked={currentMat[actionTypes.change.FLATSHADIN]}
          onClick={handleOnChange(type)}
        />
      ),
      [actionTypes.change.WIREFRAME]: ({ handleBase, type, currentValue }) => (
        <Radio
          slider
          defaultChecked={currentMat[actionTypes.change.WIREFRAME]}
          onClick={handleOnChange(type)}
        />
      ),
      [actionTypes.change.REFLECTION]: ({ handleBase, type, currentValue }) => (
        <Radio
          slider
          defaultChecked={!!currentMat[actionTypes.change.REFLECTION]}
          onClick={handleOnChange(type)}
        />
      ),
    }),
    [handleOnChange, currentType, currentMat],
  )

  return (
    <div className={`MeshPhysicalMaterialController ${openController}`}>
      <h1 className='m-title'>
        {`${
          {
            [matTypes.PHYSIC]: 'MeshPhysicalMaterial',
            [matTypes.PHONG]: 'MeshPhongMaterial',
          }[currentType]
        } Customizer`}
      </h1>
      <span>MAT-SWITCH</span>
      <button className='mesh-switcher' onClick={handleSwitchButtonOnClick}>
        {currentType}
      </button>
      <button
        className={`mesh-switcher${currentMeshStore.active ? ' active' : ''}`}
        onClick={handleActivateButtonOnClick}
      >
        SYNC
      </button>
      <div className='color-picker-part'>
        <div className={actionTypes.change.COLOR}>
          Objects Color
          <ColorSelector
            color={changeColor}
            onChangeCallback={handleOnChange(actionTypes.change.COLOR)}
          />
        </div>
        <div className={actionTypes.change.COLOR}>
          Ambient Light
          <ColorSelector
            targetThreeObject={adjustableAmbientLight}
            onAlphaChange={alpha => (adjustableAmbientLight.intensity = alpha)}
          />
        </div>
        <div className={actionTypes.change.COLOR}>
          Background Color
          <ColorSelector
            onChangeCallback={({ hex }) => senceStore.changeColor(hex)}
          />
        </div>
      </div>
      <table>
        <tbody>
          {Object.keys(controllerMap).map(key => {
            return (
              <PropsRow
                key={key}
                propType={key}
                {...{
                  controllerMap,
                  properties,
                  currentMat,
                  handleOnChange,
                  currentType,
                }}
              />
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

const PropsRow = ({
  propType,
  controllerMap,
  properties,
  currentMat,
  handleOnChange,
  currentType,
}) => {
  const TdContent = controllerMap[propType]
  const handleBase = propertyTypeMultiplyBase[propType]
  const currentValue = useMemo(() => {
    if (typeof properties[propType] === 'boolean') {
      return properties[propType]
    } else if (typeof currentMat[propType] === 'boolean') {
      return currentMat[propType]
    } else {
      return properties[propType] || currentMat[propType] || 0
    }
  }, [properties, propType, currentMat])

  const currentProps = useMemo(() => {
    switch (propType) {
      case actionTypes.change.WIREFRAME:
      case actionTypes.change.FLATSHADIN:
      case actionTypes.change.REFLECTION: {
        return {
          type: 'text',
          disabled: true,
          value: { true: 'ON', false: 'OFF' }[!!currentValue],
          onChange: handleOnChange(propType),
        }
      }

      default: {
        return {
          type: 'number',
          min: 0,
          disabled: !matProps[currentType].includes(propType),
          value: currentValue,
          step: handleBase(1),
          max: handleBase(100),
          onChange: handleOnChange(propType),
        }
      }
    }
  }, [propType, handleBase, currentValue, handleOnChange, currentType])
  const Element = useCallback(
    props => {
      switch (propType) {
        case actionTypes.change.WIREFRAME:
        case actionTypes.change.FLATSHADIN:
        case actionTypes.change.REFLECTION: {
          const { value, className } = props
          return <div className={className}>{value}</div>
        }

        default: {
          return <input {...props} />
        }
      }
    },
    [propType],
  )
  return (
    <tr>
      <th>{propertyTypeLabelMap[propType] || propType}</th>
      <td>
        <TdContent
          handleBase={handleBase}
          type={propType}
          currentValue={currentValue}
        />
      </td>
      <td>
        <Element className='input-values' {...currentProps} />
      </td>
    </tr>
  )
}
