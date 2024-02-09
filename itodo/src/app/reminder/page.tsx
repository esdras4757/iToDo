'use client'
import Calendar from 'react-calendar'
import React, { ReactNode, ReactElement, useEffect, useRef, useState } from 'react'
import { isNil, isEmpty, debounce } from 'lodash'
import Home from '../Home/page'

import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Task from '../Components/tasksComponents/Task'
import { updateReminderById, addReminder, getAllRemindersByIdUser } from '../utils/services/services'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import PageTask from '../task/page'
import PageNote from '../note/page'
import {
  Avatar,
  Card,
  DatePicker,
  Input,
  Popover,
  Skeleton,
  TimePicker
  , ColorPicker
} from 'antd'
import draftToHtml from 'draftjs-to-html'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
// import { getAllRemindersByIdUser } from '../utils/services/services'
import 'dayjs/locale/es'
import customParseFormat from 'dayjs/plugin/customParseFormat' // Notar cómo se importa el plugin aquí
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined
} from '@ant-design/icons'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  EditorState,
  convertFromRaw,
  SelectionState,
  RichUtils
  , convertToRaw
} from 'draft-js'

import dynamic from 'next/dynamic'
import ErrorPlaceHolder from '../Components/ErrorPlaceHolder'

import dayjs, { Dayjs } from 'dayjs'
import 'react-calendar/dist/Calendar.css'

import Meta from 'antd/es/card/Meta'
import { useRouter } from 'next/navigation'
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

type CurrentComponentType = ReactElement;

type DashboarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setCurrentComponent: React.Dispatch<
    React.SetStateAction<CurrentComponentType | null>
  >;
  currentComponent?: CurrentComponentType | null;
  setLabelCurrentComponent:(value:string)=>void;
  labelCurrentComponent:string
};

dayjs.extend(customParseFormat)
/* global NodeJS */
const timer: NodeJS.Timeout | null = null
interface status {
  isCompleted: boolean;
  isImportant: boolean;
  isPending: boolean;
  isActive: boolean;
  isInProgress: boolean;
}

interface ReminderData {
  _id: string;
  title: string;
  reminder: string | null;
  type: string;
  description: string;
  userId: string;
}

const initValues: ReminderData = {
  _id: '',
  title: '',
  reminder: null,
  type: '',
  description: '',
  userId: ''
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
dayjs.locale('es')
const Page = (props: DashboarProps) => {
  const {
    isOpen, setIsOpen, currentComponent,
    setCurrentComponent, setLabelCurrentComponent, labelCurrentComponent
  } =
    props;
  const [visible, setVisible] = useState<boolean>(false)
  const [allReminderData, setAllReminderData] = useState<ReminderData[] | null>(
    null
  )
  const [eventFormat, setReminderFormat] = useState<any>(null)

  const [loaderAllReminder, setLoaderAllReminder] = useState(false)
  const [errorAllReminder, setErrorAllReminder] = useState(false)
  const [fastSpin, setFastSpin] = useState(false)
  const [idUser, setIdUser] = useState('')
  const [title, setTitle] = useState<null | string>(null)
  const [values, setValues] = useState(initValues)
  const [editMode, setEditMode] = useState(false)
  const [errors, setErrors] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const calendarRef = useRef<any>(null)
  useEffect(() => {
    if (sessionStorage.getItem('user')) {
      getAllReminderByUser()
    }
  }, [])

  useEffect(() => {
    if (allReminderData && isNil(allReminderData) == false) {
      const events = allReminderData.map((item: ReminderData) => {
        return {
          id: item._id,
          title: item.title,
          description: item.description,
          type: item.type,
          reminder: item.reminder,
          userId: item.userId
        }
      })

      setReminderFormat(events)
    }
  }, [allReminderData])

  const getAllReminderByUser = async () => {
    setErrorAllReminder(false)
    setAllReminderData(null)
    setLoaderAllReminder(true)
    setFastSpin(true)
    const id = sessionStorage.getItem('user')

    if (id) {
      setIdUser(id)
    }

    try {
      const response = await getAllRemindersByIdUser(id)
      if (response.data && response.data.length > 0) {
        setAllReminderData(response.data as ReminderData[])
      }
    } catch (error: any) {
      setErrorAllReminder(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllReminder(false)
      setFastSpin(false)
    }
  }

  const updateReminder = async (date: String, id: string) => {
    if (isNil(date) === true || date === '') {
      setErrors(true)
      return
    }
    setErrors(false)
    setFastSpin(true)
    try {
      console.log(values)
      const data = {
        reminder: date
      }

      const response = await updateReminderById(id, data)
      if (isNil(response) === false && isNil(response.data) === false) {
        ShowHidePanel()
        setAllReminderData((prev) => {
          if (!prev || isEmpty(prev)) {
            return prev
          }
          const newReminder = prev.map((reminder) => {
            if (reminder._id === response.data._id) {
              const data: ReminderData = {
                _id: response.data._id,
                userId: response.data.userId,
                title: response.data.title,
                description: response.data.description,
                reminder: response.data.reminder,
                type: response.data.type
              }
              reminder = data
            }
            return reminder
          })
          return newReminder
        })
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const deleteReminder = async (id: string, type: String) => {
    setErrors(false)
    setFastSpin(true)
    try {
      console.log(values)
      let data
      if (type == 'task') {
        data = {
          reminder: null,
          isReminder: false
        }
      } else {
        data = {
          reminder: null
        }
      }

      const response = await updateReminderById(id, data)
      if (isNil(response) === false && isNil(response.data) === false) {
        ShowHidePanel()
        setAllReminderData((prev) => {
          if (!prev || isEmpty(prev)) {
            return prev
          }
          const newReminder = prev.filter((reminder) => {
            return reminder._id !== response.data._id
          })
          return newReminder
        })
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const ShowHidePanel = (type: 'toggle' | 'add' | 'remove' = 'toggle') => {
    const detailPanel = document.querySelector('.detailPanel')
    const calndarPanel = document.querySelector('.calendarPanel')
    if (detailPanel && calndarPanel && calendarRef?.current) {
      detailPanel.classList[type]('d-none')
      calndarPanel.classList[type]('w-100')
      const calendarApi = calendarRef.current.getApi()
      calendarApi.render()
    }
  }

  const updateValues = <K extends keyof ReminderData>(
    value: ReminderData[K],
    name: K
  ) => {
    setValues((prev) => {
      return { ...prev, [name]: value }
    })
  }

  const addReminderFn = async () => {
    if (
      isNil(values.title) === true ||
      values.title === '' ||
      isNil(values.reminder) ||
      dayjs(values.reminder, 'DD/MM/YYYY HH:mm').isValid() == false
    ) {
      setErrors(true)
      return
    }
    setErrors(false)
    const data = {
      title: values.title,
      description: values.description,
      reminder: values.reminder,
      type: 'reminder',
      userId: idUser
    }

    setFastSpin(true)
    const id = sessionStorage.getItem('user')

    if (id) {
      setIdUser(id)
    }

    try {
      const response = await addReminder(data)
      if (response.data) {
        setAllReminderData((prev) => {
          if (!prev) {
            return prev
          }
          return [...prev, response.data]
        })
        setOpen(false)
        setValues(initValues)
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  useEffect(() => {
    console.log(values)
  }, [values])

  return (
    <>
      <FastLoader isLoading={fastSpin} />
      {isNil(allReminderData) == true &&
        loaderAllReminder == false &&
        errorAllReminder == true && <ErrorPlaceHolder />}

      {isEmpty(allReminderData) == true &&
        loaderAllReminder == false &&
        errorAllReminder == false && (
          <>
            <div className="row align-content-center align-items-center  gap-3 justify-content-left p-5 w-100 m-auto">
              <h1 className="col-12 text-center mb-2 flex align-items-center justify-content-center title bold">
                <i className="fas fa-bell text-warning mr-3" /> Recordatorios
              </h1>
              <div className="row m-auto justify-content-center">
                <Popover
                  id="popNoteAddReminder"
                  open={open}
                  onOpenChange={(e) => {
                    setOpen(e)
                    setErrors(false)
                  }}
                  content={
                    <div className="flex-column mt-2 flex justify-content-center row-gap-3 align-items-center">
                      <div className="col-12 text-white">
                        <label className="text-white">Nombre*</label> <br />
                        <input
                          value={values.title}
                          type="text"
                          className="inputAddList col-12"
                          placeholder="Nombre del evento"
                          onChange={(e) => {
                            updateValues(e.target.value, 'title')
                          }}
                        />
                      </div>
                      <div className="col-12">
                        <label className="text-white">Descripción</label> <br />
                        <input
                          value={values.description}
                          type="text"
                          className="inputAddList col-12"
                          placeholder="Descripción  del evento"
                          onChange={(e) => {
                            updateValues(e.target.value, 'description')
                          }}
                        />
                      </div>
                      <label className="text-white">Fecha y hora*</label>
                      <DatePicker
                        className="col-12"
                        value={
                          dayjs(values.reminder, 'DD/MM/YYYY HH:mm').isValid()
                            ? dayjs(values.reminder, 'DD/MM/YYYY HH:mm')
                            : null
                        }
                        style={{
                          color: 'white',
                          height: '35px',
                          width: '100%'
                        }}
                        onChange={(e) => {
                          updateValues(
                            dayjs(e).format('DD/MM/YYYY HH:mm'),
                            'reminder'
                          )
                        }}
                        showTime
                        format={'DD/MM/YYYY HH:mm'}
                        onOk={(e) => {
                          console.log(e)
                        }}
                        placeholder="Ingresa una fecha"
                      />
                      {errors && (
                        <span className="alert m-0 alert-danger p-1">
                          Campos requeridos*
                        </span>
                      )}
                      <div className="row justify-content-between w-100 align-content-center">
                        <button
                          className="col-auto btn btn-danger"
                          onClick={() => {
                            setOpen(false)
                          }}
                        >
                          <i className="fa-solid fa-xmark pr-1"></i>Cerrar
                        </button>
                        <button
                          className="col-auto btn btn-primary"
                          onClick={() => {
                            addReminderFn()
                          }}
                        >
                          <i className="fa-solid fa-floppy-disk pr-1"></i>
                          Guardar
                        </button>
                      </div>
                    </div>
                  }
                  trigger={'click'}
                  title={
                    <span style={{ color: 'white', fontSize: 17 }}>
                      Agregar recordatorio
                    </span>
                  }
                >
                  <button
                    onClick={() => {
                      // ShowHidePanel("remove");
                      // setValues(initValues);
                      // setEditMode(false);
                    }}
                    className="btn col-auto  btn-primary"
                  >
                    <i className="fa-solid fa-plus pr-2"></i>
                    Recordatorio
                  </button>
                </Popover>
              </div>
            </div>
            <NoDataPlaceholder />
          </>
      )}

      {isNil(allReminderData) == false &&
        isEmpty(allReminderData) == false &&
        loaderAllReminder == false &&
        errorAllReminder == false && (
          <>
            <div className="row align-content-center align-items-center  gap-3 justify-content-left p-5 w-100 m-auto">
              <h1 className="col-12 text-center mb-2 flex align-items-center justify-content-center title bold">
                <i className="fas fa-bell text-warning mr-3" /> Recordatorios
              </h1>
              <div className="row m-auto justify-content-center">
                <Popover
                  id="popNoteAddReminder"
                  open={open}
                  onOpenChange={(e) => {
                    setOpen(e)
                    setErrors(false)
                  }}
                  content={
                    <div className="flex-column mt-2 flex justify-content-center row-gap-3 align-items-center">
                      <div className="col-12 text-white">
                        <label className="text-white">Nombre*</label> <br />
                        <input
                          value={values.title}
                          type="text"
                          className="inputAddList col-12"
                          placeholder="Nombre del evento"
                          onChange={(e) => {
                            updateValues(e.target.value, 'title')
                          }}
                        />
                      </div>
                      <div className="col-12">
                        <label className="text-white">Descripción</label> <br />
                        <input
                          value={values.description}
                          type="text"
                          className="inputAddList col-12"
                          placeholder="Descripción  del evento"
                          onChange={(e) => {
                            updateValues(e.target.value, 'description')
                          }}
                        />
                      </div>
                      <label className="text-white">Fecha y hora*</label>
                      <DatePicker
                        className="col-12"
                        value={
                          dayjs(values.reminder, 'DD/MM/YYYY HH:mm').isValid()
                            ? dayjs(values.reminder, 'DD/MM/YYYY HH:mm')
                            : null
                        }
                        style={{
                          color: 'white',
                          height: '35px',
                          width: '100%'
                        }}
                        onChange={(e) => {
                          updateValues(
                            dayjs(e).format('DD/MM/YYYY HH:mm'),
                            'reminder'
                          )
                        }}
                        showTime
                        format={'DD/MM/YYYY HH:mm'}
                        onOk={(e) => {
                          console.log(e)
                        }}
                        placeholder="Ingresa una fecha"
                      />
                      {errors && (
                        <span className="alert m-0 alert-danger p-1">
                          Campos requeridos*
                        </span>
                      )}
                      <div className="row justify-content-between w-100 align-content-center">
                        <button
                          className="col-auto btn btn-danger"
                          onClick={() => {
                            setOpen(false)
                          }}
                        >
                          <i className="fa-solid fa-xmark pr-1"></i>Cerrar
                        </button>
                        <button
                          className="col-auto btn btn-primary"
                          onClick={() => {
                            addReminderFn()
                          }}
                        >
                          <i className="fa-solid fa-floppy-disk pr-1"></i>
                          Guardar
                        </button>
                      </div>
                    </div>
                  }
                  trigger={'click'}
                  title={
                    <span style={{ color: 'white', fontSize: 17 }}>
                      Agregar recordatorio
                    </span>
                  }
                >
                  <button
                    onClick={() => {
                      // ShowHidePanel("remove");
                      // setValues(initValues);
                      // setEditMode(false);
                    }}
                    className="btn col-auto  btn-primary"
                  >
                    <i className="fa-solid fa-plus pr-2"></i>
                    Recordatorio
                  </button>
                </Popover>
              </div>
              <div
                className="row gap-2 justify-content-around"
                style={{ height: 'calc(100vh - 385px', overflow: 'auto' }}
              >
                {allReminderData?.map((reminder) => {
                  return (
                    <Card
                      key={reminder._id}
                      style={{ width: 340, marginTop: 16 }}
                      actions={[
                        <Popover
                        key={'pop'}
                          id="popNoteEdit"
                          content={
                            <div className="flex-column flex justify-content-center row-gap-3 align-items-center">
                              <DatePicker
                                className="col-12"
                                value={
                                  dayjs(
                                    reminder.reminder,
                                    'DD/MM/YYYY HH:mm'
                                  ).isValid()
                                    ? dayjs(
                                      reminder.reminder,
                                      'DD/MM/YYYY HH:mm'
                                    )
                                    : null
                                }
                                style={{
                                  color: 'white',
                                  height: '35px',
                                  width: '100%'
                                }}
                                onChange={(e) => {
                                  // setReminder(e);
                                  // console.log(e);
                                  // saveNote(
                                  //   noteSelected._id,
                                  //   title ?? "",
                                  //   stateContentEditorState,
                                  //   noteSelected.isImportant,
                                  //   dayjs(e, "DD/MM/YYYY HH:mm")
                                  // );
                                  console.log(reminder)
                                  updateReminder(
                                    dayjs(e).format('DD/MM/YYYY HH:mm'),
                                    reminder._id
                                  )
                                }}
                                showTime
                                format={'DD/MM/YYYY HH:mm'}
                                onOk={(e) => {
                                  console.log(e)
                                }}
                                placeholder="Ingresa una fecha"
                              />
                            </div>
                          }
                          trigger={'click'}
                          title={
                            <span style={{ color: 'white', fontSize: 17 }}>
                              Editar recordatorio
                            </span>
                          }
                        >
                          <i className="fa-solid col-12 fa-pen text-primary" />
                        </Popover>,
                        reminder.type === 'reminder'
                          ? (
                          <div className="text-white cursor-auto w-100">-</div>
                            )
                          : (
                          <i
                            title="Abrir en notas/tareas"
                            className="fa-solid text-success fa-up-right-from-square"
                            onClick={() => {
                              if (reminder.type != 'event') {
                                if (reminder.type == 'task') {
                                  setCurrentComponent(
                                    <PageTask
                                    />)
                                  setLabelCurrentComponent('PageTask')
                                } else if (reminder.type == 'note') {
                                  setCurrentComponent(
                                    <PageNote
                                    />)
                                  setLabelCurrentComponent('PageNote')
                                }
                              } else {
                                router.replace(
                                  '/diary'
                                )
                              }
                            }}
                          />
                            ),
                        <i
                        key={reminder._id}
                          onClick={(e) => {
                            deleteReminder(reminder._id, reminder.type)
                          }}
                          className="fa-solid fa-trash text-danger"
                        />
                      ]}
                    >
                      <Skeleton loading={loaderAllReminder} avatar active>
                        <Meta
                          avatar={
                            <Avatar
                              className="justify-content-center row align-content-center align-items-center m-1"
                              style={{ background: '#2f2f2f' }}
                              src={
                                reminder.type === 'reminder'
                                  ? (
                                  <i className="fas fa-bell fs-2 text-warning" />
                                    )
                                  : reminder.type === 'note'
                                    ? (
                                  <i className="fas fa-sticky-note fs-2 text-warning" />
                                      )
                                    : reminder.type === 'task'
                                      ? (
                                  <i className="fas fa-list-check fs-2 text-primary" />
                                        )
                                      : (
                                          reminder.type === 'event' && (
                                    <i className="fas fa-calendar fs-2 text-primary" />
                                          )
                                        )
                              }
                            />
                          }
                          title={<div className='w-100 overflow-text' title={reminder.title}>{reminder.title}</div>}
                          description={
                            <>
                              <div className='overflow-text' title={reminder.description} style={{ fontSize: 14, maxHeight: 20, overflowY: 'hidden' }}>
                                {reminder.description &&
                                reminder.description != ''
                                  ? reminder.type == 'note'
                                    ? JSON.parse(
                                      reminder.description
                                    )?.blocks[0]?.text.substring(0, 20) +
                                      '...'
                                    : reminder.description
                                  : 'Sin descripçión'}
                              </div>
                              <div style={{ fontSize: 12, color: '#9a9a9a', textOverflow: 'ellipsis' }}>
                                {reminder.reminder && reminder.reminder != ''
                                  ? reminder.reminder
                                  : '-'}
                              </div>
                            </>
                          }
                        />
                      </Skeleton>
                    </Card>
                  )
                })}
              </div>
            </div>
          </>
      )}
    </>
  )
}

export default Page
