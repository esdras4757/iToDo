'use client'

import React, { ReactNode, useEffect, useState, ReactElement } from 'react'
import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import { getAllNotesInProgress, getAllTAskMyDayByIdUser, getAllTaskInProgress, getPendingByIdUser, getTaskById } from '../utils/services/services'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Task from '../Components/tasksComponents/Task'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import dayjs from 'dayjs'
import { isEmpty, isNil } from 'lodash'
import ErrorPlaceHolder from '../Components/ErrorPlaceHolder'
import { useRouter } from 'next/navigation'
import PageTask from '../task/page'
interface status {
  isCompleted: boolean;
  isImportant: boolean;
  isPending: boolean;
  isActive: boolean;
  isInProgress: boolean;
}

interface taskDAata {
  _id: string;
  title: string;
  fileURL: string;
  isCompleted?: boolean;
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
  priority:string
}

interface NoteData {
  type:string;
  _id: string;
  title: string;
  content: string;
  userId: string;
  initAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
  isImportant: boolean;
  reminder: string;
}
type CurrentComponentType = ReactElement;
interface propsInterface{
  setCurrentComponent: React.Dispatch<
    React.SetStateAction<CurrentComponentType | null>
  >;
  currentComponent?: CurrentComponentType | null;
  setLabelCurrentComponent:(value:string)=>void;
  labelCurrentComponent:string
}

const Page = (props: propsInterface) => {
  const {
    currentComponent,
    setCurrentComponent, setLabelCurrentComponent, labelCurrentComponent
  } = props;
  const [visible, setVisible] = useState<boolean>(false)
  const [allTaskData, setAllTaskData] = useState<taskDAata[] | null>(null)
  const [loaderAllTask, setLoaderAllTask] = useState(false)
  const [errorAllTask, setErrorAllTask] = useState(false)
  const [fastSpin, setFastSpin] = useState(false)
  const [idOpenTask, setIdOpenTask] = useState('')
  const [isModalEditVisible, setIsModalEditVisible] = useState<boolean>(false)
  const [taskData, setTaskData] = useState<taskDAata | null>(null)
  const [taskLoader, setTaskLoader] = useState(false)
  const [taskError, settaskError] = useState(false)
  const [allNoteData, setAllNoteData] = useState<NoteData[] | null>(null)
  const [loaderAllNote, setLoaderAllNote] = useState(false)
  const [errorAllNote, setErrorAllNote] = useState(false)
  const router = useRouter()

  const getAllNoteByUser = async () => {
    setErrorAllNote(false)
    setAllNoteData(null)
    setLoaderAllNote(true)
    const id = sessionStorage.getItem('user')

    try {
      const response = await getAllNotesInProgress(id)

      if (response.data) {
        // setNoteSelected(response.data[0]);
        setAllNoteData(response.data)
      }
    } catch (error: any) {
      setErrorAllNote(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllNote(false)
    }
  }

  const getTaskByIdFn = async (idTask: string) => {
    setTaskData(null)
    setTaskLoader(true)
    settaskError(false)
    try {
      const response = await getTaskById(idTask)
      console.log(response.data)
      setTaskData(response.data)
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setTaskLoader(false)
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('user')) {
      getAllTaskPendingByUser()
      getAllNoteByUser()
    }
  }, [])

  const getAllTaskPendingByUser = async () => {
    setErrorAllTask(false)
    setAllTaskData(null)
    setLoaderAllTask(true)
    const id = sessionStorage.getItem('user')
    try {
      const response = await getAllTAskMyDayByIdUser(id)
      console.log(response.data)
      setAllTaskData(response.data)
    } catch (error: any) {
      setErrorAllTask(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllTask(false)
    }
  }

  return (
    <>
      <FastLoader isLoading={fastSpin} />
      <div>
        <div className="listMyDayContainer">
          <h2 className="title justify-content-center col-12 align-items-center mb-3 align-content-center row  text-center mt-3 fw-bolder">Mi día <i className="fas col-auto fa-sun text-warning mr-3"></i></h2>
          <Row className="align-content-center mb-4 align-items-center mb-2" style={{ width: '93%' }}>

            <h1 className="col-4 p-0 text-left m-0 fs-4 title bold">Tareas</h1>
            <Row className="col-4 p-0 cursor-pointer  justify-center text-center align-content-center align-item-center">
              <i
                onClick={() => setVisible(true)}
                className="fas fa-plus addButton"
              />
            </Row>
            <h1
             onClick={() => {
               setCurrentComponent(
                <PageTask
                />)
               setLabelCurrentComponent('PageTask')
             }}
            className="col-4 p-0 m-0 text-right fs-6 title cursor-pointer bold">Todas las tareas <i className="col-auto fas fa-chevron-right fs-6 text-primary"></i></h1>

          </Row>

          {errorAllTask
            ? (
            <div>Error al cargar los datos. Por favor, inténtalo de nuevo.</div>
              )
            : loaderAllTask
              ? (
            <div className="col-12">
              <Loader />
            </div>
                )
              : allTaskData && allTaskData.length === 0
                ? (
            <div className="col-12 mb-4">
              <NoDataPlaceholder
              title="Ups"
              text="No se han encontrado tareas"
              width={80}
              />
            </div>
                  )
                : (
                    allTaskData &&
            allTaskData.length > 0 && (
              <div
                className="w-100 flex-column flex align-items-center"
                style={{
                  maxHeight: 'calc(100vh - 376px)',
                  overflowX: 'hidden',
                  overflowY: 'auto',
                  minHeight: '130px'
                }}
              >
                {allTaskData.map((item: any, index) => {
                  return (
                    <Task
                    taskData={taskData}
                    taskLoader={loaderAllTask}
                    taskError={taskError}
                    getTaskByIdFn={getTaskByIdFn}
                     isModalEditVisible={isModalEditVisible}
                     setIsModalEditVisible={setIsModalEditVisible}
                      idOpenTask={idOpenTask}
                      key={index}
                      item={item}
                      getAllTaskDataFn={getAllTaskPendingByUser}
                      setFastSpin={setFastSpin}
                      setAllTaskData={setAllTaskData}
                    />
                  )
                })}
              </div>
                    )
                  )}
        </div>

      </div>
      <ModalAddTask
        visible={visible}
        setVisible={setVisible}
        setAllTaskData={setAllTaskData}
        actionProps={
          {
            isImportant: false,
            isMyDay: true
          }
        }
      />
    </>
  )
}

export default Page
