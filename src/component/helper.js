import React, { useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import * as ReactColor from 'react-color'
import CopyButton from './copyButton'

const adjustableAmbientLight = new THREE.AmbientLight()
adjustableAmbientLight.intensity = 0.3

const adjustablePointLightA = new THREE.PointLight({ isColor: true })
adjustablePointLightA.position.set([700, 2700, 250].map(v => 1.2 * v))

const adjustablePointLightB = new THREE.PointLight({ isColor: true })
adjustablePointLightB.position.set([700, 2700, 250].map(v => 1.2 * -v))

const adjustLightList = [adjustablePointLightA, adjustablePointLightB]

adjustLightList.forEach(light => {
  light.distance = 1000
  light.intensity = 0.3
  light.castShadow = true
  light.color = new THREE.Color(0xffffff)
})

const ColorSelectorType = ReactColor.ChromePicker

/**
 * @param {object} param0
 * @param {THREE.Mesh|THREE.Light} param0.targetThreeObject
 */
const ColorSelector = ({
  targetThreeObject,
  onAlphaChange,
  onChangeCallback,
  ...props
}) => {
  /**
   * @type {[THREE.Color]}
   */
  const [color, setColor] = useState(null)
  const handleOnColorSelectorChange = useCallback(
    event => {
      const { hex, rgb } = event
      setColor(hex)
      if (targetThreeObject) {
        targetThreeObject.color.set(new THREE.Color(hex))
      }
      if (onAlphaChange) {
        onAlphaChange(rgb.a)
      }
      if (onChangeCallback) {
        onChangeCallback(event)
      }
    },
    [setColor, onAlphaChange, targetThreeObject, onChangeCallback],
  )

  useEffect(() => {
    if (targetThreeObject) {
      setColor(`#${new THREE.Color(targetThreeObject.color).getHexString()}`)
    }
  }, [targetThreeObject])

  return (
    <div>
      <CopyButton
        disabled={!color}
        text={color ? color.toUpperCase() : 'unset'}
      />
      <ColorSelectorType
        color={color || '#000000'}
        onChange={handleOnColorSelectorChange}
        {...props}
      />
    </div>
  )
}

const senceStore = {
  /**
   * @type {THREE.Scene}
   */
  inst: null,
  /**
   * @type {THREE.Color}
   */
  lastTimeColor: null,
  /**
   * @param {THREE.Scene} senceInst
   */
  store(senceInst) {
    this.inst = senceInst
  },
  /**
   * @returns {THREE.Scene}
   */
  getSenceInst() {
    return this.inst
  },
  changeColor(color) {
    this.lastTimeColor = new THREE.Color(color)

    this.inst.background = this.lastTimeColor
  },
  activateBackground() {
    this.inst.background = this.lastTimeColor
  },
  disableBackground() {
    this.inst.background = null
  },
}

export {
  ColorSelector,
  adjustableAmbientLight,
  adjustablePointLightA,
  adjustablePointLightB,
  senceStore,
}
