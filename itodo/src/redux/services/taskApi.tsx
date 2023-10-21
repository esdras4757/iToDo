import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

interface dataQuery {
  title: string;
  idStatus: string | Number;
  description?: string;
  reminder?: string;
  initAt?: string;
  endAt?: string;
  file?: any;
  note?: string;
  userId: string;
}

interface dataResponseadd {
  name: string;
  idStatus: string;
  description?: string;
  reminder?: string;
  initAt?: string;
  endAt?: string;
  fileId?: string;
  noteId?: string;
  userId: string;
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/api/task/`
  }),
  endpoints: (builder) => ({
    addTask: builder.mutation<dataResponseadd, dataQuery>({
      query: (dataQuery) => ({
        url: 'add',
        method: 'POST',
        body: dataQuery
      })
    })
  })
})

export const { useAddTaskMutation } = taskApi
