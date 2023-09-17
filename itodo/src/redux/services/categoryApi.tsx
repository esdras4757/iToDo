import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface dataQuery {
  name: string;
  idUser: string;
  styles:string
}

interface dataQueryUpdate {
  id: string;
  name: string;
  styles:string
}

interface dataResponseAdd {
    id: string;
    idUser: string;
    name: string;
    styles: string;
    idList:string;
}

// interface dataQueryByIdUser {
//   idUser: string;
// }
interface dataResponseByIdUser {
    id: string;
    idUser: string;
    name: string;
    styles:string;
    idList:string;
  }

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://cuddly-garbanzo-r6g6pq5x4j42x4j5-5000.app.github.dev/api/category/" }),
  endpoints: (builder) => ({
    addCategoryByIdUser: builder.mutation<dataResponseAdd, dataQuery>({
      query: (dataQuery) => ({
        url: "add",
        method: "POST",
        body: dataQuery,
      }),
    }),
    getCategoryByIdUser: builder.query<dataResponseByIdUser[], string>(
      {
        query: ( idUser ) => `byIdUser/${idUser}`
      }
    ),
    updateCategory: builder.mutation<dataResponseAdd, dataQueryUpdate>({
      query: ({id,... dataQuery}) => ({
        url: `update/${id}`,
        method: "PUT",
        body: dataQuery,
      }),
    }),
  }),
});

export const { useAddCategoryByIdUserMutation, useGetCategoryByIdUserQuery, useUpdateCategoryMutation } = categoryApi;
