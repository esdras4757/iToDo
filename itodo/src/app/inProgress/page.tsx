'use client'

import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import { getAllNotesInProgress, getAllTaskInProgress, getPendingByIdUser, getTaskById } from '../utils/services/services'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Task from '../Components/tasksComponents/Task'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import dayjs from 'dayjs'
import { isEmpty, isNil } from 'lodash'
import ErrorPlaceHolder from '../Components/ErrorPlaceHolder'
import { useRouter } from 'next/navigation'
import PageTask from '../task/page'
import PageNote from '../note/page'
import { Tabs } from 'antd'
import { TabsProps } from 'antd/lib'

type CurrentComponentType = ReactElement;
interface propsInterface{
  setCurrentComponent: React.Dispatch<
    React.SetStateAction<CurrentComponentType | null>
  >;
  currentComponent?: CurrentComponentType | null;
  setLabelCurrentComponent:(value:string)=>void;
  labelCurrentComponent:string
}

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

const Page = (props:propsInterface) => {
  const { setCurrentComponent, setLabelCurrentComponent } = props
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

  const [updateTask, setUpdateTask] = useState(false)
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

  useEffect(() => {
    console.log(allTaskData)
  }, [allTaskData])

  const getAllTaskPendingByUser = async () => {
    setErrorAllTask(false)
    setAllTaskData(null)
    setLoaderAllTask(true)
    const id = sessionStorage.getItem('user')
    try {
      const response = await getAllTaskInProgress(id)
      console.log(response.data)
      setAllTaskData(response.data)
    } catch (error: any) {
      setErrorAllTask(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllTask(false)
    }
  }
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <div className='text-white mx-1 p-2'>Tareas En curso</div>,
      children: <div className="listMyDayContainer text-white">
      <Row className="align-content-center align-items-center mb-2" style={{ width: '93%' }}>

        <h1 className="col-6 px-3 text-left fs-4 title bold">Tareas en curso</h1>
        <h1
         onClick={() => {
           setCurrentComponent(
              <PageTask
              />)
           setLabelCurrentComponent('PageTask')
         }}
        className="col-6 px-3 text-right fs-6 title cursor-pointer bold">Todas las tareas <i className="col-auto fas fa-chevron-right fs-6 text-primary"></i></h1>

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
          text="No se han encontrado tareas en curso"
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
              maxHeight: 'calc(25vh)',
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
    </div>,
    },
    {
      key: '2',
      label: <div className='text-white mx-1 p-2'>Notas En curso</div>,
      children: <div className="card-container-progress text-white py-2 align-content-center align-items-center row justify-content-between col-11 m-auto d-flex">
      <h1 className="col-6 px-4 text-left fs-4 title bold">Notas en curso</h1>
      <h1
       onClick={() => {
         setCurrentComponent(
          <PageNote
          />)
         setLabelCurrentComponent('PageNote')
       }}
       className="col-6 px-4 text-right cursor-pointer fs-6 title bold">Todas las Notas <i className="col-auto fas fa-chevron-right fs-6 text-primary"></i></h1>

{isNil(allNoteData) === false &&
isEmpty(allNoteData) === true &&
loaderAllNote === false &&
errorAllNote === false && (
  <div className="w-75 justify-content-center m-auto row align-content-center mb-4">
    <NoDataPlaceholder
      width={80}
      fs={12}
      img={'images/boxEmpty.png'}
      text="No se han encontrado notas en curso"
    />
  </div>
)}

{isNil(allNoteData) === true &&
loaderAllNote === true &&
errorAllNote === false && (
  <div className="w-75 justify-content-center m-auto row align-content-center mt-5">
    <Loader />
  </div>
)}

{isNil(allNoteData) === true &&
loaderAllNote === false &&
errorAllNote === true && (
  <div className="w-75 justify-content-center m-auto row align-content-center mt-5">
    <ErrorPlaceHolder
      width={120}
      fs={13}
      img={'images/sunkenShip.png'}
    />
  </div>
)}

{isNil(allNoteData) === false &&
isEmpty(allNoteData) === false &&
loaderAllNote === false &&
errorAllNote === false && (
  <>
    {/* <div
      className="row m-auto align-items-end justify-content-between mb-3"
      style={{
        fontSize: 13,
        borderBottom: "1px solid #4b4b4b",
        color: "#ddd",
        padding: "10px",
      }}
    >
      <div
        className="col-4 row align-content-center align-items-end"
        style={{ lineHeight: "9px", flexWrap: "nowrap" }}
      >
        {allNoteData ? allNoteData.length : "-"}{" "}
        {allNoteData && allNoteData.length > 1 ? "Notas" : "Nota"}
      </div>
      <i className="fa-solid col-1 col-auto fa-filter"></i>
    </div> */}
  <div className="col-12 row justify-content-left flex-nowrap overflow-auto">
    {allNoteData?.map((note: NoteData) => {
      const TextShort =
          note.content &&
          JSON.parse(note.content)?.blocks[0]?.text.substring(
            0,
            160
          )
      return (
          <div
            key={note._id}
            onClick={() => {
              router.replace(`/note?id=${note._id}`)
            }}
            style={{
              width: '200px',
              height: '240px',
              borderRadius: '10px',
              border: '3px solid #858585'
            }}
            className="cardNote bg-bg-mainContent mt-2 mb-3 p-3 mx-4 cursor-pointer relative"
          >
            <h3>
              {note.title && note.title != ''
                ? note.title
                : 'Sin titulo'}
            </h3>
            <p
              className="m-0"
              style={{ color: '#989898', fontSize: '15px' }}
            >
              {TextShort
                ? TextShort +
                  `${TextShort.length > 159 ? '...' : ''}`
                : 'Sin contenido'}
            </p>
            <p
              className="px-1 absolute bottom-2 left-1"
              style={{ color: '#989898', fontSize: '13px' }}
            >
              {note.createdAt
                ? dayjs(note.createdAt).format('DD [de] MMMM YYYY')
                : '-'}
            </p>

            <p
              className="px-2 absolute text-center bottom-2 flex flex-column m-0 right-1"
              style={{ color: '#989898', fontSize: '14px', lineHeight: 'normal' }}
            >
              {
                <>
                {note.isImportant && <i className="fas text-center fa-star text-secondary2"></i>}<br/>
                {note.reminder && <i className="fas text-center fa-bell text-secondary2"></i>}<br/>
                {note.initAt && <i className="fas text-center fa-calendar text-secondary2"></i>}<br/>

                </>
              }
            </p>

            <p
              className="px-3 absolute bottom-2 right-1"
              style={{ color: '#989898', fontSize: '13px' }}
            ></p>
          </div>
      )
    })}
   </div>
  </>
)}
</div>,
    }
  ];

  return (
    <>
      <FastLoader isLoading={fastSpin} />
      <div>
      <Tabs defaultActiveKey="1" items={items} />

      </div>
      <ModalAddTask
        visible={visible}
        setVisible={setVisible}
        setAllTaskData={setAllTaskData}
      />
    </>
  )
}

export default Page
