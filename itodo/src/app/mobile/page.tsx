'use client'
import React, { useEffect } from 'react'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import { useRouter, useSearchParams } from 'next/navigation';
const Page = () => {
  const router = useRouter();
  useEffect(() => {
    const handleResize = (e: any) => {
      if (window.innerWidth > 425) {
        router.replace('/Home')
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (window.innerWidth >  765) {
      router.replace('/Home')
    }
  }, [])

  return (
    <div className="w-100 h-100 p-5 row m-auto justify-content-center align-content-center align-items-center">
           <div className='mb-4'>
             <NoDataPlaceholder
               title="Ups"
               text="Para una experiencia óptima en dispositivos móviles, te invitamos a descargar nuestra app especializada. La versión web no está adaptada para estos dispositivos."
             />
           </div>
           <img className='mb-2' src="../images/playStore.png" alt="Playstore" />
           <img src="../images/appStore.png" alt="Playstore" />

    </div>
  )
}

export default Page
