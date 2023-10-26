'use client'
import Image from 'next/image'
import React, { ReactNode, useEffect, useState } from 'react'
import { Avatar, TextField } from '@mui/material'
import FilledInput from '@mui/material/FilledInput'
import { Row, Button } from 'react-bootstrap'
import dynamic from 'next/dynamic'
import Header from '../Components/Header'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { increment, decrement } from '@/redux/features/counterSlice'
import { saveUser } from '@/redux/features/userInfoSlice'
import {
  useGetUsersByIdQuery,
  useGetUsersQuery
} from '@/redux/services/userApi'
import Dashboard from '../Components/Dashboard'
import { useFetchImageQuery } from '@/redux/services/unsplashApi'

import { useRouter } from 'next/navigation'
import Loader from '../Components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useGetByidMutation } from '@/redux/services/loginApi'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Page from '../myDay/page'

const AREmojiHello = '../images/AREmojiHello.png'
interface User {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: number;
  correo: string;
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000 // Milisegundos en un día
const currentTime = Date.now()
console.log(new Date(), 'currentTime')
const defaultImage =
  'https://images.unsplash.com/photo-1528184039930-bd03972bd974?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb'

export default function Home ({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentComponent, setCurrentComponent] = useState<React.ReactElement | null>(<Page/>)
  const [labelCurrentComponent, setLabelCurrentComponent] = useState(`${currentComponent}`)
  const [bgimg, setBgimg] = useState('')
  const [anchorEl, setAnchorEl] = useState<boolean>(false)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const user = useSelector((state: RootState) => state.userReducer)
  const [getByid] = useGetByidMutation()

  const getBg = () => {
    return fetch(
      'https://api.unsplash.com/photos/random?query=landscape&w=1920&h=1080&fit=crop&q=60',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Client-ID zrXUnIM1o5p0qUTf7XmkuUtDoLUo2b2Piz271WKQlKE'
        }
      }
    )
      .then((response) => {
        return response.json()
      })
      .catch((error) => console.error('Hubo un error:', error))
  }

  useEffect(() => {
    const LAST_QUERY_TIMESTAMP = 'lastQueryTimestamp'
    const lastQueryTimestamp = localStorage.getItem(LAST_QUERY_TIMESTAMP)
      ? localStorage.getItem(LAST_QUERY_TIMESTAMP)
      : null
    let shouldQuery = true

    if (lastQueryTimestamp) {
      if (currentTime - Number.parseFloat(lastQueryTimestamp) < ONE_DAY_IN_MS) {
        shouldQuery = false
      }
    }

    if (shouldQuery) {
      getBg().then((imageData) => {
        console.log(imageData)
        if (imageData?.links?.download) {
          localStorage.setItem('BgImg', imageData.links.download)
          setBgimg(imageData.links.download)
        }
        localStorage.setItem(LAST_QUERY_TIMESTAMP, String(currentTime))
      })
    }
  }, [])

  useEffect(() => {
    const isAuthenticated = !!sessionStorage.getItem('user')
    if (!isAuthenticated) {
      router.replace('/login')
    } else {
      if (user.userInfo.id == null) {
        const id = sessionStorage.getItem('user')
        if (id) {
          getByid({ id })
            .unwrap()
            .then((data: User) => {
              setUserInfo(data)
              setLoading(false)
            })
            .catch((error: { data: { message: string } }) => {
              setLoading(false)
              if (error.data) {
                openNotification('error', error.data.message)
              }
              router.replace('/login')
            })
        }
      }

      setUserInfo(user.userInfo as User)
      const bgImage: string = localStorage.getItem('BgImg') || defaultImage
      setBgimg(bgImage)
      setLoading(false)
    }
  }, [])

  const handleClick = () => {
    setAnchorEl(!anchorEl)
  }

  const handleClose = () => {
    setAnchorEl(false)
  }

  const {
    data: userData,
    error: userError,
    isLoading: userIsLoading,
    isFetching: userIsFetching
  } = useGetUsersQuery(null)

  if (loading) {
    return <Loader />
  }

  return (

    <main className="h-screen w-screen overflow-hidden flex">
      <Dashboard 
      isOpen={isOpen} 
      setIsOpen={setIsOpen} 
      userInfo={userInfo} 
      setCurrentComponent={setCurrentComponent}
      currentComponent={currentComponent}
      setLabelCurrentComponent={setLabelCurrentComponent}
      labelCurrentComponent={labelCurrentComponent}
      />
      <section className="w-full overflow-hidden">
        <Header
          userName={'Esdras Lara'}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          userInfo={userInfo}
        />
        <main
          className="w-100 h-full relative overflow-hidden"
          style={{
            backgroundSize: 'cover', // Asegúrate de que la imagen cubra todo el contenedor
            backgroundPosition: 'center', // Centra la imagen en el contenedor
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${bgimg})`
          }}
        >
          <Row className="w-100 justify-center m-auto align-items-center">
            <div className="p-3 row justify-content-center align-content-center align-items-center">
              {currentComponent}
            </div>
          </Row>

          <Row
            className="w-100 footer justify-center absolute align-items-center"
            style={{ bottom: 100 }}
          >
            <Avatar
              className="bg-main p-0"
              alt="Remy Sharp"
              src={AREmojiHello}
              sx={{ width: 75, height: 75 }}
              onClick={(e) => handleClick()}
            />
            <div className="col-7">
              {/* <InputLabel className="text-white" htmlFor="component-filled">Name</InputLabel> */}
              <TextField
                style={{ width: '100%' }}
                fullWidth
                label="Hola.! Soy tu asistente virtual, en que puedo ayudarte?"
                id="fullWidth"
              />
            </div>
          </Row>
        </main>
      </section>
    </main>
  )
}
