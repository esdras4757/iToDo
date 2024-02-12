import './globals.css'
import { Inter } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Providers } from '@/redux/providers'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '@fortawesome/fontawesome-free/css/all.css'
import { ConfigProvider, notification } from 'antd'
import es from 'antd/locale/es_ES'
import io from 'socket.io-client'
import openNotification from './utils/notify'
import React, { useEffect } from 'react'
import LayoutClient from './Components/LayoutClient'
const inter = Inter({ subsets: ['latin'] })
const baseUrl = process.env.NEXT_PUBLIC_API_URL
const socket = io('http://localhost:500')

export const metadata = {
  title: 'INotes',
  description: 'Generated by NeuraTech'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ConfigProvider locale={es}>
        <Providers>
        <LayoutClient/>
        {children}
        </Providers>
        </ConfigProvider>
       </body>
    </html>
  )
}
