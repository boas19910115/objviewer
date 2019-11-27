import * as THREE from 'three'
import React, { useReducer, useCallback, useMemo, useState } from 'react'
import { Radio } from 'semantic-ui-react'
import { SketchPicker } from 'react-color'
import './useMeshPhysicalMaterial.scss'

const meshPhysicalMaterial = new THREE.MeshPhysicalMaterial()

export const currentMeshStore = {
  material: null,
  childAddress: null,
  /**
   * @param {object} child
   * @param {THREE.Mesh} child.material
   */
  storeCurrentMesh: child => {
    currentMeshStore.material = child.material.clone(true)
    meshPhysicalMaterial.envMap = currentMeshStore.material.envMap
    currentMeshStore.childAddress = child
  },
}

function meshSwitcher(isMeshPhysicalMaterial) {
  currentMeshStore.childAddress.material = isMeshPhysicalMaterial
    ? meshPhysicalMaterial
    : currentMeshStore.material
}

const actionTypes = {
  TURN_ON_PHYSICALMESH: 'ON',
  TURN_OFF_USE_PHYSICALMESH: 'OFF',
  change: {
    COLOR: 'color',
    ROUGHTNESS: 'roughness',
    METALNESS: 'metalness',
    REFLECTIVITY: 'reflectivity',
    CLEARCOAT: 'clearcoat',
    FLATSHADIN: 'flatShading',
    WIREFRAME: 'wireframe',
  },
}

const useMeshPhysicalMaterial = () => {
  const [isMeshPhysicalMaterial, changeMeshPhysicalMaterial] = useReducer(
    /**
     * @param {THREE.MeshPhysicalMaterial} meshPhysicalMaterial
     */
    (isMeshPhysicalMaterial, action) => {
      const { payload } = action
      const chageValue = payload ? payload[action.type] : null
      switch (action.type) {
        case actionTypes.change.COLOR: {
          meshPhysicalMaterial.color = new THREE.Color(chageValue)
          break
        }
        case actionTypes.change.ROUGHTNESS: {
          meshPhysicalMaterial.roughness = chageValue * 0.01
          break
        }
        case actionTypes.change.METALNESS: {
          meshPhysicalMaterial.metalness = chageValue * 0.01
          break
        }
        case actionTypes.change.REFLECTIVITY: {
          meshPhysicalMaterial.reflectivity = chageValue * 0.01
          break
        }
        case actionTypes.change.CLEARCOAT: {
          meshPhysicalMaterial.clearcoat = chageValue * 0.01
          break
        }
        case actionTypes.change.FLATSHADIN: {
          meshPhysicalMaterial.flatShading = !!chageValue
          break
        }
        case actionTypes.change.WIREFRAME: {
          meshPhysicalMaterial.wireframe = !!chageValue
          break
        }
        case actionTypes.TURN_ON_PHYSICALMESH: {
          meshSwitcher(true)
          return true
        }
        case actionTypes.TURN_OFF_USE_PHYSICALMESH: {
          meshSwitcher(false)
          return false
        }
        default: {
          break
        }
      }
      return isMeshPhysicalMaterial
    },
    false,
  )
  return { isMeshPhysicalMaterial, changeMeshPhysicalMaterial }
}

const openControllerType = {
  OPEN: 'c-open',
  CLOSE: 'c-close',
}

export const MeshPhysicalMaterialController = () => {
  const [openController, setOpenController] = useState(openControllerType.CLOSE)
  const isControllerOpen = openController === openControllerType.OPEN
  const handleOpenButtonOnClick = useCallback(() =>
    setOpenController(
      isControllerOpen ? openControllerType.CLOSE : openControllerType.OPEN,
    ),
  )

  const {
    isMeshPhysicalMaterial,
    changeMeshPhysicalMaterial,
  } = useMeshPhysicalMaterial()

  const handleSwitchButtonOnClick = useCallback(
    () =>
      changeMeshPhysicalMaterial({
        type: isMeshPhysicalMaterial
          ? actionTypes.TURN_OFF_USE_PHYSICALMESH
          : actionTypes.TURN_ON_PHYSICALMESH,
      }),
    [isMeshPhysicalMaterial, changeMeshPhysicalMaterial],
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
              [actionTypes.change.COLOR]: event.hex,
            }[type] || event.target.value,
        },
      }),
    [],
  )

  const controllerMap = useMemo(() => ({
    [actionTypes.change.ROUGHTNESS]: () => (
      <input
        type='range'
        defaultValue={meshPhysicalMaterial[actionTypes.change.ROUGHTNESS]}
        min={0}
        max={100}
        onChange={handleOnChange(actionTypes.change.ROUGHTNESS)}
      />
    ),
    [actionTypes.change.METALNESS]: () => (
      <input
        type='range'
        defaultValue={meshPhysicalMaterial[actionTypes.change.METALNESS]}
        min={0}
        max={100}
        onChange={handleOnChange(actionTypes.change.METALNESS)}
      />
    ),
    [actionTypes.change.REFLECTIVITY]: () => (
      <input
        type='range'
        defaultValue={meshPhysicalMaterial[actionTypes.change.REFLECTIVITY]}
        min={0}
        max={100}
        onChange={handleOnChange(actionTypes.change.REFLECTIVITY)}
      />
    ),
    [actionTypes.change.CLEARCOAT]: () => (
      <input
        type='range'
        defaultValue={meshPhysicalMaterial[actionTypes.change.CLEARCOAT]}
        min={0}
        max={100}
        onChange={handleOnChange(actionTypes.change.CLEARCOAT)}
      />
    ),
    [actionTypes.change.FLATSHADIN]: () => (
      <Radio
        slider
        defaultChecked={meshPhysicalMaterial[actionTypes.change.FLATSHADIN]}
        onClick={handleOnChange(actionTypes.change.FLATSHADIN)}
      />
    ),
    [actionTypes.change.WIREFRAME]: () => (
      <Radio
        slider
        defaultChecked={meshPhysicalMaterial[actionTypes.change.WIREFRAME]}
        onClick={handleOnChange(actionTypes.change.WIREFRAME)}
      />
    ),
  }))

  return (
    <div className={`MeshPhysicalMaterialController ${openController}`}>
      <h1 className='m-title'>MeshPhysicalMaterial Controller</h1>
      <span>Switcher</span>
      <button
        className={`mesh-switcher switch-${isMeshPhysicalMaterial}`}
        onClick={handleSwitchButtonOnClick}
      >
        {isMeshPhysicalMaterial
          ? actionTypes.TURN_ON_PHYSICALMESH
          : actionTypes.TURN_OFF_USE_PHYSICALMESH}
      </button>
      <div className={actionTypes.change.COLOR}>
        {actionTypes.change.COLOR}
        <SketchPicker
          color={
            new THREE.Color(meshPhysicalMaterial[actionTypes.change.COLOR])
          }
          onChangeComplete={handleOnChange(actionTypes.change.COLOR)}
        />
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
      <button className='controller-switcher' onClick={handleOpenButtonOnClick}>
        {isControllerOpen ? 'CLOSE' : 'OPEN PhysicalMatertial Controller'}
      </button>
    </div>
  )
}
