'use client'
import Calendar from 'react-calendar'
import React, { ReactNode, ReactElement, useEffect, useRef, useState, KeyboardEvent } from 'react'
import { isNil, isEmpty, debounce } from 'lodash'
import Home from '../Home/page'
import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Task from '../Components/tasksComponents/Task'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import { DatePicker, Input, Popover, TimePicker, ColorPicker } from 'antd'
import draftToHtml from 'draftjs-to-html'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import { addEvent, getAllEventsByIdUser, updateEventById } from '../utils/services/services'
import customParseFormat from 'dayjs/plugin/customParseFormat'
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
import 'dayjs/locale/es'; // Importa la localización que instalaste // Configura dayjs para usar el idioma español
import dayjs, { Dayjs } from 'dayjs'
import 'react-calendar/dist/Calendar.css'
import FullCalendar from '@fullcalendar/react'

import { useRouter } from 'next/navigation' // Notar cómo se importa el plugin aquí
import PageTask from '../task/page'
import PageNote from '../note/page'
import moment from 'moment';
import 'moment/locale/es'; // Importa la localización que deseas usar

moment.locale('es'); // Configura moment para usar el idioma español
dayjs.locale('es');

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

dayjs.extend(customParseFormat)
interface status {
  isCompleted: boolean;
  isImportant: boolean;
  isPending: boolean;
  isActive: boolean;
  isInProgress: boolean;
}

interface EventData {
  _id?:string
  id: string;
  title: string;
  initAt: string | null;
  endAt: string | null;
  reminder: string | null;
  type: string;
  description: string;
  color: string;
  note: string | null;
}

const initValues: EventData = {
  id: '',
  title: '',
  initAt: null,
  endAt: null,
  reminder: null,
  type: '',
  description: '',
  color: '#ccc',
  note: ''
}

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
  const [allEventData, setAllEventData] = useState<EventData[] | null>(null)
  const [eventFormat, setEventFormat] = useState<any>(null)

  const [loaderAllEvent, setLoaderAllEvent] = useState(false)
  const [errorAllEvent, setErrorAllEvent] = useState(false)
  const [fastSpin, setFastSpin] = useState(false)
  const [EventSelected, setEventSelected] = useState<null | EventData>(null)
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [stateContentEditorState, setStateContentEditorState] = useState('')
  const [idUser, setIdUser] = useState('')
  const [title, setTitle] = useState<null | string>(null)
  const [values, setValues] = useState(initValues)
  const [editMode, setEditMode] = useState(false)
  const [errors, setErrors] = useState(false)
  const router = useRouter()
  const calendarRef = useRef<any>(null)
  useEffect(() => {
    if (sessionStorage.getItem('user')) {
      getAllEventByUser()
    }
  }, [])

  useEffect(() => {
    if (allEventData && isNil(allEventData) == false) {
      const events = allEventData.map((item: EventData) => {
        return {
          id: item.id,
          title: item.title,
          start:
            isNil(item.initAt) == false && item.initAt != ''
              ? dayjs(item.initAt, 'DD/MM/YYYY HH:mm').toDate()
              : null,
          end:
            isNil(item.endAt) == false && item.endAt != ''
              ? dayjs(item.endAt, 'DD/MM/YYYY HH:mm').toDate()
              : null,
          color: item.color
            ? item.color
            : item.type == 'task'
              ? 'blue'
              : item.type == 'note' && '#8e8f3d',
          description: item.description,
          type: item.type,
          reminder: item.reminder,
          note: item.note
        }
      })

      setEventFormat(events)
    }
  }, [allEventData])

  const getAllEventByUser = async () => {
    setErrorAllEvent(false)
    setAllEventData(null)
    setLoaderAllEvent(true)
    const id = sessionStorage.getItem('user')

    if (id) {
      setIdUser(id)
    }

    try {
      const response = await getAllEventsByIdUser(id)
      if (response.data && response.data.length > 0) {
        setAllEventData(response.data)
      }
    } catch (error: any) {
      setErrorAllEvent(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllEvent(false)
    }
  }

  useEffect(() => {
    console.log(allEventData)
  }, [allEventData])

  const AddEvent = async () => {
    if (
      isNil(values.title) === true ||
      values.title.trim() === '' ||
      isNil(values.initAt) === true ||
      values.initAt === '' ||
      isNil(values.endAt) === true ||
      values.endAt === ''
    ) {
      setErrors(true)
      return
    }
    setErrors(false)
    setFastSpin(true)
    try {
      const data = {
        userId: idUser,
        title: values.title,
        description: values.description,
        initAt: values.initAt,
        endAt: values.endAt,
        color: values.color,
        reminder: values.reminder,
        note: values.note,
        type: 'event'
      }

      const response = await addEvent(data)
      if (isNil(response) === false && isNil(response.data) === false) {
        ShowHidePanel()
        setAllEventData((prev) => {
          if (!prev) {
            return prev
          }
          if (response.data._id) {
            response.data.id = response.data._id
          }
          return [...prev, response.data]
        })
        const calendarApi = calendarRef.current.getApi()
        calendarApi.render()
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    setErrors(false)
    setFastSpin(true)
    try {
      const data = {
        userId: idUser,
        title: values.title,
        description: values.description,
        initAt: null,
        endAt: null,
        color: values.color,
        reminder: values.reminder,
        note: values.note,
        type: 'event'
      }
      const response = await updateEventById(eventId, data)
      if (isNil(response) === false && isNil(response.data) === false) {
        ShowHidePanel()
        setAllEventData((prev) => {
          if (!prev || isEmpty(prev)) {
            return prev
          }
          const newEvent = prev.map((event) => {
            if (event.id === response.data._id) {
              const data = {
                id: response.data._id,
                userId: response.data.userId,
                title: response.data.title,
                description: response.data.description,
                initAt: response.data.initAt,
                endAt: response.data.endAt,
                color: response.data.color,
                reminder: response.data.reminder,
                note: response.data.note,
                type: response.data.type
              }
              event = data
            }
            return event
          })
          return newEvent
        })
        const calendarApi = calendarRef.current.getApi()
        calendarApi.render()
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const updateEvent = async () => {
    if (
      isNil(values.title) === true ||
      values.title.trim() === '' ||
      isNil(values.initAt) === true ||
      values.initAt === '' ||
      isNil(values.endAt) === true ||
      values.endAt === ''
    ) {
      setErrors(true)
      return
    }
    setErrors(false)
    setFastSpin(true)
    try {
      const data = {
        userId: idUser,
        title: values.title,
        description: values.description,
        initAt: values.initAt,
        endAt: values.endAt,
        color: values.color,
        reminder: values.reminder,
        note: values.note,
        _id: values._id,
        type: 'event'
      }

      const response = await updateEventById(values.id, data)
      if (isNil(response) === false && isNil(response.data) === false) {
        ShowHidePanel()
        setAllEventData((prev) => {
          if (!prev || isEmpty(prev)) {
            return prev
          }
          const newEvent = prev.map((event) => {
            if (event.id === response.data._id) {
              const data = {
                id: response.data._id,
                userId: response.data.userId,
                title: response.data.title,
                description: response.data.description,
                initAt: response.data.initAt,
                endAt: response.data.endAt,
                color: response.data.color,
                reminder: response.data.reminder,
                note: response.data.note,
                type: response.data.type
              }
              event = data
            }
            return event
          })
          return newEvent
        })
        const calendarApi = calendarRef.current.getApi()
        calendarApi.render()
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

  const updateValues = <K extends keyof EventData>(
    value: EventData[K],
    name: K
  ) => {
    setValues((prev) => {
      return { ...prev, [name]: value }
    })
  }

  function renderEventContent (eventInfo:any) {
    return (
      <div className="justify-content-center align-content-center align-items-center" >
              {eventInfo.event.title} - <b>{eventInfo.event.extendedProps.type}</b>
          </div>
    )
  }

  return (
    <>
      <div className="row align-content-end align-items-end p-4 w-100 m-auto">
        <FastLoader isLoading={fastSpin} />

        <div className="col-9 relative calendarPanel w-100">
          <button
            onClick={() => {
              ShowHidePanel('remove')
              setValues(initValues)
              setEditMode(false)
            }}
            className="btn btn-primary absolute top-0"
            style={{ left: '43%' }}
          >
            <i className="fa-solid fa-plus pr-2"></i>
            Crear evento
          </button>

          <FullCalendar
            ref={calendarRef}
            height={'calc(100vh - 260px)'}
            plugins={[dayGridPlugin]}
            eventContent={renderEventContent}
            initialView="dayGridMonth"
            buttonText={{ today: 'Hoy' }}
            displayEventTime={false}
            dayMaxEventRows={4}
            locale="es"
            moreLinkContent={() => {
              return 'Ver más'
            }}
            eventClick={(e) => {
              ShowHidePanel('remove')
              setEditMode(true)

              setValues({
                id: e.event.id,
                title: e.event.title,
                initAt: e.event.start
                  ? dayjs(e.event.start).format('DD/MM/YYYY HH:mm')
                  : '',
                endAt: e.event.end
                  ? dayjs(e.event.end).format('DD/MM/YYYY HH:mm')
                  : '',
                reminder: e.event.extendedProps.reminder,
                type: e.event.extendedProps.type,
                description: e.event.extendedProps.description,
                color: e.event.backgroundColor,
                note: e.event.extendedProps.note
              })
            }}
            selectable={true}
            events={eventFormat ?? []}
          />
        </div>
        <div className="col-3 detailPanel d-none">
          <div
            className="bg-mainContainers text-white relative row align-content-start px-2 justify-content-center"
            style={{ height: 'calc(100vh - 260px)', overflow: 'auto' }}
          >
            <div className="col-12 text-center mt-5 fs-5 align-content-start">
              <i className="fa-solid col-auto text-white fa-circle-info pr-2" />
              {editMode ? 'Detalle del evento' : 'Crear nuevo evento'}

              {editMode && (
                <>
                <i
                  title="Abrir en notas/tareas"
                  className="fa-solid fs-5 fa-up-right-from-square position-absolute cursor-pointer right-3 top-4"
                  onClick={() => {
                    // router.replace(`/${values.type}?id=${values.id}`)
                    if (values.type == 'task') {
                      setCurrentComponent(
                        <PageTask
                        />)
                      setLabelCurrentComponent('PageTask')
                    } else if (values.type == 'note') {
                      setCurrentComponent(
                        <PageNote
                        />)
                      setLabelCurrentComponent('PageNote')
                    }
                  }}
                ></i>

                <i
                  title="Eliminar Evento"
                  className="fa-solid fs-5 fa-trash-can text-danger position-absolute cursor-pointer left-3 top-4"
                  onClick={() => deleteEvent(values.id)}
                ></i>
                </>
              )}
            </div>

            <div className="col-12 mt-4 formEvent row gap-4">
              <div className="col-12">
                <label>Nombre*</label> <br />
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
             {values.type !== 'note' && <div className="col-12">
                <label>Descripción</label> <br />
                <input
                  value={values.description}
                  type="text"
                  className="inputAddList col-12"
                  placeholder="Descripción  del evento"
                  onChange={(e) => {
                    updateValues(e.target.value, 'description')
                  }}
                />
              </div>}
              <div className="col-12">
                <label>Inicio*</label> <br />
                <DatePicker
                  className="col-12"
                  value={
                    values.initAt
                      ? dayjs(values.initAt, 'DD/MM/YYYY HH:mm')
                      : null
                  }
                  style={{
                    color: 'white',
                    height: '35px',
                    width: '100%'
                  }}
                  onChange={(e) => {
                    // setEndAt(e);
                    // saveNote(
                    //   noteSelected._id,
                    //   title ?? "",
                    //   stateContentEditorState,
                    //   noteSelected.isImportant,
                    //   dayjs(e, "DD/MM/YYYY HH:mm")
                    // );
                  }}
                  showTime
                  format={'DD/MM/YYYY HH:mm'}
                  onOk={(e) => {
                    updateValues(dayjs(e).format('DD/MM/YYYY HH:mm'), 'initAt')
                  }}
                  placeholder="Ingresa una fecha"
                />
              </div>
              <div className="col-12">
                <label>Final*</label> <br />
                <DatePicker
                  className="col-12"
                  value={
                    values.endAt
                      ? dayjs(values.endAt, 'DD/MM/YYYY HH:mm')
                      : null
                  }
                  style={{
                    color: 'white',
                    height: '35px',
                    width: '100%'
                  }}
                  onChange={(e) => {
                    updateValues(dayjs(e).format('DD/MM/YYYY HH:mm'), 'endAt')
                  }}
                  showTime
                  format={'DD/MM/YYYY HH:mm'}
                  onOk={(e) => {
                  }}
                  placeholder="Ingresa una fecha"
                />
              </div>
              <div className="col-12">
                <label>Recordatorio</label> <br />
                <DatePicker
                  className="col-12"
                  value={
                    values.reminder
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
                  }}
                  placeholder="Ingresa una fecha"
                />
              </div>

              <div className="col-auto m-auto text-center">
                <label>Color</label> <br />
                <ColorPicker
                  className="m-auto"
                  size={'middle'}
                  value={values.color}
                  onChange={(color) => {
                    updateValues(color.toHexString(), 'color')
                  }}
                />
              </div>

              <div className="col-12 mb-3 m-auto row justify-content-between">
                {errors && (
                  <span className=" text-danger mb-2 text-center p-1 m-0 alert alert-danger">
                    *Campos requeridos
                  </span>
                )}
                <button
                  onClick={(e) => {
                    ShowHidePanel()
                  }}
                  className="col-auto btn btn-secondary"
                >
                  <i className={'fa-solid fa-xmark pr-1'} />
                  {editMode ? 'Cerrar' : 'Cancelar'}
                </button>
                <button
                  onClick={(e) => {
                    editMode ? updateEvent() : AddEvent()
                  }}
                  className="col-auto btn btn-primary"
                >
                  <i
                    className={`fa-solid pr-1 ${
                      editMode ? 'fa-save' : 'fa-paper-plane'
                    }`}
                  />
                  {editMode ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
