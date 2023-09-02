import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log(apiUrl)

interface Credentials {
    identifier: string;
    pass: string;
  }
  interface CredentialsByid {
    id: string;
  }
  
  interface UserResponse {
    id: string;
    nombre: string;
    apellido: string;
    edad: number;
    telefono: number;
    correo: string;
  }
  
  export const loginApi = createApi({
    reducerPath: "loginApi",
    baseQuery: fetchBaseQuery({ baseUrl: apiUrl+"/api/user/" }),
    endpoints: (builder) => ({
      login: builder.mutation<UserResponse, Credentials>({
        query: (credentials) => ({
          url: 'login', // Endpoint de tu API
          method: 'POST',
          body: credentials,
        }),
      }),
      getByid: builder.mutation<UserResponse, CredentialsByid>({
        query: (credentials) => ({
          url: 'byId', // Endpoint de tu API
          method: 'POST',
          body: credentials,
        }),
      }),
    }),
  });
  
  export const { useLoginMutation, useGetByidMutation } = loginApi;