import React, { useCallback, useRef, useState } from 'react'
import { Input, Label } from 'semantic-ui-react'

import './copyButton.scss'

/**
 * @param {HTMLInputElement} inputElement
 */
function copyInputElementValue(inputElement) {
  inputElement.focus()
  inputElement.select()
  inputElement.setSelectionRange(0, 99999) /* For mobile devices */
  document.execCommand('copy')
  inputElement.blur()
}

const CopiedNotify = ({ notify }) => {
  return (
    <Label
      className={`CopiedNotify${notify ? ' show-notify' : ' hide-notify'}`}
      color='teal'
      tag
    >
      Copied
    </Label>
  )
}

const CopyButton = ({ text, loading, ...otherProps }) => {
  const [notify, setNotify] = useState(false)

  const ref = useRef()

  const handleButtonOnClick = useCallback(() => {
    const {
      current: {
        inputRef: { current: inputDom },
      },
    } = ref
    copyInputElementValue(inputDom)
    setNotify(true)
    setTimeout(() => {
      setNotify(false)
    }, 1000)
  }, [ref])

  return (
    <div className='copy-button-wrap'>
      <Input
        className='copy-button'
        ref={ref}
        onClick={handleButtonOnClick}
        value={text || ''}
        loading={loading}
        type='text'
        readOnly
        {...otherProps}
      />
      <CopiedNotify notify={notify} />
    </div>
  )
}

export default CopyButton
