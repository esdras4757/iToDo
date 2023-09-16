import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { deleteTaskById } from "../../utils/services/services";
import { updateTaskStatusById } from "../../utils/services/services";
import { getTaskById } from "../../utils/services/services";
import userInfoSlice from "@/redux/features/userInfoSlice";
import { Col, Row } from "react-bootstrap";
import openNotification from "../../utils/notify";
import ModalEditTask from "./modalEditTask";

interface taskDAata {
    _id: string;
    title: string;
    fileURL: string;
    categoryName?: string;
    isCompleted?: boolean;
    fileId?:string;
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
  setFastSpin:(value:boolean)=>void
  getAllTaskDataFn:()=>void
  setAllTaskData: React.Dispatch<React.SetStateAction<taskDAata[] | null>>;

}

const Task = (props: propsInterface) => {
  const { item, setFastSpin,getAllTaskDataFn,setAllTaskData } = props;
  const [isModalEditVisible, setIsModalEditVisible] = useState<boolean>(false);
  const [taskData, setTaskData] = useState<taskDAata | null>(null);
  const [taskLoader, setTaskLoader] = useState(false);
  const [taskError, settaskError] = useState(false);

  const router = useRouter();

  const getTaskByIdFn = async (idTask: string) => {
    setTaskData(null);
    setTaskLoader(true);
    settaskError(false);
    try {
      const response = await getTaskById(idTask);
      console.log(response.data);
      setTaskData(response.data);
    } catch (error: any) {
      openNotification("error", error.message);
    } finally {
      setTaskLoader(false);
    }
  };

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

  return (
    <div
      onClick={(e) => {
        getTaskByIdFn(item._id);
        setIsModalEditVisible(true);
      }}
      className="listMyDay cursor-alias"
    >
      <Row className="justify-content-center h-100 flex-wrap jus align-content-center align-items-center text-center">
        <div className="col-1">
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
        <Row className="col-10 text-left flex-wrap flex-column">
          <div className="">
            <i
              className="fa-solid fs-6 mr-2 fa-file-circle-check"
              style={{ color: "#eca9b4" }}
            ></i>
            <span className="titleTask">
              {item?.title && item?.title != "" ? item.title : "-"}
            </span>
          </div>
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
        </Row>
        <Row className="col-1 h-100 text-center justify-content-center justify-items-center align-content-around">
          {item?.isImportant == true ? (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isImportant: !item.isImportant,
                });
              }}
              className="col-12 fa-solid cursor-pointer text-warning fs-6 fa-star"
            ></i>
          ) : (
            <i
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(item._id, {
                  isImportant: !item.isImportant,
                });
              }}
              className="col-12 fa-regular cursor-pointer fs-6 fa-star"
            ></i>
          )}

          <i
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(item._id);
            }}
            className="col-12 cursor-pointer fa fs-6 text-danger fa-trash"
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
