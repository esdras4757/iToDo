import apiConstants from "../constants/apis";
import axios from "axios";


export const getAllTaskByidUser = (data) => {
    return axios.get(apiConstants.GET_ALL_TASK_BY_USER_ID + '/' + data)
}

export const updateTaskStatusById = (id,status) => 
    axios.put(apiConstants.PUT_UPDATE_TASK_STATUS_BY_ID, {idTask:id,status})

export const getTaskById = (id)=>{
   return axios.get(apiConstants.GET_TASK_BY_ID + '/' + id)
}

export const updateTaskById = (id,data)=>{
    return axios.put(apiConstants.PUT_UPDATE_TASK_BY_ID + '/' + id,data)
 }

export const deleteTaskById = (id)=>{
    return axios.delete(apiConstants.DELETE_TASK_BY_ID + '/' + id)
}

export const getImportantByIdUser = (id)=>{
    return axios.get(apiConstants.GET_IMPORTANT_BY_ID_USER + '/' + id)
}

export const getCompletedByIdUser = (id)=>{
    return axios.get(apiConstants.GET_COMPLETED_BY_ID_USER + '/' + id)
}

export const getPendingByIdUser = (id)=>{
    return axios.get(apiConstants.GET_PENDING_BY_ID_USER + '/' + id)
}
