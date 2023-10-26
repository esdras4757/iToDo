'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Row } from 'react-bootstrap'
import Loader from './Components/Loader'
import { Metadata } from 'next'

// either Static metadata

const Page = () => {
  const router = useRouter()
  // localStorage.setItem("user", "true");

  useEffect(() => {
    if (!sessionStorage.getItem('user')) {
      router.push('/login')
    } else {
      router.push('/Home')
    }
  }, [router]) // añadir isMounted a la lista de dependencias

  return (
   <Loader/>
  )
}

export default Page
