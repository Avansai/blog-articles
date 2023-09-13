'use client'

import { useEffect, useState } from 'react'
import CirclesHelperFunction from './CirclesHelperFunction.svg'
import { SvgController } from '@/src/SvgController'

const getRandomColor = () =>
  '#' + Math.floor(Math.random() * 16777215).toString(16)

export default function CirclesHelperFunctionPage() {
  const [topLeftCircleColor, setTopLeftCircleColor] = useState('none')
  const [topRightCircleColor, setTopRightCircleColor] = useState('none')
  const [bottomLeftCircleColor, setBottomLeftCircleColor] = useState('none')

  useEffect(() => {
    const interval = setInterval(() => {
      setTopLeftCircleColor(getRandomColor())
      setTopRightCircleColor(getRandomColor())
      setBottomLeftCircleColor(getRandomColor())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <SvgController
        rules={[
          {
            selector: {
              attributeName: 'data-node-id',
              attributeValue: 'top-left-circle',
            },
            props: { fill: topLeftCircleColor },
          },
          {
            selector: {
              attributeName: 'data-node-id',
              attributeValue: 'top-right-circle',
            },
            props: { fill: topRightCircleColor },
          },
          {
            selector: {
              attributeName: 'data-node-id',
              attributeValue: 'bottom-left-circle',
            },
            props: { fill: bottomLeftCircleColor },
          },
        ]}
      >
        <CirclesHelperFunction />
      </SvgController>
    </>
  )
}
