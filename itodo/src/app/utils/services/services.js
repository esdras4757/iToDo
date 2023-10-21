import apiConstants from '../constants/apis'
import axios from 'axios'

export const getAllTaskByidUser = (data) => {
  return axios.get(apiConstants.GET_ALL_TASK_BY_USER_ID + '/' + data)
}

export const updateTaskStatusById = (id, status) =>
  axios.put(apiConstants.PUT_UPDATE_TASK_STATUS_BY_ID, { idTask: id, status })

export const updateTaskMyDayById = (id, myDay) =>
  axios.put(apiConstants.PUT_UPDATE_TASK_MYDAY_BY_ID, { idTask: id, myDay })

export const getTaskById = (id) => {
  return axios.get(apiConstants.GET_TASK_BY_ID + '/' + id)
}

export const deleteCategoryById = (id, data) => {
  return axios.delete(apiConstants.DELETE_CATEGORY_BY_ID + '/' + id)
}

export const updateTaskById = (id, data) => {
  return axios.put(apiConstants.PUT_UPDATE_TASK_BY_ID + '/' + id, data)
}

export const deleteTaskById = (id) => {
  return axios.delete(apiConstants.DELETE_TASK_BY_ID + '/' + id)
}

export const getImportantByIdUser = (id) => {
  return axios.get(apiConstants.GET_IMPORTANT_BY_ID_USER + '/' + id)
}

export const getCompletedByIdUser = (id) => {
  return axios.get(apiConstants.GET_COMPLETED_BY_ID_USER + '/' + id)
}

export const getPendingByIdUser = (id) => {
  return axios.get(apiConstants.GET_PENDING_BY_ID_USER + '/' + id)
}

export const getAllNotesByIdUser = (id) => {
  return axios.get(apiConstants.GET_ALL_NOTES_BY_USER_ID + '/' + id)
}

export const addNote = (id, data) => {
  return axios.post(apiConstants.POST_ADD_NOTE, data)
}

export const updateNoteById = (id, data) => {
  return axios.put(apiConstants.PUT_UPDATE_NOTE_BY_ID + '/' + id, data)
}

export const deleteNoteById = (id) => {
  return axios.delete(apiConstants.DELETE_NOTE_BY_ID + '/' + id)
}

export const postSendEmail = (data) => {
  return axios.post(apiConstants.POST_SEND_EMAIL, data)
}

export const getAllEventsByIdUser = (id) => {
  return axios.get(apiConstants.GET_ALL_EVENTS_BY_USER_ID + '/' + id)
}

export const addEvent = (data) => {
  return axios.post(apiConstants.POST_ADD_EVENT, data)
}

export const updateEventById = (id, data) => {
  return axios.patch(apiConstants.PATCH_UPDATE_EVENT_BY_ID + '/' + id, data)
}

export const getAllRemindersByIdUser = (id) => {
  return axios.get(apiConstants.GET_ALL_REMINDERS_BY_ID_USER + '/' + id)
}

export const addReminder = (data) => {
  return axios.post(apiConstants.POST_ADD_REMINDER, data)
}

export const updateReminderById = (id, data) => {
  return axios.patch(apiConstants.PATCH_UPDATE_REMINDER_BY_ID + '/' + id, data)
}

export const getAllTaskInProgress = (id) => {
  return axios.get(apiConstants.GET_ALL_TASK_INPROGRESS_BY_ID_USER + '/' + id)
}

export const getAllNotesInProgress = (id) => {
  return axios.get(apiConstants.GET_ALL_NOTES_INPROGRESS_BY_ID_USER + '/' + id)
}

export const getAlltasksByIdCategory = (id) => {
  return axios.get(apiConstants.GET_ALL_TASK_BY_CATEGORY_ID + '/' + id)
}

export const getAllNotesByIdCategory = (id) => {
  return axios.get(apiConstants.GET_ALL_NOTES_BY_CATEGORY_ID + '/' + id)
}

export const getAllTAskMyDayByIdUser = (id) => {
  return axios.get(apiConstants.GET_ALL_TASK_MYDAY_BY_ID + '/' + id)
}
