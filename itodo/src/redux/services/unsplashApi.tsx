import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface image {
    id: number,
    name: string,
    username: string,
}

export const unsplashApi = createApi({
  reducerPath: 'unsplashApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.unsplash.com/',
    prepareHeaders: (headers) => {
      headers.set('Authorization', 'Client-ID zrXUnIM1o5p0qUTf7XmkuUtDoLUo2b2Piz271WKQlKE')
      return headers
    }
  }),
  endpoints: (builder) => ({
    fetchImage: builder.query({
      query: () => 'photos/random?query=landscape&w=1920&h=1080&fit=crop&q=60'
    })
  })
})

export const { useFetchImageQuery } = unsplashApi
