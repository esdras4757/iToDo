import React from 'react'
import { Row } from 'react-bootstrap'

const Loader = () => {
  return (
    <Row className='justify-content-center align-content-center h-full'>
    <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </Row>
  )
}

export default Loader