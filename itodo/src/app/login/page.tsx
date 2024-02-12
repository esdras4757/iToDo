'use client'
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { Row } from 'react-bootstrap'
import { useLoginMutation } from '@/redux/services/loginApi'
import openNotification from '../utils/notify'
import { saveUser } from '@/redux/features/userInfoSlice'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useRouter } from 'next/navigation'
import Loader from '../Components/Loader'
import { Spin } from 'antd'
import { version } from '../utils/constants/gobals'
interface User {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: number;
  correo: string;
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [login, { data, isLoading, error }] = useLoginMutation()
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
    sessionStorage.clear()
  }, [])

  const loginFn = (email: string, password: string) => {
    setErrors({})
    login({ identifier: email, pass: password })
      .unwrap()
      .then((data: User) => {
        // console.log(data)
        if (data) {
          sessionStorage.setItem('user', data.id)
          router.replace('/Home')
          dispatch(saveUser(data))
          openNotification('success', 'Bienvenido' + ' ' + data.nombre)
          // console.log(user.userInfo);
        }
      })
      .catch((error) => {
        if (error) {
          if (
            'status' in error &&
            typeof error.data === 'object' &&
            error.data !== null
          ) {
            openNotification('error', (error.data as any).message)
          } else if ('message' in error) {
            openNotification('error', error.message ? error.message : '')
          } else {
            openNotification(
              'error',
              'Ah ocurrido un error. Intentalo mas tarde'
            )
          }
        }
      })
  }

  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.userReducer)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    // Validación de correo electrónico
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor, introduce un correo electrónico válido.'
    }
    // Validación de contraseña
    if (!password || password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    // Si hay errores, los mostramos y salimos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    loginFn(email, password)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'email') setEmail(e.target.value)
    else if (e.target.name === 'password') setPassword(e.target.value)
  }

  return (
    <main
      className="bg-mainContainers"
      style={{
        backgroundSize: 'cover', // Asegúrate de que la imagen cubra todo el contenedor
        backgroundPosition: 'center', // Centra la imagen en el contenedor
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5)), url(\'./images/bg-login.jpg\')'
      }}
    >
      <div className="absolute bottom-4 right-4 text-secondary2 fs-6 p-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px' }}> {version} </div>
      <form className="formLogin" onSubmit={handleSubmit}>
        <Row
          className="justify-content-center align-content-center align-items-center text-white"
          style={{ height: '100vh' }}
        >
          <div className="col-auto mb-5">
            <img src="./images/logoWhite.png" alt="logoItodo" width='200px' />
          </div>
          {/* <h1 className="text-center mt-4 fs-2 mb-4">Inicia sesión</h1> */}
          <label className="row justify-content-center mb-4">
            <p className="text-center mb-3">Correo electrónico: </p>
            <input
              className="col-3"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-center text-danger">{errors.email}</p>
            )}
          </label>

          <label className="row justify-content-center mb-4">
            <p className="text-center mb-3">Contraseña: </p>
            <input
              className="col-3"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-center text-danger">{errors.password}</p>
            )}
          </label>

          <button style={{ height: 40 }} className="btnPrimary col-auto p-1 mb-1"
          disabled={isLoading}
          type="submit">
            {isLoading
              ? (
                <Spin indicator={<i className="fa-solid fa-spinner"/>} />
                )
              : (
                  'Iniciar sesión'
                )}
          </button>
          {/* <p className="text-center">
            o <br />{' '}
            <span className="cursor-pointer text-primary">
              Registrate aqui.
            </span>
          </p>
          <div className="col-12 mt-3" style={{ fontSize: 13 }}>
            <p className="text-center">
              ¿No puedes acceder a tu cuenta? <br />{' '}
              <span className="text-danger cursor-pointer">
                Restablece tu contraseña.
              </span>
            </p>
          </div> */}
        </Row>
      </form>
    </main>
  )
}

export default SignIn
