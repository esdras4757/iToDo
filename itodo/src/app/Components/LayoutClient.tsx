'use client'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { ConfigProvider, notification } from 'antd'
import es from 'antd/locale/es_ES'
import io from 'socket.io-client'

import openNotification from '../utils/notify'
import { useEffect } from 'react'
const socket = io('https://todoserver-8410.onrender.com')
const inter = Inter({ subsets: ['latin'] })

export default function LayoutClient () {
  const playNotifications = (data:{
    title:string

  }) => {
    const audio = new Audio('/audio/consequence-544.mp3')
    audio.loop = true
    audio.play()
    openNotification('info', data.title, 0,
    <div className='row justify-between col-12 mt-3'>
      <div
      onClick={e => {
        socket.emit('responseEvent', 'holaa')
      }}
      style={{ color: 'red', borderRight: '1px solid Black' }}
      className='col-6 cursor-pointer text-center p-0'>
        Posponer (5min)
      </div>
      <div
      onClick={e => {
        notification.destroy()
        audio.pause()
        audio.currentTime = 0
      }}
       style={{ color: 'blue' }}
      className='col-6 text-center cursor-pointer p-0'>
        Aceptar
      </div>
    </div>
    )
  }

  useEffect(() => {
    const alertHandler = (data:any) => {
      playNotifications(data)
    }

    socket.on('alert', alertHandler)

    return () => {
      socket.off('alert', alertHandler) // Aquí se elimina el oyente
      socket.disconnect()
    }
  }, [])

  return (
    <></>
  )
}
