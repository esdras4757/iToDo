import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface dataQuery {
  title: string;
  idStatus: string | Number;
  description?: string;
  reminder?: string;
  initAt?: string;
  finishAt?: string;
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
  finishAt?: string;
  fileId?: string;
  noteId?: string;
  userId: string;
}

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/task/",
  }),
  endpoints: (builder) => ({
    addTask: builder.mutation<dataResponseadd, dataQuery>({
      query: (dataQuery) => ({
        url: "add",
        method: "POST",
        body: dataQuery,
      }),
    }),
  }),
});

export const { useAddTaskMutation } = taskApi;
