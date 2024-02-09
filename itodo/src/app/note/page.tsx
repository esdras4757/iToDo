'use client'

import React, { ReactNode, useEffect, useRef, useState, KeyboardEvent } from 'react'
import { isNil, isEmpty, debounce } from 'lodash'
import Home from '../Home/page'
import Loader from '../Components/Loader'
import './styles.css'
import { Col, Row } from 'react-bootstrap'
import ModalAddTask from '../Components/tasksComponents/modalAddTask'
import {
  deleteNoteById,
  getAllNotesByIdUser,
  postSendEmail
  , addNote, updateNoteById
} from '../utils/services/services'
import openNotification from '../utils/notify'
import FastLoader from '../Components/FastLoader'
import Task from '../Components/tasksComponents/Task'
import NoDataPlaceholder from '../Components/NoDataPlaceholder'
import { DatePicker, Input, Popover, TimePicker } from 'antd'
import draftToHtml from 'draftjs-to-html'
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

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)
/* global NodeJS */
let timer: NodeJS.Timeout | null = null
interface NoteData {
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

const Page = () => {
  const [visible, setVisible] = useState<boolean>(false)
  const [allNoteData, setAllNoteData] = useState<NoteData[] | null>(null)
  const [loaderAllNote, setLoaderAllNote] = useState(false)
  const [errorAllNote, setErrorAllNote] = useState(false)
  const [fastSpin, setFastSpin] = useState(false)
  const [editorFocused, setEditorFocused] = React.useState(false)
  const [noteSelected, setNoteSelected] = useState<null | NoteData>(null)
  const [editMode, setEditMode] = useState(true)
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [editorStateRealTime, setEditorStateRealTime] = useState(EditorState.createEmpty())
  const [stateContentEditorState, setStateContentEditorState] = useState('')
  const [idUser, setIdUser] = useState('')
  const [title, setTitle] = useState<null | string>(null)
  const editor = React.useRef<typeof Editor | null>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [shouldFocusEditor, setShouldFocusEditor] = useState(true)
  const [reminder, setReminder] = useState<null | Dayjs>(null)
  const [open, setOpen] = useState(false)
  const [openAddEvent, setOpenAddEvent] = useState(false)
  const [openShare, setOpenShare] = useState(false)
  const [email, setEmail] = useState<null | string>(null)
  const [initAt, setInitAt] = useState<Dayjs | null>(null)
  const [endAt, setEndAt] = useState<Dayjs | null>(null)
  const [errorsAddEvent, setErrorsAddEvent] = useState(false)
  useEffect(() => {
    if (sessionStorage.getItem('user')) {
      getAllNoteByUser()
    }
  }, [])

  useEffect(() => {
    const search = null
    if (search && allNoteData) {
      const noteToShow = allNoteData.find(notes => {
        return notes._id === search
      })
      if (noteToShow) {
        setNoteSelected(noteToShow)
      }
    }
  }, [allNoteData])

  const onChangeEditor = (
    id: string,
    value: EditorState,
    isImportant: boolean,
    reminder: Dayjs
  ) => {
    // console.log(reminder)
    const newContent = value.getCurrentContent().getPlainText()
    const oldContent = editorState.getCurrentContent().getPlainText()
    if (newContent == oldContent) {
      setEditorState(value)
      setEditorStateRealTime(value)
      return
    }
    setEditorState(value)
    setEditorStateRealTime(value)

    if (timer) {
      clearTimeout(timer)
    }
    const newSelection = value.getSelection()
    setSelection(newSelection)

    const contentState = value.getCurrentContent()
    const rawContent = convertToRaw(contentState)
    const contentString = JSON.stringify(rawContent)
    const plainText = contentState.getPlainText()
    const trimmedText = plainText.trim()

    // const newEditorState = EditorState.createWithContent(contentState);

    setStateContentEditorState(contentString)

    timer = setTimeout(() => {
      saveNote(
        id,
        title ?? '',
        trimmedText ? contentString : '',
        isImportant,
        reminder
      )
      timer = null // Restablecer el temporizador
    }, 800)
  }

  const onChangeTitle = (
    id: string,
    titleNote: string,
    isImportant: boolean,
    reminder: Dayjs
  ) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      saveNote(
        id,
        titleNote ?? '',
        stateContentEditorState,
        isImportant,
        reminder
      )
      timer = null // Restablecer el temporizador
    }, 2000)
  }

  const getAllNoteByUser = async () => {
    setErrorAllNote(false)
    setAllNoteData(null)
    setLoaderAllNote(true)
    const id = sessionStorage.getItem('user')

    if (id) {
      setIdUser(id)
    }

    try {
      const response = await getAllNotesByIdUser(id)
      console.log(response.data)
      setAllNoteData(response.data)

      if (response.data && response.data.length > 0) {
        setNoteSelected(response.data[0])
      }
    } catch (error: any) {
      setErrorAllNote(true)
      openNotification('error', error.message)
    } finally {
      setLoaderAllNote(false)
    }
  }

  const saveNote = async (
    id: string,
    title: string,
    stateContentEditorState: string,
    isImportant: boolean,
    reminder: Dayjs
  ) => {
    setFastSpin(true)
    if (!id) {
      return
    }
    // console.log(reminder)
    const data = {
      title,
      content: stateContentEditorState,
      isImportant,
      reminder: dayjs(reminder, 'DD/MM/YYYY HH:mm').isValid()
        ? dayjs(reminder).format('DD/MM/YYYY HH:mm')
        : null,
      initAt: dayjs(initAt, 'DD/MM/YYYY HH:mm').isValid()
        ? dayjs(initAt).format('DD/MM/YYYY HH:mm')
        : null,
      endAt: dayjs(endAt, 'DD/MM/YYYY HH:mm').isValid()
        ? dayjs(endAt).format('DD/MM/YYYY HH:mm')
        : null
    }
    try {
      // Tu lógica para guardar la nota aquí, por ejemplo:
      const response = await updateNoteById(id, data)

      if (response && response.data) {
        setAllNoteData((prev) => {
          if (isNil(prev)) {
            return prev
          }
          const index = prev.findIndex(
            (item) => item._id === response.data._id
          )
          if (index !== -1) {
            prev[index] = response.data
          }
          return [...prev]
        })
        setNoteSelected(response.data)
        setOpen(false)
        setOpenAddEvent(false)
      }
    } catch (error: any) {
      setErrorAllNote(true)
      setAllNoteData(null)
      setNoteSelected(null)
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  } // 1000ms = 1 segundo

  const addNoteFn = async () => {
    setFastSpin(true)
    const id = sessionStorage.getItem('user')
    if (!id) {
      return
    }

    const data = {
      title: null,
      content: null,
      userId: id,
      reminder: null
    }

    try {
      const response = await addNote(id, data)
      if (response && response.data) {
        setAllNoteData((prev) => {
          if (isNil(prev)) {
            return prev
          }
          setNoteSelected(response.data)
          return [response.data, ...prev]
        })
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const addEvent = () => {
    setErrorsAddEvent(false)
    if ((isNil(initAt) == false || isNil(endAt) == false) &&
      !(isNil(initAt) == true && isNil(endAt) == true) &&
      !(isNil(initAt) == false && isNil(endAt) == false)
    ) {
      openNotification('error', '* Campos obligatorios')
      return
    }

    setErrorsAddEvent(false)
    if (noteSelected && noteSelected._id) {
      saveNote(
        noteSelected._id,
        noteSelected.title ?? '',
        stateContentEditorState,
        noteSelected.isImportant,
        dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm')
      )
    }
  }

  const deleteNoteFn = async (id: String) => {
    setFastSpin(true)
    try {
      const response = await deleteNoteById(id)
      if (response && response.data) {
        setAllNoteData((prev) => {
          if (!prev) {
            return prev
          }
          return prev.filter((element) => {
            return element._id !== id
          })
        })
        setNoteSelected(null)
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setFastSpin(false)
    }
  }

  const sendEmail = async () => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (noteSelected) {
      if (!editorState || stateContentEditorState.trim() == '') {
        openNotification('error', 'No se puede compartir una nota vacia')
        return
      }
      if (
        !email ||
        email.trim() == '' ||
        !regex.test(String(email).toLowerCase())
      ) {
        openNotification('error', 'Ingresa una direccion de correo valida')
        return
      }
      const rawContentState = convertToRaw(editorState.getCurrentContent())
      const htmlString = draftToHtml(rawContentState)

      const data = {
        userid: idUser ?? '',
        to: email,
        title: noteSelected.title,
        content: htmlString
      }
      setFastSpin(true)
      try {
        const response = await postSendEmail(data)
        if (response && response.data) {
          openNotification(
            'success',
            `La nota ${title} se compartió con éxito.`
          )
          setOpenShare(false)
        }
      } catch (error: any) {
        openNotification('error', error.message)
      } finally {
        setFastSpin(false)
      }
    }
  }

  useEffect(() => {
    if (noteSelected) {
      console.log(noteSelected)
      setTitle(noteSelected.title)
      setReminder(
        dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm').isValid()
          ? dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm')
          : null
      )
      setInitAt(dayjs(noteSelected.initAt, 'DD/MM/YYYY HH:mm').isValid()
        ? dayjs(noteSelected.initAt, 'DD/MM/YYYY HH:mm')
        : null)
      setEndAt(dayjs(noteSelected.endAt, 'DD/MM/YYYY HH:mm').isValid()
        ? dayjs(noteSelected.endAt, 'DD/MM/YYYY HH:mm')
        : null)
      if (!noteSelected.content || noteSelected.content == '') {
        setEditorState(EditorState.createEmpty())
        setEditorStateRealTime(EditorState.createEmpty())
        return
      }
      try {
        // Parsear el contenido y crear un nuevo EditorState
        const rawContent = JSON.parse(noteSelected.content)
        const contentState = convertFromRaw(rawContent)
        const newEditorState = EditorState.createWithContent(contentState)

        // Forzar la selección al estado anterior para mantener la posición del cursor
        if (selection && shouldFocusEditor) {
          const editorStateWithSelection = EditorState.forceSelection(
            newEditorState,
            selection
          )
          setEditorState(editorStateWithSelection)
          setStateContentEditorState(noteSelected.content)
          return
        }

        // Actualizar el estado del editor
        setEditorState(newEditorState)
        setStateContentEditorState(noteSelected.content)
        setEditorStateRealTime(newEditorState)
        // Actualizar cualquier otro estado si es necesario
      } catch (e) {}
    }
  }, [noteSelected])

  const description =
    ' Falta-- Vacaciones-- incapacidades solo dias, concecutivos---Permisos - permiso normal---sin gose de sueldo añadir nombre delempleado columna de fecha de creacion ultima act- quien lo hizoorden decendente de fecha de creacion mostrar modal de detalleal agregar incidencia eliminar o cancelar pendiende de ap..-pendiente, justificado, rechazado incapacidad'

  return (
    <>
      <div className="row allContainer p-0 w-100 m-auto" style={{ flexWrap: 'nowrap' }}>
        <FastLoader isLoading={fastSpin} />

        <div className="asideNotes p-2 mr-3 cardContainer">
          <div className="w-100 m-auto row justify-content-between align-content-center align-items-center pt-1">
            <div className="fs-5 col-6">
              <i className="fa-solid mr-2 fa-note-sticky"></i>
              Notas
            </div>
            <div className="col-6 fs-5 text-end">
              <i
                onClick={(e) => {
                  setEditorState(EditorState.createEmpty())
                  setEditorStateRealTime(EditorState.createEmpty())
                  setStateContentEditorState('')
                  addNoteFn()
                }}
                className="fa-solid cursor-pointer fa-plus"
              ></i>
            </div>
          </div>

          {isNil(allNoteData) === false &&
            isEmpty(allNoteData) === true &&
            loaderAllNote === false &&
            errorAllNote === false && (
              <div className="w-75 justify-content-center m-auto row align-content-center mt-5">
                <NoDataPlaceholder
                  width={120}
                  fs={13}
                  img={'images/boxEmpty.png'}
                  text="Aun no tienes notas, agrega alguna para comenzar"
                />
              </div>
          )}

          {isNil(allNoteData) === true &&
            loaderAllNote === true &&
            errorAllNote === false && (
              <div className="w-75 justify-content-center row align-content-center mt-5">
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
                <div
                  className="row m-auto align-items-end justify-content-between numberNotes mb-3"
                  style={{
                    fontSize: 13,
                    borderBottom: '1px solid #4b4b4b',
                    color: '#ddd',
                    padding: '10px'
                  }}
                >
                  <div
                    className="col-4 row align-content-center align-items-end"
                    style={{ lineHeight: '9px', flexWrap: 'nowrap' }}
                  >
                    {allNoteData ? allNoteData.length : '-'}{' '}
                    {allNoteData && allNoteData.length > 1 ? 'Notas' : 'Nota'}
                  </div>
                </div>

                <div className="card-container">
                  {allNoteData?.map((note: NoteData) => {
                    let TextShort
                    try {
                      TextShort = note.content &&
                      JSON.parse(note.content) &&
                      JSON.parse(note.content).blocks &&
                      JSON.parse(note.content)?.blocks[0]?.text.substring(
                        0,
                        160
                      )
                    } catch (error) {
                      return ''
                    }

                    return (
                      <div
                        key={note._id}
                        onClick={() => {
                          setNoteSelected(note)
                          setShouldFocusEditor(false)
                        }}
                        className="cardNote p-3 cursor-pointer relative"
                      >
                        <h3>
                          {note.title && note.title != ''
                            ? note.title
                            : 'Sin titulo'}
                        </h3>
                        <p
                          className="mt-2"
                          style={{ color: '#989898', fontSize: '15px' }}
                        >
                          {TextShort
                            ? TextShort +
                              `${TextShort.length > 159 ? '...' : ''}`
                            : 'Sin contenido'}
                        </p>
                        <p
                          className="px-3 absolute bottom-2 left-1"
                          style={{ color: '#989898', fontSize: '13px' }}
                        >
                          {note.createdAt
                            ? dayjs(note.createdAt).format('DD [de] MMMM YYYY')
                            : '-'}
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
        </div>

        <div className="asideNotes content p-3 relative" style={{ minWidth: '440px', overflow: 'auto' }}>
          {noteSelected ? (
            <>
              <Row
                className="justify-content-between align-content-center contShare align-items-center"
                style={{ color: '#989898' }}
              >
                <i
                  className="fa-solid fa-expand fs-4 pr-3 col-auto"
                  style={{
                    borderRight: '1px solid #4b4b4b',
                    color: '#989898'
                  }}
                  onClick={(e) => {
                    const maxMinWindow =
                      document.querySelector('.cardContainer')
                    if (maxMinWindow) {
                      maxMinWindow.classList.toggle('d-none')
                      document
                        .querySelector('.content')
                        ?.classList.toggle('w-100')
                    }
                  }}
                ></i>
                <div className="col-4"
                style={{ fontSize: 14 }}
                >
                  Fecha de creación:{' '}
                  {dayjs(noteSelected.createdAt).format('DD/MM/YYYY - HH:mm')}
                </div>
                <div className="col-4"
                style={{ fontSize: 14 }}
                >
                  Actualización:{' '}
                  {dayjs(noteSelected.updatedAt).format('DD/MM/YYYY - HH:mm')}
                </div>

                <Popover
                  id="popShare"
                  open={openShare}
                  onOpenChange={(e) => setOpenShare(e)}
                  content={
                    <>
                      <div className="flex-column text-white mb-2 flex justify-content-center row-gap-3 align-items-center">
                        Ingresa un Email para compartir la nota
                      </div>
                      <Input
                        value={email ?? ''}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="inputAddList text-white"
                        placeholder="Ingresa un Email"
                      />
                      <div className="row m-auto w-100 mt-3 justify-content-between">
                        <button
                          onClick={(e) => setOpenShare(false)}
                          className="col-auto btn btn-danger py-1 px-2 "
                          style={{ fontSize: 13 }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => sendEmail()}
                          className="col-auto btn btn-success py-1 px-2 "
                          style={{ fontSize: 13 }}
                        >
                          Enviar
                        </button>
                      </div>
                    </>
                  }
                  trigger={'click'}
                  title={
                    <span style={{ color: 'white', fontSize: 17 }}>
                      Compartir
                    </span>
                  }
                >
                  <button
                    className="col-auto btn shareButton py-1 px-2 mr-3"
                    style={{ fontSize: 14 }}
                  >
                    Compartir
                  </button>
                </Popover>

                <div className="col-12 mt-3">
                  <Editor
                    editorState={editorStateRealTime}
                    toolbarClassName={
                      editorFocused
                        ? 'toolbarClassName'
                        : 'toolbarClassName toolbarHidden'
                    }
                    wrapperClassName="wrapperClassName"
                    editorClassName="editorClassName"
                    onEditorStateChange={(e) => {
                      if (editorFocused) {
                        onChangeEditor(
                          noteSelected._id,
                          e,
                          noteSelected.isImportant,
                          dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm')
                        )
                      }
                    }}
                    onFocus={() => {
                      setEditorFocused(true)
                      setShouldFocusEditor(true)
                    }}
                    onBlur={() => {
                      setEditorFocused(false)
                      setShouldFocusEditor(false)
                    }}
                    placeholder="Ingresa el contenido de la nota"
                  />
                  <input
                    type="text"
                    className="inputTitle"
                    title="title"
                    value={title ?? ''}
                    placeholder="Ingresa un titulo"
                    onChange={(e) => {
                      setTitle(e.target.value)
                      onChangeTitle(
                        noteSelected._id,
                        e.target.value.trim(),
                        noteSelected.isImportant,
                        dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm')
                      )
                    }}
                  />

                  <div className="row footerNote justify-content-between align-content-center align-items-center mt-3">
                    <div className="col-3 px-2 popNote">
                      <Popover
                        id="popNote"
                        open={open}
                        onOpenChange={(e) => setOpen(e)}
                        content={
                          <div className="flex-column flex justify-content-center row-gap-3 align-items-center">
                            <DatePicker
                              className="col-12"
                              value={reminder}
                              style={{
                                color: 'white',
                                height: '35px',
                                width: '100%'
                              }}
                              onChange={(e) => {
                                setReminder(e)
                                console.log(e)
                                saveNote(
                                  noteSelected._id,
                                  title ?? '',
                                  stateContentEditorState,
                                  noteSelected.isImportant,
                                  dayjs(e, 'DD/MM/YYYY HH:mm')
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
                            Agregar recordatorio
                          </span>
                        }
                      >
                        <i
                          className={`col-auto text-center ${
                            isNil(noteSelected.reminder) == false &&
                            noteSelected.reminder !== ''
                              ? 'fa-solid'
                              : 'fa-regular'
                          } pr fs-5 cursor-pointer fa-bell pr-1 text-primary`}
                        />
                        {isNil(noteSelected.reminder) === false &&
                          noteSelected.reminder !== '' && (
                            <span className="text-secondary">
                              {noteSelected.reminder}
                            </span>
                        )}
                      </Popover>
                    </div>
                    <i
                      onClick={(e) => {
                        console.log(noteSelected.reminder)
                        saveNote(
                          noteSelected._id,
                          title ?? '',
                          stateContentEditorState,
                          !noteSelected.isImportant,
                          dayjs(noteSelected.reminder, 'DD/MM/YYYY HH:mm')
                        )
                      }}
                      className={`col-3 text-center ${
                        isNil(noteSelected.isImportant) == false &&
                        noteSelected.isImportant === true
                          ? 'fa-solid'
                          : 'fa-regular'
                      } px-2 fs-5 cursor-pointer fa-star text-warning`}
                    />

                    <div className="col-3 text-end  px-2">
                      <Popover
                        id="popNoteEvent"
                        open={openAddEvent}
                        onOpenChange={(e) => {
                          setOpenAddEvent(e)
                          setErrorsAddEvent(false)
                        }}
                        content={
                          <div className="flex-column text-white addEventNote flex justify-content-between row-gap-1 align-items-center">
                            Inicio*:
                            <DatePicker
                              className="col-12"
                              value={initAt
                              }
                              style={{
                                color: 'white',
                                height: '35px',
                                width: '100%'
                              }}
                              onChange={(e) => {
                                setInitAt(e)
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
                                console.log(e)
                              }}
                              placeholder="Ingresa una fecha"
                            />
                            Final*:
                            <DatePicker
                              className="col-12"
                              value={endAt
                              }
                              style={{
                                color: 'white',
                                height: '35px',
                                width: '100%'
                              }}
                              onChange={(e) => {
                                setEndAt(e)
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
                                console.log(e)
                              }}
                              placeholder="Ingresa una fecha"
                            />
                            <div className="row justify-content-between w-100 mt-3 align-content-center">
                              <button
                                className="col-auto btn btn-danger"
                                onClick={() => {
                                  setOpenAddEvent(false)
                                }}
                              >
                                <i className="fa-solid fa-xmark pr-1"></i>Cerrar
                              </button>
                              <button
                                className="col-auto btn btn-primary"
                                onClick={() => {
                                  // saveNote(
                                  //   noteSelected._id,
                                  //   title ?? "",
                                  //   stateContentEditorState,
                                  //   noteSelected.isImportant,
                                  //   dayjs(initAt,"DD/MM/YYYY HH:mm"),
                                  // )
                                  addEvent()
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
                            Agregar evento
                          </span>
                        }
                      >
                        <i
                          className={`col-auto text-center ${
                            isNil(noteSelected.initAt) == false &&
                            noteSelected.reminder !== ''
                              ? 'fa-solid'
                              : 'fa-regular'
                          } pr-1 fs-5 cursor-pointer fa-calendar text-primary`}
                        />
                        {/* {isNil(noteSelected.reminder) === false &&
                          noteSelected.reminder !== "" && (
                            <span className="text-secondary">
                              {noteSelected.reminder}
                            </span>
                          )} */}
                      </Popover>
                    </div>

                    <i
                      onClick={(e) => {
                        deleteNoteFn(noteSelected._id)
                      }}
                      className="col-3 text-right px-2 cursor-pointer fs-5 fa-solid fa-trash text-danger"
                    />
                  </div>
                </div>
              </Row>
            </>
          ) : (
            <div className="row justify-content-center align-items-center h-100">
              <NoDataPlaceholder
                width={120}
                fs={13}
                img={'images/notes.png'}
                title={'Hey'}
                text={
                  'Selecciona una nota de la lista para poder ver su contenido'
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Page
