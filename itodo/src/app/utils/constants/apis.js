// const BASE_URL =
//  "https://cuddly-garbanzo-r6g6pq5x4j42x4j5-5000.app.github.dev/"; // ajusta esto a tu base URL real

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/'

const apiConstants = {
  DELETE_CATEGORY_BY_ID: BASE_URL + 'api/category/delete',
  GET_ALL_TASK: BASE_URL + 'api/task',
  GET_ALL_TASK_BY_USER_ID: BASE_URL + 'api/task/getByIdUser',
  GET_TASK_BY_ID: BASE_URL + 'api/task/getbyid',
  PUT_UPDATE_TASK_STATUS_BY_ID: BASE_URL + 'api/task/status',
  PUT_UPDATE_TASK_MYDAY_BY_ID: BASE_URL + 'api/task/myDay',

  PUT_UPDATE_TASK_BY_ID: BASE_URL + 'api/task/update',
  DELETE_TASK_BY_ID: BASE_URL + 'api/task/delete',
  GET_IMPORTANT_BY_ID_USER: BASE_URL + 'api/task/getImportantByIdUser',
  GET_COMPLETED_BY_ID_USER: BASE_URL + 'api/task/getCompletedByIdUser',
  GET_PENDING_BY_ID_USER: BASE_URL + 'api/task/getPendingByIdUser',

  // notes
  GET_ALL_NOTES_BY_USER_ID: BASE_URL + 'api/note/getAllByIdUser',
  POST_ADD_NOTE: BASE_URL + 'api/note/add',
  PUT_UPDATE_NOTE_BY_ID: BASE_URL + 'api/note/update',
  DELETE_NOTE_BY_ID: BASE_URL + 'api/note/delete',

  // utils
  POST_SEND_EMAIL: BASE_URL + 'api/utils/sendEmail',
  GET_ALL_EVENTS_BY_USER_ID: BASE_URL + 'api/utils/getAllEventsByIdUser',
  GET_ALL_BY_USER_ID: BASE_URL + 'api/utils/getAllByUserId',

  // Events
  POST_ADD_EVENT: BASE_URL + 'api/event/add',
  PATCH_UPDATE_EVENT_BY_ID: BASE_URL + 'api/utils/updateEventById',

  // reminders
  GET_ALL_REMINDERS_BY_ID_USER: BASE_URL + 'api/utils/allRemindersByIdUser',
  POST_ADD_REMINDER: BASE_URL + 'api/reminder/addReminder',
  PATCH_UPDATE_REMINDER_BY_ID: BASE_URL + 'api/utils/updateReminderById',

  GET_ALL_TASK_INPROGRESS_BY_ID_USER: BASE_URL + 'api/utils/getAllTaskInProgress',
  GET_ALL_NOTES_INPROGRESS_BY_ID_USER: BASE_URL + 'api/utils/getAllNotesInProgress',

  GET_ALL_TASK_BY_CATEGORY_ID: BASE_URL + 'api/task/getByIdCategory',
  GET_ALL_NOTES_BY_CATEGORY_ID: BASE_URL + 'api/note/getByIdCategory',

  GET_ALL_TASK_MYDAY_BY_ID: BASE_URL + 'api/task/getMyDayByIdUser'

}

export default apiConstants
