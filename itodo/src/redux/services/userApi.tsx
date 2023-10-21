import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface user {
    id: number
}

export const userApi = createApi({
  reducerPath: 'userAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://jsonplaceholder.typicode.com/'
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<user, null>({
      query: () => 'users'
    }),
    getUsersById: builder.query<user, {id:string}>({
      query: ({ id }) => 'users'
    })
  })
})

export const { useGetUsersByIdQuery, useGetUsersQuery } = userApi
