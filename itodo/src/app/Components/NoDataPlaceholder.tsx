import React from 'react'
import { Row } from 'react-bootstrap'

interface noDataPlaceholderProps {
  width ?: number;
  height ?: number;
  text ?: string;
  title ?: string;
  img ?: string;
  fs ?: number
}

const NoDataPlaceholder = (props: noDataPlaceholderProps) => {
  const { width, height, text, title, img, fs } = props

  return (
    <Row className="justify-center align-content-center">
      <div className="col-12 row justify-content-center text-center">
        {' '}
        <img src={img ?? '/images/folderEmpty.png'} style={{ width: width ?? '180px', height: height ?? 'auto' }} alt="" />
      </div>
      <div
        className="text-center w-auto"
        style={{
          padding: 8,
          borderRadius: 7,
          backgroundColor: 'rgb(16 72 121 / 60%)',
          fontSize: fs ?? 15
        }}
      >

       <div style={{ fontWeight: 'bold', fontSize: fs ? fs + 2 : 17 }}>¡{title ?? 'Vaya'}! </div>
        {text ?? 'No se han encontrado datos para mostrar aquí.'}
      </div>
    </Row>
  )
}

export default NoDataPlaceholder
