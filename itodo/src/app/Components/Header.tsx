import React, { useEffect, useState } from 'react'
import Image from 'next/image'

import { Avatar } from '@mui/material'
import { Row, Col } from 'react-bootstrap'
import type { MenuProps } from 'antd'
import { Dropdown, Space } from 'antd'
import { useRouter } from 'next/navigation'
import openNotification from '../utils/notify'
interface User {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: number;
  correo: string;
}

interface HomeProps {
  userName: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  userInfo: User | null;
}

const Header = (props: Required<HomeProps>) => {
  const router = useRouter()
  const { userName, isOpen, setIsOpen, userInfo } = props
  const [message, setMessage] = useState('')

  useEffect(() => {
    //   if(userName && userName!= ''){
    if (userInfo?.nombre && userInfo?.apellido) {
      const user = userInfo.nombre + ' ' + userInfo.apellido

      const messages = [
        `¡Hola, ${user}!`,
        `¡Bienvenido, ${user}!`,
        `¡Saludos, ${user}!`,
        `¡Qué tal, ${user}!`
      ]
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)]
      setMessage(randomMessage)
    }
  }, [userInfo])

  const items: MenuProps['items'] = [
    // {
    //   key: '1',
    //   label: (
    //     <a
    //       target="_blank"
    //       rel="noopener noreferrer"
    //       href="/myAccount"
    //     >
    //       Cuenta
    //     </a>
    //   ),
    //   icon: <i className="fas fa-user text-dark" />
    // },
    {
      key: '2',
      label: (
        <a
          onClick={() => {
            router.replace('/login')
            sessionStorage.clear()
          }}
        >
          Cerrar sesión
        </a>
      ),
      icon: (
        <i className="fa-solid fa-person-walking-dashed-line-arrow-right fa-flip-horizontal"></i>
      )
    }
  ]

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-mainContainers h-16 flex items-center justify-between p-3">
        <Row className="col-auto justify-content-start align-content-center align-items-center justify-items-start">
          <h2 className="col-12 font-semibold">
            <p className="m-0 p-0">{message}</p>
          </h2>
        </Row>
        <div className="flex col-4 justify-content-end align-items-center">
          {userInfo && (
            <>
              <Dropdown menu={{ items }}>
                <Avatar style={{ width: '40px', height: '40px' }}>
                {userInfo && userInfo.nombre ? userInfo.nombre.charAt(0).toUpperCase() : ''}{userInfo && userInfo.apellido ? userInfo.apellido.charAt(0).toUpperCase() : ''}
                  </Avatar>
              </Dropdown>

              <div className="text-start ml-2">
                <h2 className="font-extrabold fs-6 mb-1">
                  {userInfo.nombre} {userInfo.apellido}
                </h2>
                <h3 className="" style={{ fontSize: 12 }}>
                  {userInfo.correo}
                </h3>
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  )
}

export default Header
