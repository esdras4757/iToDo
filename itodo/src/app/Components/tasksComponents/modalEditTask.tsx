import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Select,
  DatePicker,
  Drawer,
  TimePicker,
  Spin,
} from "antd";
import { Row } from "react-bootstrap";
import { Button } from "@mui/material";
import Dropzone from "../Dropzone";
import TextArea from "antd/es/input/TextArea";
import "dayjs/locale/es";
import moment from "moment";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import dayjs, { Dayjs } from "dayjs";
import { useAddTaskMutation } from "@/redux/services/taskApi";
import openNotification from "@/app/utils/notify";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "@/app/Components/Loader";
import { updateTaskById } from "@/app/utils/services/services";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Notar cómo se importa el plugin aquí

// Establece la configuración regional en español
// moment.locale("es");
dayjs.locale("es");
dayjs.extend(customParseFormat);
interface taskDAata {
  _id: string;
  title: string;
  isCompleted?: boolean;
  isImportant?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  isInProgress?: boolean;
  description: string;
  reminder: string;
  initAt: string;
  endAt: string;
  categoryId: string | null;
  file: string;
  fileURL: string;
  note: string;
  userId: string;
  originalFileName: string;
  priority: string;
}

interface propsInterface {
  visible: boolean;
  setVisible: (value: boolean) => void;
  taskData: taskDAata | null;
  taskLoader: boolean;
  taskError: boolean;
  setAllTaskData: (value: any) => void;
  setFastSpin: (value: boolean) => void;
}

interface dataToAddNote {
  title: string;
  description: string;
  reminder: string | null;
  userId: string;
  initDate: Dayjs;
  endDate: Dayjs;
  initHour: Dayjs;
  endHour: Dayjs;
  file: any | null;
  fileURL: string;
  categoryId: string | null;
  note: string | null;
  isAgend: boolean;
  isRemainder: boolean;
  priority: string;
}
const initData: dataToAddNote = {
  title: "",
  description: "",
  reminder: null,
  userId: "",
  initDate: dayjs(),
  endDate: dayjs(),
  initHour: dayjs(),
  endHour: dayjs(),
  fileURL: "",
  categoryId: null,
  file: null,
  note: null,
  isRemainder: false,
  isAgend: false,
  priority: "Baja",
};

const ModalEditTask = (props: propsInterface) => {
  const {
    visible,
    setVisible,
    taskData,
    taskError,
    taskLoader,
    setAllTaskData,
    setFastSpin,
  } = props;

  const [reminder, setReminder] = useState(false);
  const [agenda, setAgenda] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [isEditNote, setIsEditNote] = useState(false);
  const [dateRemainder, setDateRemainder] = useState<Dayjs | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [data, setData] = useState<dataToAddNote>(initData);
  const [timeRemainder, setTimeRemainder] = useState<Dayjs | null>(null);
  const [remainderSelect, setRemainderSelect] = useState<string | null>(null);
  const [
    addTask,
    { isLoading: isLoadingAddTask, data: dataAddTask, error: errorAddTask },
  ] = useAddTaskMutation();
  const [isMessageError, setIsMessageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const categories = useSelector((state: any) => state.categoryReducer);
  const [catalogCategories, setCatalogCategories] = useState([]);

  useEffect(() => {
    if (taskData) {
      const {
        description,
        endAt,
        initAt,
        isCompleted,
        note,
        reminder,
        file,
        title,
        userId,
        fileURL,
        categoryId,
        _id,
        originalFileName,
        priority,
      } = taskData;

      setData({
        title,
        description,
        reminder,
        userId,
        initDate: initAt != "" && initAt ? dayjs(initAt, "DD/MM/YYYY HH:mm") : dayjs(),
        endDate: endAt != "" && endAt ? dayjs(endAt, "DD/MM/YYYY HH:mm") : dayjs(),
        initHour: initAt != "" && initAt ? dayjs(initAt, "DD/MM/YYYY HH:mm") : dayjs(),
        endHour: endAt != "" && endAt ? dayjs(endAt, "DD/MM/YYYY HH:mm") : dayjs(),
        file,
        categoryId,
        note,
        fileURL,
        isRemainder: !!(reminder !== "" && reminder),
        isAgend: !!((initAt !== "" && initAt) || (endAt !== "" && endAt)),
        priority,
      });

      setReminder(!!(reminder !== "" && true && reminder));
      setAgenda(initAt != "" || (endAt != "" && true));
      setRemainderSelect(null);
    }
  }, [taskData]);

  useEffect(() => {
    if (visible === false) {
      setData(initData);
      setTimeRemainder(null);
      setRemainderSelect(null);
    }
  }, [visible]);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = (event: any) => {
    event.stopPropagation();
    setVisible(false);
  };

  useEffect(() => {
    if (isEditNote && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditNote]);

  const fillData = (name: keyof dataToAddNote, value: any) => {
    setData((data) => {
      return { ...data, [name]: value };
    });
  };

  useEffect(() => {
    if (dateRemainder && timeRemainder) {
      const date =
        dateRemainder.format("DD/MM/YYYY") + " " + timeRemainder.format("h:mm");
      fillData("reminder", date);
    }
  }, [dateRemainder, timeRemainder]);

  useEffect(() => {
    if (categories.categories) {
      const catalog = categories.categories.map((item: any) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setCatalogCategories(catalog);
    }
  }, [categories]);

  const updateTaskFn = async () => {
    const userId = sessionStorage.getItem("user") ?? "";
    setFastSpin(true);

    if (data.title && data.title != "" && taskData && taskData._id) {
      setLoading(true);
      setIsMessageError(false);

      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description ?? "");
      formData.append("reminder", data.isRemainder ? data.reminder ?? "" : "");
      formData.append(
        "initAt",
        data.isAgend
          ? data.initDate.format("DD/MM/YYYY") +
              " " +
              data.initHour.format("h:mm")
          : ""
      );
      formData.append(
        "endAt",
        data.isAgend
          ? data.endDate.format("DD/MM/YYYY") +
              " " +
              data.endHour.format("h:mm")
          : ""
      );
      formData.append("priority", data.priority ?? "");
      formData.append("categoryId", data.categoryId ?? "");
      formData.append("file", file); // Asegúrate de que 'file' contenga el archivo que deseas cargar
      formData.append("note", data.note ?? "");
      formData.append("userId", userId); // Suponiendo que userId es la variable que contiene el ID de usuario

      try {
        const response = await updateTaskById(taskData._id, formData);
        if (response && response.data) {
          setAllTaskData((prev: taskDAata[]) => {
            if (!prev) return prev;
            if (response.data) {
              setVisible(false);
              return prev.map((item: taskDAata) => {
                if (item._id == response.data._id) {
                  return response.data;
                }
                return item;
              });
            } else {
              return prev;
            }
          });
        }
        setFastSpin(false);
        setLoading(false);
      } catch (error: any) {
        setFastSpin(false);
        setLoading(false);
        openNotification(
          "error",
          error.message || "ah ocurrido un error intentalo de nuevo"
        );
      }
    } else {
      if (data.title == "" || !(data.isRemainder == true && data.reminder)) {
        setIsMessageError(true);
        setLoading(false);
      }
    }
  };

  return (
    <div>
      {/* <button onClick={showModal}>Nueva Tarea</button> */}
      <Drawer
        title="Editar tarea"
        placement="right"
        onClose={handleCancel}
        className="bg-bg-mainContent"
        open={visible}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {taskError ? (
          <div>Error al cargar los datos. Por favor, inténtalo de nuevo.</div>
        ) : taskLoader ? (
          <div className="col-12 h-full row justify-center align-content-center align-items-center">
            <Loader />
          </div>
        ) : (
          taskData && (
            <div>
              <Spin spinning={loading}>
                <Form layout="vertical">
                  <Form.Item
                    label="Titulo"
                    rules={[
                      {
                        required: true,
                        message: "Por favor, ingresa el titulo de la tarea.",
                      },
                    ]}
                  >
                    <Input
                      className="inputAddList"
                      style={{ marginBottom: 15 }}
                      value={data.title}
                      onChange={(e) => {
                        fillData("title", e.target.value);
                      }}
                    />
                    {isMessageError && (
                      <span className="text-danger p-2"> Campo requerido </span>
                    )}
                  </Form.Item>

                  <Form.Item label="Descripción">
                    <Input.TextArea
                      className="inputAddList"
                      value={data.description}
                      style={{ maxHeight: 95, marginBottom: 15 }}
                      onChange={(e) => {
                        fillData("description", e.target.value);
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Prioridad"
                    style={{ color: "white", width: "100%", marginBottom: 30 }}
                  >
                    <Select
                      className="inputAddList"
                      showSearch
                      placeholder="Selecciona la prioridad de la tarea"
                      value={data.priority}
                      onChange={(value) => {
                        fillData("priority", value);
                      }}
                      style={{ marginBottom: 15 }}
                      options={[
                        { value: "Baja", label: "Baja" },
                        { value: "Media", label: "Media" },
                        { value: "Alta", label: "Alta" },
                      ]}
                    ></Select>
                  </Form.Item>

                  <Form.Item
                    label="Asignar a"
                    style={{ color: "white", width: "100%", marginBottom: 30 }}
                  >
                    <Select
                      className="inputAddList"
                      showSearch
                      placeholder="Asignar a una lista"
                      onChange={(value) => {
                        fillData("categoryId", value);
                      }}
                      style={{ marginBottom: 15 }}
                      value={data.categoryId}
                      options={catalogCategories}
                    ></Select>
                  </Form.Item>

                  <Form.Item valuePropName="checked">
                    <Checkbox
                      checked={reminder}
                      onChange={() => {
                        setReminder(!reminder);
                        fillData("isRemainder", !reminder);
                      }}
                      style={{ marginBottom: 0 }}
                    >
                      Recordatorio
                    </Checkbox>
                  </Form.Item>

                  {reminder && (
                    <Row className="justify-content-center">
                      <Form.Item
                        label=""
                        style={{ color: "white", width: "90%" }}
                        rules={[
                          {
                            required: true,
                            message: "Por favor, selecciona un estado.",
                          },
                        ]}
                      >
                        <Select
                          className="inputAddList"
                          value={data.reminder}
                          placeholder="ingresa una fecha"
                          defaultValue={'0'}
                          onChange={(value) => {
                            fillData("reminder", value);
                            setRemainderSelect(value);
                            if (value == "0") {
                              setDateRemainder(dayjs());
                              setTimeRemainder(dayjs());
                            }
                          }}
                          style={{ marginBottom: 15 }}
                          options={[
                            // {
                            //   value: moment().format("DD/MM/YYYY h:mm"),
                            //   label: (
                            //     <div>
                            //       Hoy{" "}
                            //       <span className="text-primary ml-2">
                            //         ({moment().format("ddd-DD/MM/YYYY h:mm")})
                            //       </span>
                            //     </div>
                            //   ),
                            // },
                            {
                              value: dayjs()
                                .add(1, "day")
                                .format("DD/MM/YYYY h:mm"),
                              label: (
                                <div>
                                  Mañana{" "}
                                  <span className="text-primary ml-2">
                                    (
                                    {dayjs()
                                      .add(1, "day")
                                      .format("ddd-DD/MM/YYYY h:mm")}
                                    )
                                  </span>
                                </div>
                              ),
                            },
                            {
                              value: dayjs()
                                .add(1, "week")
                                .format("DD/MM/YYYY h:mm"),
                              label: (
                                <div>
                                  Siguiente semana{" "}
                                  <span className="text-primary ml-2">
                                    (
                                    {dayjs()
                                      .add(1, "week")
                                      .format("ddd-DD/MM/YYYY h:mm")}
                                    )
                                  </span>
                                </div>
                              ),
                            },
                            {
                              value: dayjs()
                                .add(1, "month")
                                .format("DD/MM/YYYY h:mm"),
                              label: (
                                <div>
                                  Siguiente mes{" "}
                                  <span className="text-primary ml-2">
                                    (
                                    {dayjs()
                                      .add(1, "month")
                                      .format("ddd-DD/MM/YYYY h:mm")}
                                    )
                                  </span>
                                </div>
                              ),
                            },
                            {
                              value: "0",
                              label: "seleccionar fecha y hora",
                            },
                          ]}
                        ></Select>
                        {isMessageError && (
                          <span className="text-danger p-2">
                            {" "}
                            Campo requerido{" "}
                          </span>
                        )}

                        {remainderSelect == "0" && (
                          <Row className="justify-content-center">
                            <DatePicker
                              className="inputAddList col-5 justify-content-center mr-3"
                              format="DD/MM/YYYY"
                              value={dateRemainder}
                              defaultValue={dayjs()}
                              onChange={(e) => {
                                if (e) {
                                  setDateRemainder(e);
                                }
                              }}
                            />
                            <TimePicker
                              value={timeRemainder}
                              defaultValue={dayjs()}
                              className="inputAddList col-5"
                              format="h:mm"
                              onChange={(e) => {
                                if (e) {
                                  setTimeRemainder(e);
                                }
                              }}
                            />
                          </Row>
                        )}
                      </Form.Item>
                    </Row>
                  )}

                  <Form.Item>
                    <Checkbox
                      checked={agenda}
                      onChange={() => {
                        fillData("isAgend", !agenda);
                        setAgenda(!agenda);
                      }}
                    >
                      Agregar a agenda
                    </Checkbox>
                  </Form.Item>

                  {agenda && (
                    <Row className="justify-content-center">
                      <Form.Item
                        label="Inicio"
                        className="flex justify-content-center"
                      >
                        <DatePicker
                          className="inputAddList justify-content-center mr-3"
                          format="DD/MM/YYYY"
                          value={data.initDate}
                          defaultValue={dayjs()}
                          onChange={(e) => {
                            if (e) {
                              fillData("initDate", e);
                            }
                          }}
                        />
                        <TimePicker
                          className="inputAddList"
                          value={data.initHour}
                          defaultValue={dayjs()}
                          onChange={(e) => {
                            if (e) {
                              fillData("initHour", e);
                            }
                          }}
                          format="h:mm"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Fin"
                        className="flex justify-content-center"
                      >
                        <DatePicker
                          defaultValue={dayjs()}
                          className="inputAddList mr-3"
                          format="DD/MM/YYYY"
                          value={data.endDate}
                          onChange={(e) => {
                            if (e) {
                              fillData("endDate", e);
                            }
                          }}
                        />
                        <TimePicker
                          className="inputAddList"
                          defaultValue={dayjs()}
                          value={data.endHour}
                          onChange={(e) => {
                            if (e) {
                              fillData("endHour", e);
                            }
                          }}
                          format="h:mm"
                        />
                      </Form.Item>
                    </Row>
                  )}

                  <div className="mt-4 left-9 right-9">
                    {data.fileURL ? (
                      <div
                        className="addNote py-4 text-center relative justify-content-center align-items-center"
                        style={{ width: "100%" }}
                      >
                        <a
                          href={data.fileURL}
                          target="_blank"
                          download="archivo.jpg"
                          className="text-center row justify-content-center align-content-center"
                        >
                          <i className="fa-solid fa-arrow-down fs-5 m-1"></i>
                          {/* <div>Descargar Archivo</div> */}
                          <div>{taskData.originalFileName}</div>
                        </a>
                        <i
                          onClick={() => fillData("fileURL", null)}
                          className="fas fa-trash text-danger position-absolute top-3 right-4"
                        />
                      </div>
                    ) : (
                      <Dropzone
                        onDrop={(acceptedFiles, fileRejections, event) => {
                          if (acceptedFiles) {
                            if (acceptedFiles.size < 1000000) {
                              setFile(acceptedFiles);
                            }
                          }
                        }}
                      ></Dropzone>
                    )}

                    <div
                      className="addNote text-center relative justify-content-center align-items-center"
                      style={{ width: "100%" }}
                    >
                      {isEditNote ? (
                        <>
                          <i
                            onClick={() => {
                              fillData("note", null);
                              setIsEditNote(false);
                            }}
                            className="absolute left-2 top-2 fa-solid m-1 fs-5 text-danger fa-times"
                          ></i>
                          <Row className="p-4">
                            <i className="fa-solid m-1 fs-4 fa-note-sticky"></i>

                            <TextArea
                              ref={textAreaRef}
                              id="textNotes"
                              value={data.note ? data.note : undefined}
                              placeholder="Ingresa una nota"
                              className="inputAddList p-2 mt-2 border-0"
                              onChange={(e) => {
                                fillData("note", e.target.value);
                              }}
                            />
                          </Row>
                        </>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditNote(true);
                          }}
                          className="p-4"
                        >
                          <i className="fa-solid m-1 fs-4 fa-note-sticky"></i>
                          <p className="m-1 m-0">
                            {data.note || "Agregar nota"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Form>

                <Row className="justify-content-around">
                  <Button
                    title="Cancel"
                    className="btnAddTask mt-5 row px-0 col-5 text-danger"
                    onClick={(e) => handleCancel(e)}
                  >
                    <i className="fa-solid fa-xmark fs-6 m-1"></i>
                    <p className="m-0">Cancelar</p>
                  </Button>

                  <Button
                    title="Add"
                    onClick={(e) => updateTaskFn()}
                    className="btnAddTask col-5  mt-5 row px-0"
                  >
                    <i className="fa-solid fa-save fs-6 m-1"></i>
                    <p className="m-0">Guardar</p>
                  </Button>
                </Row>
              </Spin>
            </div>
          )
        )}
      </Drawer>
    </div>
  );
};

export default ModalEditTask;
