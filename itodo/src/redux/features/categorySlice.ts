import { createSlice } from "@reduxjs/toolkit";

const initialState={
    categories:[]
}


export const categorySlice =createSlice({
    name:'category',
    initialState,
    reducers:{
        addCategories:((state,action)=>{
            state.categories=action.payload
        })
    }
})

export const {addCategories} =categorySlice.actions
export default categorySlice.reducer