import { createSlice } from "@reduxjs/toolkit";

interface User {
    userInfo:{
    id: string |null;
    nombre: string |null;
    apellido: string |null;
    edad: number | null;
    telefono: number | null;}
  }

const initialState: User={
    userInfo:{
        id:null,
        nombre:null,
        apellido:null,
        edad:null,
        telefono:null,
    }
    
}

export const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        saveUser:(state,action)=>{
            state.userInfo=action.payload
        }
    }
    
})

export const {saveUser} = userSlice.actions
export default userSlice.reducer