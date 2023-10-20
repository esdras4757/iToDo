import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  deleteTaskById,
  updateTaskMyDayById,
} from "../../utils/services/services";
import { updateTaskStatusById } from "../../utils/services/services";
import { getTaskById } from "../../utils/services/services";
import userInfoSlice from "@/redux/features/userInfoSlice";
import { Col, Row } from "react-bootstrap";
import openNotification from "../../utils/notify";
import ModalEditTask from "./modalEditTask";
import { useSearchParams } from "next/navigation";
import moment from "moment";
import { DatePicker, Popover } from "antd";
import dayjs from "dayjs";
import { isEmpty, isNil } from "lodash";
interface taskDAata {
  _id: string;
  title: string;
  fileURL: string;
  categoryName?: string;
  isCompleted?: boolean;
  fileId?: string;
  isImportant?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  isInProgress?: boolean;
  description: string;
  reminder: string;
  initAt: string;
  endAt: string;
  file: string;
  note: string;
  originalFileName: string;
  categoryId: string;
  userId: string;
  status?: string;
  styleStatus?: string;
  priority: string;
  stylePriority?: string;
  myDay?: string;
}

interface status {
  isCompleted: boolean;
  isImportant: boolean;
  isPending: boolean;
  isActive: boolean;
  isInProgress: boolean;
}

interface propsInterface {
  item: taskDAata;
  setFastSpin: (value: boolean) => void;
  getAllTaskDataFn: () => void;
  setAllTaskData: React.Dispatch<React.SetStateAction<taskDAata[] | null>>;
  idOpenTask: string;
  isModalEditVisible: boolean;
  setIsModalEditVisible: (value: boolean) => void;
  getTaskByIdFn: (id: string) => void;
  taskError: boolean;
  taskLoader: boolean;
  taskData: taskDAata | null;
}

const Task = (props: propsInterface) => {
  const {
    item,
    setFastSpin,
    getAllTaskDataFn,
    setAllTaskData,
    idOpenTask,
    isModalEditVisible,
    setIsModalEditVisible,
    getTaskByIdFn,
    taskData,
    taskError,
    taskLoader,
  } = props;
  // const [isModalEditVisible, setIsModalEditVisible] = useState<boolean>(false);
  // const [taskData, setTaskData] = useState<taskDAata | null>(null);
  // const [taskLoader, setTaskLoader] = useState(false);
  // const [taskError, settaskError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [width, setwidth] = useState(window.innerWidth);



  useEffect(() => {
    const antPop = document.querySelectorAll(".ant-popover");
    if (isNil(antPop) == false && isEmpty(antPop) == false) {
      const handleClick = (e:any) => {
        e.stopPropagation();
        // Código adicional que desees ejecutar
      };
      antPop.forEach((item) => {
        console.log(item.parentElement)
        item.parentElement?.addEventListener("click", handleClick);
      });

      return () => {
        antPop.forEach((item) => {
          item.removeEventListener("click", handleClick);
        })
      }
    }
  }, []);

  const deleteTask = async (idTask: string) => {
    setFastSpin(true);
    try {
      const response = await deleteTaskById(idTask);
      console.log(response.data);
      if (response && response.data) {
        setAllTaskData((prev: taskDAata[] | null) => {
          if (prev === null) return null;
          return prev.filter((item: taskDAata) => item._id !== idTask);
        });
      }
    } catch (error: any) {
      openNotification("error", error.message);
    } finally {
      setFastSpin(false);
    }
  };

  const updateStatus = async (id: string, status: Partial<status>) => {
    setFastSpin(true);
    try {
      const response = await updateTaskStatusById(id, status);
      console.log(response.data);
      if (response && response.data) {
        getAllTaskDataFn();
      }
    } catch (error: any) {
      openNotification("error", error.message);
    } finally {
      setFastSpin(false);
    }
  };

  const myDay = async (id: string, date: string) => {
    setFastSpin(true);
    try {
      const response = await updateTaskMyDayById(id, date);
      console.log(response.data);
      if (response && response.data) {
        getAllTaskDataFn();
      }
    } catch (error: any) {
      openNotification("error", error.message);
    } finally {
      setFastSpin(false);
    }
  };

  useEffect(() => {
    const handleResize = (e: any) => {
      console.log(e);
      setwidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        getTaskByIdFn(item._id);
        setIsModalEditVisible(true);
      }}
      className="listMyDay cursor-alias"
    >
      <Row className="justify-content-around py-1 m-auto row-gap-3 h-100 flex-wrap px-2 align-content-center align-items-center text-center">
        <div className="col-auto">
          {item?.isCompleted == false ? (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isCompleted: !item.isCompleted,
                });
              }}
              className="fa-regular cursor-pointer fs-4 fa-circle"
            ></i>
          ) : (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isCompleted: !item.isCompleted,
                });
              }}
              className="fa-solid fs-4 cursor-pointer text-primary fa-circle-check"
            ></i>
          )}
        </div>

        <div className="col-4  text-left borderLeftm">
          <span className="titleTask fs-5 text-white fw-bolder">
            {item?.title && item?.title != "" ? item.title : "-"}
          </span>

          {width > 980 && (
            <div className="gap-2 contList fs-6">
              {item?.categoryName && item?.categoryName != "" && (
                <>
                  <span>
                    <i className="fa-solid mr-1 fa-layer-group"></i>
                    {item.categoryName}
                  </span>
                </>
              )}
              {/* <span>
                              <i className="fa-solid mr-1 fa-user"></i>
                              esdras4757
                            </span>
                            <i className="fa-solid dot fa-circle"></i> */}
              {item?.fileId && item?.fileId != "" && (
                <>
                  <i className="fa-solid dot fa-circle"></i>
                  <span>
                    <i className="fa-solid mr-1 fa-paperclip"></i>
                  </span>
                </>
              )}

              {item?.reminder && item?.reminder != "" && (
                <>
                  <i className="fa-solid dot fa-circle"></i>
                  <span>
                    <i className="fa-solid mr-1 fa-bell"></i>
                    {item.reminder}
                  </span>
                </>
              )}
              {/* <span>
                              <i className="fa-solid mr-1 text-primary fa-share-nodes"></i>
                            </span> */}

              {item?.note && item?.note != "" && (
                <>
                  <i className="fa-solid dot fa-circle"></i>
                  <span>
                    <i className="fa-solid mr-1 fa-note-sticky"></i>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="col-2  text-left d-flex borderLeft"
          style={{ minWidth: "max-content" }}
        >
          <span
            className="tag"
            style={{ backgroundColor: item?.stylePriority }}
          >
            Prioridad: {item?.priority}
          </span>
        </div>

        <div
          className="col-2 text-left d-flex borderLeft"
          style={{ minWidth: "max-content" }}
        >
          <span className="tag" style={{ backgroundColor: item?.styleStatus }}>
            {item?.status}
          </span>
        </div>
        {/* completada 
    No completada
    En progreso
    Pendiente*/}
        {/* actionButtons */}
        <Row
          style={{
            minWidth: "max-content",
          }}
          className="col-3 text-center justify-content-around justify-items-around align-content-around"
        >
          <Popover
            content={
              <div
              onClick={(e) => e.stopPropagation()}
               className="justify-content-around col-12 m-auto row">
                <i
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(item?.myDay == moment().format("DD/MM/YYYY"));
                    myDay(
                      item._id,
                      item?.myDay == moment().format("DD/MM/YYYY")
                        ? ""
                        : moment().format("DD/MM/YYYY")
                    );
                  }}
                  className={`col-auto cursor-pointer ${
                    item?.myDay == moment().format("DD/MM/YYYY")
                      ? "fa-solid text-primary"
                      : "fa-regular text-white"
                  } fs-5 fa-sun`}
                ></i>

                <div
                  className="row col-auto"
                  title={item?.myDay}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DatePicker
                  onClick={e=>{
                    item?.myDay != moment().format("DD/MM/YYYY") &&
                      item?.myDay != "" &&
                      myDay(
                        item._id,
                        ''
                      );
                  }}
                    className={`cursor-pointer datePickerIcon ${
                      item?.myDay != moment().format("DD/MM/YYYY") &&
                      item?.myDay != "" &&
                      "colorIcon"
                    } text-white`}
                    bordered={false}
                    onChange={(dateValue) => {
                      myDay(
                        item._id,
                        item?.myDay == dayjs(dateValue).format("DD/MM/YYYY")
                          ? ""
                          : dayjs(dateValue).format("DD/MM/YYYY")
                      );
                    }}
                  />
                </div>
              </div>
            }
            trigger="click"
            title={
              <div
              onClick={(e) => e.stopPropagation()}
                style={{ fontSize: "11", minWidth: 250 }}
                className="col-12 m-auto row text-white"
              >
                <div 
                onClick={(e) => e.stopPropagation()}
                className="col-6 p-0">
                  {item?.myDay == moment().format("DD/MM/YYYY") ?
                      "Eliminar de mi dia":'Añadir a mi dia'}
                  </div>

                <div 
                onClick={(e) => e.stopPropagation()}
                title={item?.myDay}
                className="col-6 p-0">
                {item?.myDay != moment().format("DD/MM/YYYY") &&
                      item?.myDay != "" ?
                      "Eliminar dia":'Seleccionar un dia'}
                  </div>
              </div>
            }
          >
            <i
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`col-auto cursor-pointer ${
                item?.myDay == moment().format("DD/MM/YYYY")
                  ? "fa-solid text-primary"
                  : "fa-regular text-secondary"
              } fs-5 fa-sun`}
            ></i>
          </Popover>

          {item?.isImportant == true ? (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isImportant: !item.isImportant,
                });
              }}
              className="col-auto fa-solid cursor-pointer text-warning fs-5 fa-star"
            ></i>
          ) : (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isImportant: !item.isImportant,
                });
              }}
              className="col-auto fa-regular cursor-pointer fs-5 fa-star"
            ></i>
          )}

          <i
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(item._id);
            }}
            className="col-auto cursor-pointer fa fs-5 text-danger fa-trash"
          ></i>
        </Row>
      </Row>

      <ModalEditTask
        visible={isModalEditVisible}
        setVisible={setIsModalEditVisible}
        taskData={taskData}
        setAllTaskData={setAllTaskData}
        taskLoader={taskLoader}
        taskError={taskError}
        setFastSpin={setFastSpin}
      />
    </div>
  );
};

export default Task;
