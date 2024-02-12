import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Avatar, LinearProgress, TextField } from '@mui/material'
import { isEmpty, isNil } from 'lodash'
import axios from 'axios'
import openNotification from '../utils/notify'
import { Drawer, Popover, Spin } from 'antd'
import PageTask from '../task/page'
import PageNote from '../note/page'
import { addNote, deleteTaskById, getAllByIdUser, getTaskById, postGetAllByName, postSendFnResponse, postSendMessage, updateTaskById, updateTaskStatusById } from '../utils/services/services'
import { ContentState, convertToRaw } from 'draft-js'
import dayjs from 'dayjs'
import styled from 'styled-components'

type CurrentComponentType = ReactElement;
interface propsInterface {
    setCurrentComponent: React.Dispatch<
        React.SetStateAction<CurrentComponentType | null>
    >;
    currentComponent?: CurrentComponentType | null;
    setLabelCurrentComponent: (value: string) => void;
    labelCurrentComponent: string
}

interface Data {
    type: string;
    _id: string;
    userId: string;
    title: string;
    reminder: string;
    description: string;
}

const storedMessages = typeof window !== 'undefined' ? window.sessionStorage?.getItem('messages') : null;
const parsedMessages = storedMessages !== null && typeof storedMessages === 'string' ? JSON.parse(storedMessages) : [];

interface messInterface {
    idMessage: string,
    isOwner: boolean,
    content: string,
    sendAt: string
    type?:string
}

type messagesInterface = messInterface[] | null

interface allobjectsIInterface { id: string, title: string }

const AREmojiHello = '../images/AREmojiHello.png'

const APIKEY = process.env.NEXT_PUBLIC_CHATGPT_KEY

const ChatBot = (props: propsInterface) => {
  const { setCurrentComponent, setLabelCurrentComponent, currentComponent } = props
  const [response, setResponse] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [updateTask, setUpdateTask] = useState(false)
  const [onlyNames, setOnlyNames] = useState([])
  const [names, setNames] = useState([])
  const [chatting, setChatting] = useState<boolean>(false)
  const [messages, setMessages] = useState<messagesInterface>(parsedMessages);

  const popoverRef = useRef(null);
  const scrollToBottom = () => {
    const scrollElement = document.querySelector('.ant-popover-inner')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  };
  useEffect(() => {
    const isTargetInsidePopover = (target: any) => {
      return target.closest('.popover-IA') !== null;
    };

    const handleClickOutside = (event: Event) => {
      // Si el clic fue fuera del popover y el chatbot está abierto, cierra el popover.
      if (!isTargetInsidePopover(event.target) && chatting) {
        setChatting(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [chatting]);

  const content = (
        <div className='p-4'>
            <i onClick={e => {
              setChatting(!chatting)
            }} style={{ top: '0%', right: '0%', fontSize: 22, cursor: 'pointer' }} className='text-white m-auto fas fa-xmark ursor-pointer absolute p-3'></i>
            <Avatar
                className="bg-main p-0 m-auto"
                alt="Remy Sharp"
                src={AREmojiHello}
                style={{ boxShadow: '0px 0px 10px  rgb(76, 151, 205)' }}
                sx={{ width: 55, height: 55 }}
            />
            <p className='my-2' style={{ color: 'white' }}>¿Como puedo ayudarte hoy?</p>

            <div className='col mt-3' style={{ rowGap: 15, display: 'flex', flexDirection: 'column' }}>
                <div onClick={e => {
                  setInputValue('Agrega una tarea con el nombre Finalizar presentacion')
                }} className='m-auto cursor-pointer hover text-left px-2 py-1' style={{ fontSize: 11, color: 'gray', width: '100%', border: '0.7px dashed #8b8b8b', borderRadius: 10 }}>
                    <b style={{ fontSize: 12, color: 'white' }}>Agrega una tarea</b> <br />
                    Con ayuda de la IA se pueden agregar tareas, notas y recordatorios de manera mas efectiva
                </div>
                <div onClick={e => {
                  setInputValue('Cambia el estado de la tarea Junta de desarrollo a completada')
                }} className='m-auto cursor-pointer hover text-left px-2 py-1' style={{ fontSize: 11, color: 'gray', width: '100%', border: '0.7px dashed #8b8b8b', borderRadius: 10 }}>
                    <b style={{ fontSize: 12, color: 'white' }}>Cambia el estado de la tarea Junta de desarrollo a completada</b> <br />
                    La IA se pueden actualizar y eliminar tareas, recordatorios y notas dentro de el sistema.
                </div>
                <div onClick={e => {
                  setInputValue('Dame informacion sobre la tarea Finalizar presentacion')
                }} className='m-auto cursor-pointer hover text-left px-2 py-1 onda-btn' style={{ fontSize: 11, color: 'gray', width: '100%', border: '0.7px dashed #8b8b8b', borderRadius: 10 }}>
                    <b style={{ fontSize: 12, color: 'white' }}>Dame informacion sobre la tarea Actualizacion de proyecto</b> <br />
                    Tambien puede obtener informacion especifica de cualquier nota tarea o recordatorio dentro del sistema.
                </div>

                <div onClick={e => {
                  setInputValue('Crea una lista nueva con el nombre Trabajo')
                }} className='m-auto cursor-pointer hover text-left px-2 py-1 onda-btn' style={{ fontSize: 11, color: 'gray', width: '100%', border: '0.7px dashed #8b8b8b', borderRadius: 10 }}>
                    <b style={{ fontSize: 12, color: 'white' }}>Crea una lista nueva con el nombre Trabajo</b> <br />
                    La IA puede crear listas de forma mas eficiente
                </div>

            </div>
        </div>
  );
  const messagesContent = (
        <div className='d-flex' style={{ flexDirection: 'column' }}>
            {messages?.map(message => {
              return <Message style={{ alignSelf: message.isOwner == true ? 'end' : 'start', backgroundColor: message.isOwner == true ? '#747272' : message.type == 'error' ? '#891515' : '#186b85' }} key={message.idMessage}>
                    {message.content}
                </Message>
            })}
        </div>
  )

  function crateStateFromResponse (text: string) {
    const contentState = ContentState.createFromText(text);
    const rawContent = convertToRaw(contentState);
    const contentString = JSON.stringify(rawContent);
    const plainText = contentState.getPlainText();
    const trimmedText = plainText.trim();
    return contentString
  }

  const addTaskFn = async (dataFromCGPT: any) => {
    setIsLoading(true)
    const userId = sessionStorage.getItem('user') ?? ''
    const data = JSON.parse(dataFromCGPT)
    console.log(dataFromCGPT)
    if (data?.title && data?.title != '' && userId && userId != '') {
      console.log(data)
      const dataToApi = {
        ...data,
        ...{
          userId
        }
      }
      axios
        .post('https://todoserver-8410.onrender.com/api/task/add',
          dataToApi, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        .then(async (res) => {
          setCurrentComponent(
                        <PageTask
                            update={updateTask}
                        />)
          setLabelCurrentComponent('PageTask')
          setUpdateTask(!updateTask)
          return 'agregada correctamente'
        })
        .catch((error) => {
          //   setLoading(false)
          addMessage(`!Ups algo salio mal, intentalo de nuevo`, false, 'error')
          openNotification(
            'error',
            error.message || 'ah ocurrido un error intentalo de nuevo'
          )
        }).finally(() => {
          setIsLoading(false)
        })
    } else {
      if (data.title == '' || !(data.isRemainder == true && data.reminder)) {
        // setIsMessageError(true)
        // setLoading(false)
      }
    }
  }

  const KeysList = (data: Data) => {
    const keysToExclude: Array<keyof Data> = ["userId", "_id"];
    const filteredKeys = Object.keys(data).filter(key => !keysToExclude.includes(key as keyof Data));

    return (
            <ul>
                {filteredKeys.map(key => (
                  key ?? <li key={key}>{key}: {data[key]}</li>
                ))}
            </ul>
    );
  };

  useEffect(() => {
    if (messages && messages.length > 50) {
      setMessages((prevMessages) => {
        const newMessages = prevMessages ? [...prevMessages] : null;
        newMessages?.shift();
        sessionStorage.setItem('messages', JSON.stringify(newMessages))
        return newMessages;
      });
    }
    sessionStorage.setItem('messages', JSON.stringify(messages))
    if (isEmpty(messages) == false) {
      scrollToBottom();
    }
  }, [messages])

  const addMessage = (content: string, isOwner: boolean, type?:string) => {
    setMessages(prev => {
      if (!prev) {
        return prev
      }
      return [...prev, { content, type, isOwner, sendAt: dayjs().format('DD/MM/YYY'), idMessage: Date.now().toString() }]
    })
  }

  const addNoteFn = async (dataFromCGPT: any) => {
    setIsLoading(true)
    const id = sessionStorage.getItem('user')
    const userId = sessionStorage.getItem('user') ?? ''
    const data = JSON.parse(dataFromCGPT)

    const messageFromApi = data.content
    const messageResult = crateStateFromResponse(messageFromApi)
    data.content = messageResult

    try {
      if (data?.title && data?.title != '' && userId && userId != '') {
        const dataToApi = {
          ...data,
          ...{
            userId
          }
        }
        const response = await addNote(id, dataToApi)
        if (response) {
          setCurrentComponent(
                        <PageNote
                        />)
          setLabelCurrentComponent('PageNote')
          setUpdateTask(!updateTask)
          return response.data
        }
      }
    } catch (error: any) {
      openNotification('error', error.message)
      addMessage(`!Ups algo salio mal, intentalo de nuevo`, false, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTaskFn = async (data:any) => {
    const userId = sessionStorage.getItem("user") ?? "";
    setIsLoading(true);
    const dataFromCGPT = JSON.parse(data)
    console.log(dataFromCGPT, 'response chaaat')
    if (dataFromCGPT) {
      console.log(dataFromCGPT, 'si entro')

      const response = await postGetAllByName(userId, { name: dataFromCGPT.oldTitle ?? dataFromCGPT.title })
      if (!response || !response.data) {
        throw new Error()
      }

      const elemento = response.data[0]

      const formData = new FormData();

      formData.append("title", dataFromCGPT.title);
      formData.append("description", dataFromCGPT.description ?? "");
      formData.append("reminder",dataFromCGPT.reminder ?? "")
      formData.append(
        "initAt",
        dataFromCGPT.isAgend
          ? dataFromCGPT.initDate.format("DD/MM/YYYY") +
              " " +
              dataFromCGPT.initHour.format("h:mm")
          : ""
      );
      formData.append(
        "endAt",
        dataFromCGPT.isAgend
          ? dataFromCGPT.endDate.format("DD/MM/YYYY") +
              " " +
              dataFromCGPT.endHour.format("h:mm")
          : ""
      );
      formData.append("priority", dataFromCGPT.priority ?? "");
      formData.append("categoryId", dataFromCGPT.categoryId ?? "");
      formData.append("note", dataFromCGPT.note ?? "");
      formData.append("userId", userId); // Suponiendo que userId es la variable que contiene el ID de usuario

      try {
        const response = await updateTaskById(elemento._id, formData);
        if (response && response.data) {
          setCurrentComponent(
            <PageTask
                update={updateTask}
            />)
          setLabelCurrentComponent('PageTask')
          setUpdateTask(!updateTask)
          return response.data
        }
      } catch (error: any) {
        openNotification(
          "error",
          error.message || "ah ocurrido un error intentalo de nuevo"
        );
      } finally {
        setIsLoading(false)
      }
    }
  };

  const updateStatus = async (dataFromCGPT: any) => {
    const userId = sessionStorage.getItem("user") ?? "";
    const data = JSON.parse(dataFromCGPT)
    setIsLoading(true)
    if (!data) {
      return
    }

    const response = await postGetAllByName(userId, { name: data.title })
    if (!response || !response.data) {
      throw new Error()
    }

    const elemento = response.data[0]

    try {
      const response = await updateTaskStatusById(elemento._id,
        {
          isCompleted: data.isCompleted,
          isImportant: data.isImportant,
          isPending: data.isPending,
          isActive: data.isActive
        })
      if (response && response.data) {
        setCurrentComponent(
          <PageTask
              update={updateTask}
          />)
        setLabelCurrentComponent('PageTask')
        setUpdateTask(!updateTask)
        return response.data
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTaskFn = async (dataFromCGPT: any) => {
    setIsLoading(true)
    const userId = sessionStorage.getItem("user") ?? "";
    const data = JSON.parse(dataFromCGPT)
    setIsLoading(true)
    if (!data) {
      return
    }

    const response = await postGetAllByName(userId, { name: data.title })
    if (!response || !response.data) {
      throw new Error()
    }

    const elemento = response.data[0]
    try {
      const response = await deleteTaskById(elemento._id)
      if (response && response.data) {
        setCurrentComponent(
          <PageTask
              update={updateTask}
          />)
        setLabelCurrentComponent('PageTask')
        setUpdateTask(!updateTask)
        return response.data
      }
    } catch (error: any) {
      openNotification('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getInfoByNameFn = async (dataFromCGPT: any) => {
    const id = sessionStorage.getItem('user')
    const data = JSON.parse(dataFromCGPT)
    if (!data || !id) {
      return
    }
    setIsLoading(true)
    try {
      const response = await postGetAllByName(id, { name: data.name })
      if (response && response.data && isEmpty(response.data) === false) {
        console.log(response.data[0])
        const elemento = response.data[0]
        if (elemento) {
          return elemento
        }
      }
    } catch (error: any) {
      addMessage(`!Ups algo salio mal, intentalo de nuevo`, false, 'error')
      openNotification('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // tslint:disable-next-line: variable-name
  const setFunctonResponse = async <T, >(run_Id: string, thread_id: string, tool_id: string, resFunction: T) => {
    setIsLoading(true)
    const userId = sessionStorage.getItem('user') ?? ''
    const data = {
      userId,
      run_Id,
      thread_id,
      tool_id,
      resFunction
    }
    try {
      const response = await postSendFnResponse(data)

      if (isNil(response) == false && isNil(response.data) === false) {
        const type = response.data.type
        // tslint:disable-next-line: variable-name
        const thrad_id = response.data.thread_id
        // tslint:disable-next-line: variable-name
        const run_id = response.data.id
        if (type == 'function') {
          const functionToCall = response.data.required_action.submit_tool_outputs.tool_calls[0]
          const functionDetails = functionToCall.function
          switch (functionDetails.name) {
            case 'addTask':{
              const res = await addTaskFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, res)
              break; }
            case 'addNote':{
              const resN = await addNoteFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resN)
              break; }
            case 'getInfoByName':{
              const resF = await getInfoByNameFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, JSON.stringify(resF))
              break; }
            default:
              break;
          }
        } else if (type == 'message') {
          sessionStorage.setItem('tread_id', thrad_id)
          const messageContent = response.data.content[0].text.value ?? ''
          addMessage(messageContent, false)
        }
      }
    } catch (error: any) {
      openNotification('error', error.message)
      addMessage(`!Ups algo salio mal, intentalo de nuevo`, false, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const postChatGptFn = async () => {
    const id = sessionStorage.getItem('user')
    if (isNil(inputValue) || isEmpty(inputValue) || inputValue == '' || !id) {
      return
    }
    addMessage(inputValue, true)
    setIsLoading(true)
    setChatting(true)
    const data = {
      inputValue,
      thread: sessionStorage.getItem('tread_id'),
      userId: id
    }
    try {
      setInputValue('')
      const response = await postSendMessage(data)
      if (isNil(response) == false && isNil(response.data) === false) {
        const type = response.data.type
        // tslint:disable-next-line: variable-name
        const thrad_id = response.data.thread_id
        // tslint:disable-next-line: variable-name
        const run_id = response.data.id
        if (type == 'function') {
          const functionToCall = response.data.required_action.submit_tool_outputs.tool_calls[0]
          const functionDetails = functionToCall.function
          switch (functionDetails.name) {
            case 'addTask':{
              const res = await addTaskFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, res)
              break; }
            case 'addNote':{
              const resN = await addNoteFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resN)
              break; }
            case 'getInfoByName':{
              const resF = await getInfoByNameFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resF)
              break; }
            case 'updateTask':{
              const resUT = await updateTaskFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resUT)
              break; }
            case 'changeStatusTask':{
              const resUTS = await updateStatus(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resUTS)
              break; }
            case 'deleteTask':{
              const resTD = await deleteTaskFn(functionDetails.arguments)
              setFunctonResponse(run_id, thrad_id, functionToCall.id, resTD)
              break; }

            default:
              break;
          }
        } else if (type == 'message') {
          sessionStorage.setItem('tread_id', thrad_id)
          const messageContent = response.data.content[0].text.value ?? ''
          addMessage(messageContent, false)
        }
      }
    } catch (error: any) {
      openNotification('error', error.message)
      console.log(error)
      if (error.response.status === 400) {
        sessionStorage.removeItem('tread_id')
      }
      addMessage(`!Ups algo salio mal, intentalo de nuevo`, false, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const firstShow = sessionStorage.getItem('firstShow')
    if (!firstShow) {
      setChatting(true)
      sessionStorage.setItem('firstShow', 'true')
    }
  }, [])

  return (
        <Spin spinning={false}>
            <div className=''>
                <Popover ref={popoverRef} rootClassName='popover-IA' content={messages && messages.length > 0 ? messagesContent : content} open={chatting} trigger="click">
                    <TextField
                        disabled={isLoading}
                        className='relative popover-IA'
                        autoComplete="off"
                        style={{ width: '86%' }}
                        fullWidth
                        value={inputValue}
                        onChange={e => {
                          setInputValue(e.target.value)
                        }}
                        label="Hola.! Soy tu asistente virtual, en que puedo ayudarte?"
                        id="fullWidth"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !isLoading) {
                            postChatGptFn()
                            setChatting(true)
                            return
                          }
                          setDrawer(true)
                        }}
                    />
                    <i onClick={e => {
                      e.stopPropagation()
                      if (!isLoading) {
                        postChatGptFn()
                      }
                    }} style={{ borderRadius: 100, top: '20%', right: '7%', fontSize: 20, height: 35, cursor: !isLoading ? 'pointer' : 'not-allowed' }} className='text-white m-auto popover-IA fas fa-paper-plane ursor-pointer absolute p-2 bg-success'></i>
                    {isLoading && <LinearProgress className='col-3' style={{ position: 'absolute', left: '30%', top: '2px', height: 3 }} />}
                    <i onClick={e => {
                      e.stopPropagation()
                      setMessages([])
                    }} style={{ borderRadius: 100, top: '20%', right: '-7%', fontSize: 20, height: 35, cursor: !isLoading ? 'pointer' : 'not-allowed' }} className='text-white m-auto popover-IA fas fa-broom ursor-pointer absolute p-2 bg-secondary'></i>
                    <i onClick={e => {
                      setChatting(!chatting)
                    }} style={{ borderRadius: 100, top: '20%', right: '0%', fontSize: 20, height: 35, cursor: !isLoading ? 'pointer' : 'not-allowed' }} className={`text-white  m-auto popover-IA fas ${!chatting ? 'fa-eye' : 'fa-eye-slash'} ursor-pointer absolute p-2 bg-primary`}></i>

                </Popover>
            </div>
        </Spin>
  )
}

const Message = styled.div`
word-wrap: break-word !important;
color: white;
    background-color: red;
    font-size: 13px;
    text-align: left;
    margin-bottom: 10px;
    font-family: sans-serif;
    width: fit-content;
    border-radius: 10px;
    padding: 5px 7px;
    max-width: 47%;
`

export default ChatBot
