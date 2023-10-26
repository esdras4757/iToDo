'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import { getImportantByIdUser, getTaskById } from '../utils/services/services'
import Task from '../Components/tasksComponents/Task'

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
  priority:string
}

const Page = () => {
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

  useEffect(() => {
    if (sessionStorage.getItem('user')) {
      getAllTaskImportantByUser()
    }
  }, [])

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

  const getAllTaskImportantByUser = async () => {
    setErrorAllTask(false)
    setAllTaskData(null)
    setLoaderAllTask(true)
    const id = sessionStorage.getItem('user')
    try {
      const response = await getImportantByIdUser(id)
      console.log(response.data)
      setAllTaskData(response.data)
    } catch (error: any) {
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
          <Row className="align-content-center mb-3" style={{ width: '93%' }}>
            <div className="col-3"></div>
            <h1 className="col-6 text-center flex align-items-center justify-content-center title bold">
            <i className="fas fa-star fs-4 text-warning mr-3" /> Importantes
            </h1>
            <Row className="col-3 p-0 cursor-pointer justify-end text-center align-content-center align-item-center">
              <i
                onClick={() => setVisible(true)}
                className="fas fa-plus addButton"
              />
            </Row>
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
            <div className="col-12 mt-5">
              <NoDataPlaceholder />
            </div>
                  )
                : (
                    allTaskData &&
            allTaskData.length > 0 && (
              <div
                className="w-100 flex-column flex align-items-center"
                style={{
                  height: 'calc(100vh - 330px)',
                  overflowX: 'hidden',
                  overflowY: 'auto'
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
                    getAllTaskDataFn={getAllTaskImportantByUser}
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
          { isImportant: true }
        }
      />

    </>
  )
}

export default Page
