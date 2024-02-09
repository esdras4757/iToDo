import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Avatar, TextField } from '@mui/material'
import { isEmpty, isNil } from 'lodash'
import axios from 'axios'
import openNotification from '../utils/notify'
import { Drawer, Popover, Spin } from 'antd'
import PageTask from '../task/page'
import PageNote from '../note/page'
import { addNote, getAllByIdUser, getTaskById } from '../utils/services/services'
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

interface messInterface {
    idMessage: string,
    isOwner: boolean,
    content: string,
    sendAt: string
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
    const [messages, setMessages] = useState<messagesInterface>([])
    const popoverRef = useRef(null);

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
                return <Message style={{ alignSelf: message.isOwner == true ? 'end' : 'start', backgroundColor: message.isOwner == true ? '#9f9f9f' : '#55BDDE' }} key={message.idMessage}>
                    {message.content}
                </Message>
            })}

        </div>
    )

    function crateStateFromResponse(text: string) {
        const contentState = ContentState.createFromText(text);
        const rawContent = convertToRaw(contentState);
        const contentString = JSON.stringify(rawContent);
        const plainText = contentState.getPlainText();
        const trimmedText = plainText.trim();

        console.log(contentString)
        return contentString
    }

    const addTaskFn = (dataFromCGPT: any) => {
        setIsLoading(true)
        const userId = sessionStorage.getItem('user') ?? ''
        const data = JSON.parse(dataFromCGPT)
        console.log(data)
        console.log(data.title, 'title')
        if (data?.title && data?.title != '' && userId && userId != '') {
            const dataToApi = {
                ...data, ...{
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
                    addMessage(`Eh agregado correctamente la tarea con los siguientes datos: ${dataToApi.toString()}`, false)

                    setCurrentComponent(
                        <PageTask
                            update={updateTask}
                        />)
                    setLabelCurrentComponent('PageTask')
                    setUpdateTask(!updateTask)
                })
                .catch((error) => {
                    //   setLoading(false)
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
    }, [messages])

    const addMessage = (content: string, isOwner: boolean) => {
        setMessages(prev => {
            if (!prev) {
                return prev
            }
            return [...prev, { content, isOwner, sendAt: dayjs().format('DD/MM/YYY'), idMessage: Date.now().toString() }]
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

        console.log(data)
        console.log(data.title, 'title')

        try {
            if (data?.title && data?.title != '' && userId && userId != '') {
                const dataToApi = {
                    ...data, ...{
                        userId
                    }
                }
                const response = await addNote(id, dataToApi)
                if (response) {

                    addMessage(`Eh agregado una nota con los siguientes datos: ${dataToApi.toString()}`, false)
                    setCurrentComponent(
                        <PageNote
                        />)
                    setLabelCurrentComponent('PageNote')
                    setUpdateTask(!updateTask)
                }
            }

        } catch (error: any) {
            openNotification('error', error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const getAllNames = async () => {
        setIsLoading(true)
        const id = sessionStorage.getItem('user')
        if (!id) return
        try {
            const response = await getAllByIdUser(id)
            console.log(response.data)
            if (response && response?.data && isEmpty(response.data) === false) {
                const onlyNames = response.data.map((element: { id: string, title: string }) => {
                    return element.title
                })
                if (onlyNames) {
                    setNames(response.data)
                    setOnlyNames(onlyNames)
                }
            }
            return response.data
        } catch (error: any) {
            openNotification('error', error.message)
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getAllNames()
    }, [currentComponent])

    const getInfoByNameFn = async (dataFromCGPT: any) => {
        setIsLoading(true)
        const data: any = JSON.parse(dataFromCGPT)
        console.log(data)
        console.log(names)
        try {
            if (isNil(names) === false && isEmpty(names) === false) {
                const result: any = names.find((element: any) => element.title === data.name)
                console.log(result);
                if (result) {
                    return result.id;
                }
            }

        } catch (error: any) {
            openNotification('error', error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const postChatGptFn = () => {
        if (isNil(inputValue) || isEmpty(inputValue) || inputValue == '') {
            return
        }
        setIsLoading(true)
        setChatting(true)
        axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                // instructions: "You are a management of task and notes bot. Use the provided functions to answer questions.",
                model: 'gpt-3.5-turbo-0125',
                tool_choice: "auto",
                messages: [{ "role": "user", "content": inputValue + `si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm` }],
                max_tokens: 150,  // Puedes ajustar este parámetro según tus necesidades
                tools: [{
                    "type": "function",
                    "function": {
                        "name": "addTask",
                        "description": "add a new task for the user",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                title: { type: 'string', description: 'titulo de la tarea' },
                                isImportant: { type: 'boolean', description: 'indica si una tarea es importante' },
                                isMyDay: { type: 'boolean', description: 'indica si una tarea corresponde a mi dia' },
                                description: { type: 'string', description: 'indica la descripcion de la tarea' },
                                isRemainder: { type: 'boolean', description: 'indica si la tarea cuenta con un recordatorio' },
                                priority: { type: 'string', enum: ["Alta", "Media", "Baja"], description: 'indica la prioridad de la tarea, por default es baja' },
                                reminder: { type: 'string', description: 'indica la fecha del recordatorio' },
                                isAgend: { type: 'boolean', description: 'indica si se agregara a la agenda' },
                                initDate: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda' },  // Asegúrate de tener moment.js instalado y configurado
                                initHour: { type: 'string', description: 'indica la fecha final para agregarse a la agenda' },
                                endDate: { type: 'string', description: 'indica la hora inicial para agregarse a la agenda' },
                                endHour: { type: 'string', description: 'indica la hora final para agregarse a la agenda' },
                                note: { type: 'string', description: 'indica la nota que llevara la tarea' },
                            },
                            "required": ["title", "priority"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "addNote",
                        "description": "add a new note for the user",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                title: { type: 'string', description: 'titulo de la Nota' },
                                content: { type: "string", description: 'indica el contenido de la nota' },
                                isImportant: { type: 'boolean', description: 'indica si una Nota es importante' },
                                reminder: { type: 'string', description: 'indica la fecha del recordatorio' },
                                initAt: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda' },  // Asegúrate de tener moment.js instalado y configurado
                                endAt: { type: 'string', description: 'indica la fecha final para agregarse a la agenda' }
                            },
                            "required": ["title", "content"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "getInfoByName",
                        "description": "Get information of a task, event or note",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                name: { type: 'string', enum: onlyNames ?? null, description: 'titulo de la nota, evento o tarea' }
                            },
                            "required": ["name"]
                        }
                    }
                },

                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${APIKEY}`,
                },
            }
        ).then(response => {
            if (response?.data?.choices[0]?.message?.tool_calls[0]?.function) {
                console.log(response?.data?.choices[0]?.message?.tool_calls[0]?.function);
                const functionToCall = response?.data?.choices[0]?.message?.tool_calls[0]?.function.name
                if (functionToCall) {
                    switch (functionToCall) {
                        case "addTask":
                            console.log('aaaa')
                            addTaskFn(response?.data?.choices[0]?.message?.tool_calls[0]?.function.arguments)
                            break;
                        case "addNote":
                            console.log('bbb')
                            addNoteFn(response?.data?.choices[0]?.message?.tool_calls[0]?.function.arguments)
                            break;
                        case "getInfoByName":
                            console.log('ccc')
                            getInfoByNameFn(response?.data?.choices[0]?.message?.tool_calls[0]?.function.arguments)
                            break;
                        default:
                            break;
                    }
                }
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
            }).finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        const firstShow = sessionStorage.getItem('firstShow')
        if (firstShow) {
            return
        }
        else {
            setChatting(true)
            sessionStorage.setItem('firstShow', 'true')
        }
    }, [])




    return (
        <Spin spinning={isLoading}>
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
                    }} style={{ borderRadius: 100, top: '20%', right: '0%', fontSize: 20, width: 37, height: 35, cursor: 'pointer' }} className='text-white m-auto popover-IA fas fa-paper-plane ursor-pointer absolute p-2 bg-primary'></i>
                    <i onClick={e => {
                        e.stopPropagation()
                        if (!isLoading) {
                            postChatGptFn()
                        }
                    }} style={{ borderRadius: 100, top: '20%', right: '7%', fontSize: 20, width: 37, height: 35, cursor: 'pointer' }} className='text-white m-auto popover-IA fas fa-broom ursor-pointer absolute p-2 bg-secondary'></i>
                    {chatting == false && <i onClick={e => {
                        setChatting(!chatting)
                    }} style={{ borderRadius: 5, top: '-47%', right: '55%', fontSize: 20, width: 37, cursor: 'pointer' }} className='text-white  m-auto pb-0 pt-1 fas fa-chevron-up ursor-pointer absolute p-2 bg-primary'></i>
                    }
                </Popover>
            </div>
        </Spin>
    )
}

const Message = styled.div`
color: ${({ theme }) => theme.palette.text.primary};
    background-color: red;
    font-size: 14px;
    margin-bottom: 10px;
    width: 55%;
    border-radius: 10px;
    padding: 4px 8px;
`

export default ChatBot
