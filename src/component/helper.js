import React, { useState, useCallback } from 'react'
import * as THREE from 'three'
import * as ReactColor from 'react-color'

const adjustableAmbientLight = new THREE.AmbientLight()
adjustableAmbientLight.intensity = 0.3

const adjustablePointLightA = new THREE.PointLight({ isColor: true })
adjustablePointLightA.position.set([700, 2700, 250].map(v => 1.2 * v))

const adjustablePointLightB = new THREE.PointLight({ isColor: true })
adjustablePointLightB.position.set([700, 2700, 250].map(v => 1.2 * -v))
;[adjustablePointLightA, adjustablePointLightB].map(light => {
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
const ColorSelector = ({ targetThreeObject, onAlphaChange, ...props }) => {
  const [color, setColor] = useState(
    targetThreeObject
      ? `${new THREE.Color(targetThreeObject.color).getHexString()}55`
      : '#ffffff',
  )
  const handleOnColorSelectorChange = useCallback(
    event => {
      const { hex, rgb } = event
      targetThreeObject.color.set(new THREE.Color(hex))
      setColor(rgb)
      onAlphaChange && onAlphaChange(rgb.a)
    },
    [color, setColor],
  )

  return (
    <ColorSelectorType
      color={color}
      onChange={handleOnColorSelectorChange}
      {...props}
    />
  )
}

export {
  ColorSelector,
  adjustableAmbientLight,
  adjustablePointLightA,
  adjustablePointLightB,
}
