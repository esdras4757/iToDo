const BASE_URL = "http://localhost:5000/"; // ajusta esto a tu base URL real

const apiConstants = {
  GET_ALL_TASK: BASE_URL + "api/task",
  GET_ALL_TASK_BY_USER_ID: BASE_URL + "api/task/getByIdUser",
  GET_TASK_BY_ID: BASE_URL + "api/task/getbyid",
  PUT_UPDATE_TASK_STATUS_BY_ID:BASE_URL + "api/task/status",
  PUT_UPDATE_TASK_BY_ID:BASE_URL + "api/task/update",
  DELETE_TASK_BY_ID:BASE_URL + "api/task/delete",
  GET_IMPORTANT_BY_ID_USER: BASE_URL + "api/task/getImportantByIdUser",
  GET_COMPLETED_BY_ID_USER: BASE_URL + "api/task/getCompletedByIdUser",
  GET_PENDING_BY_ID_USER: BASE_URL + "api/task/getPendingByIdUser",
};

export default apiConstants;
