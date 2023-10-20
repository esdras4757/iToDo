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
import Dropzone from "../../Components/Dropzone";
import TextArea from "antd/es/input/TextArea";
import "dayjs/locale/es";
import moment from "moment";
import momentGenerateConfig from "rc-picker/lib/generate/moment";
import dayjs, { Dayjs } from "dayjs";
import { useAddTaskMutation } from "@/redux/services/taskApi";
import openNotification from "@/app/utils/notify";
import axios from "axios";
import { useSelector } from 'react-redux';
// Establece la configuración regional en español
// moment.locale("es");
dayjs.locale("es");

interface propsInterface {
  visible: boolean;
  setVisible: (value: boolean) => void;
  setAllTaskData:(value: any) => void
  actionProps?:{isImportant:boolean,isMyDay?:boolean}
}

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
  categoryId?:string | null;
  initAt: string;
  endAt: string;
  fileId: string;
  note: string;
  userId: string;
}



interface dataToAddNote {
  title: string;
  description: string;
  reminder: string | null;
  userId: string;
  initDate: Dayjs;
  endDate: Dayjs;
  categoryId?:string | null;
  initHour: Dayjs;
  endHour: Dayjs;
  file: any | null;
  note: string | null;
  isAgend: boolean;
  isRemainder: boolean;
  priority:string
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
  categoryId:null,
  file: null,
  note: null,
  isRemainder: false,
  isAgend: false,
  priority:'Baja'
};

const ModalAddTask = (props: propsInterface) => {
  const { visible, setVisible,setAllTaskData,actionProps } = props;

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
  const [loading,setLoading]=useState(false)
  const categories= useSelector((state:any)=>state.categoryReducer)
const [catalogCategories, setCatalogCategories] = useState([])
const [key, setKey] = useState(0)
  const showModal = () => {
    setVisible(true);
  };

  useEffect(() => {
    if (visible === true) {
      setData(initData)
      setTimeRemainder(null)
      setRemainderSelect(null)
      setKey(key+1)
      setIsEditNote(false)
      setFile(null)
      setReminder(false)
      setAgenda(false)
      setIsMessageError(false)
    }
  }, [visible]);



  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
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
      console.log(categories.categories)
      const catalog= categories.categories.map((item:any)=>{
        return {
          value:item.id,
          label:item.name
        }
      })
      console.log(catalog)
      setCatalogCategories(catalog)
    }
  }, [categories]);

  const addTaskFn = () => {
    const userId = sessionStorage.getItem("user") ?? "";

    if (data.title && data.title != "" && userId && userId != "") {
      setLoading(true)
      setIsMessageError(false);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("isImportant",actionProps&&actionProps.isImportant==true?'true':'false');
      formData.append("myDay",actionProps&&actionProps.isMyDay==true?moment().format('DD/MM/YYYY'):'');
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
      formData.append("categoryId", data.categoryId??'');
      formData.append("file", file); // Asegúrate de que 'file' contenga el archivo que deseas cargar
      formData.append("note", data.note ?? "");
      formData.append("priority", data.priority ?? "");
      formData.append("userId", userId); // Suponiendo que userId es la variable que contiene el ID de usuario

      axios
        .post("http://localhost:5000/api/task/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res);
          setLoading(false)
          setVisible(false)
          setAllTaskData((prev:taskDAata[])=>{
            if(!prev) return prev
            if (res.data) {
              return [...prev,res.data]
            }else{
              return prev
            }
            
          })
        })
        .catch((error) => {
          setLoading(false)
          openNotification(
            "error",
            error.message || "ah ocurrido un error intentalo de nuevo"
          );
        });

    } else {
      if (data.title == "" || !(data.isRemainder == true && data.reminder)) {
        setIsMessageError(true);
        setLoading(false)
      }
    }
  };

  return (
    <div>
      {/* <button onClick={showModal}>Nueva Tarea</button> */}
      <Drawer
        title="Agregar tarea"
        placement="right"
        onClose={handleCancel}
        className="bg-bg-mainContent"
        open={visible}
      >

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
            key={key}
              className="inputAddList"
              style={{ marginBottom: 15 }}
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
            key={key}
              className="inputAddList"
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
            key={key}
              className="inputAddList"
              showSearch
              placeholder="Selecciona la prioridad de la tarea"
              value={data.priority}
              onChange={(value) => {
                fillData("priority", value);
              }}
              style={{ marginBottom: 15 }}
              options={[
                {value:'Baja',
                  label:'Baja'
                },
                {value:'Media',
                  label:'Media'
                },
                {value:'Alta',
                  label:'Alta'
                }
              ]}
            ></Select>
          </Form.Item>

          <Form.Item
            label="Asignar a"
            style={{ color: "white", width: "100%", marginBottom: 30 }}
          >
            <Select
            key={key}
              className="inputAddList"
              showSearch
              placeholder="asignar a una categoria"
              value={data.categoryId}
              onChange={(value) => {
                fillData("categoryId", value);
              }}
              style={{ marginBottom: 15 }}
              options={catalogCategories}
            ></Select>
          </Form.Item>

          <Form.Item valuePropName="checked">
            <Checkbox
            key={key}
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
              key={key}
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
                key={key}
                  className="inputAddList"
                  placeholder="ingresa una fecha*"
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
                      value: moment().add(1, "day").format("DD/MM/YYYY h:mm"),
                      label: (
                        <div>
                          Mañana{" "}
                          <span className="text-primary ml-2">
                            (
                            {moment()
                              .add(1, "day")
                              .format("ddd-DD/MM/YYYY h:mm")}
                            )
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: moment().add(1, "week").format("DD/MM/YYYY h:mm"),
                      label: (
                        <div>
                          Siguiente semana{" "}
                          <span className="text-primary ml-2">
                            (
                            {moment()
                              .add(1, "week")
                              .format("ddd-DD/MM/YYYY h:mm")}
                            )
                          </span>
                        </div>
                      ),
                    },
                    {
                      value: moment().add(1, "month").format("DD/MM/YYYY h:mm"),
                      label: (
                        <div>
                          Siguiente mes{" "}
                          <span className="text-primary ml-2">
                            (
                            {moment()
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
                  <span className="text-danger p-2"> Campo requerido </span>
                )}

                {remainderSelect == "0" && (
                  <Row className="justify-content-center">
                    <DatePicker
                    key={key}
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
                    key={key}
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
            key={key}
              checked={agenda}
              onChange={() => {
                fillData("isAgend", !agenda);
                setAgenda(!agenda);
                if (!agenda) {
                }
              }}
            >
              Agregar a agenda
            </Checkbox>
          </Form.Item>

          {agenda && (
            <Row className="justify-content-center">
              <Form.Item label="Inicio" className="flex justify-content-center">
                <DatePicker
                key={key}
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

              <Form.Item label="Fin" className="flex justify-content-center">
                <DatePicker
                key={key}
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
            <Dropzone
            key={key}
              onDrop={(acceptedFiles, fileRejections, event) => {
                if (acceptedFiles) {
                  if (acceptedFiles.size < 1000000) {
                    setFile(acceptedFiles);
                  }
                }
              }}
            />

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
                    key={key}
                      ref={textAreaRef}
                      id="textNotes"
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
                  <p className="m-1">Agregar nota</p>
                </div>
              )}
            </div>
          </div>
        </Form>

        <Row className="justify-content-around">
          <Button
            title="Cancel"
            className="btnAddTask mt-5 row px-0 col-5 text-danger"
            onClick={() => handleCancel()}
          >
            <i className="fa-solid fa-xmark fs-6 m-1"></i>
            <p className="m-0">Cancelar</p>
          </Button>

          <Button
            title="Add"
            onClick={(e) => addTaskFn()}
            className="btnAddTask col-5  mt-5 row px-0"
          >
            <i className="fa-solid fa-paper-plane fs-6 m-1"></i>
            <p className="m-0">Agregar</p>
          </Button>
        </Row>
        </Spin>
      </Drawer>
    </div>
  );
};

export default ModalAddTask;
