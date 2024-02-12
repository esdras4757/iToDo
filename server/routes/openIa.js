const router = require("express").Router();
const axios = require('axios')
const CHATGPT_KEY = process.env.CHATGPT_KEY
const User = require("../models/cliente.js");
const nodemailer = require("nodemailer");
const Note = require("../models/notes.js");
const Task = require("../models/task.js");
const Event = require("../models/event.js");
const http = require("http");
const Reminder = require("../models/reminder.js");
const { error } = require("console");
const { Server } = require("socket.io");
const server = http.createServer(router);
const schedule = require("node-schedule");
const moment = require("moment-timezone");
let temporizador;
let segundaSolicitudRecibida = false;
let lastRunId
let lastThreadId
//   asst_Bl4GkbYfEeJa646wmSgxg1aX

//   const createAsisstant = async () => {
//     try {
//       const response = await axios.get(
//         'https://api.openai.com/v1/assistants',
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${APIKEY}`,
//             'OpenAI-Beta': 'assistants=v1',
//           },
//         }
//       );
//       console.log(response.data);
//       return response.data.id;
//     } catch (error) {
//       console.error('Error starting thread:', error);
//       throw error;
//     }
//   };

//   createAsisstant()

const cancelRun=async()=>{
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${lastThreadId}/runs/${lastRunId}/cancel`,{},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        console.log(response.data);
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }
}

function reiniciarTemporizador() {
    // Cancelar el temporizador actual, si existe
    if (temporizador) {
      clearTimeout(temporizador);
    }
  
    // Establecer un nuevo temporizador (por ejemplo, 10 segundos)
    const tiempoLimite = 10000; // 10 segundos
    temporizador = setTimeout(() => {
      // Verificar si la segunda solicitud se ha recibido dentro del tiempo límite
      if (!segundaSolicitudRecibida) {
        // Ejecutar algo cuando se alcance el tiempo límite y la segunda solicitud no se ha recibido
        console.log('Tiempo límite alcanzado y segunda solicitud no recibida. Ejecutar algo aquí.');
        cancelRun()
      }
    }, tiempoLimite);
  }
const startThread = async () => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/threads',
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        console.log(response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }

};

const getMessage = async (thread_id) => {
    if (!thread_id) {
        return
    }
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/threads/${thread_id}/messages`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        if (response.data) {
            // response.data.data.map((element)=>{
            //     console.log(element.content[0])
            // })
            return response.data.data[0]
        }
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }
};

const getAll= async (userId) => {
    console.log('staaaart')
    try {
      const notes = (
        await Note.find({ userId }, [
          "reminder",
          "_id",
          "userId",
          "content",
          "title",
          "reminder",
          "isImportant"
        ])
      )
  
      const tasks = (
        await Task.find({ userId }, [
          "reminder",
          "_id",
          "userId",
          "description",
          "title",
          "isCompleted",
          "isImportant",
          "isPendind",
          "isInProgress",
          "note",
          "priority",
          "myDay"
        ])
      )
  
      const events = (
        await Event.find({ userId }, [
          "reminder",
          "_id",
          "userId",
          "description",
          "title",
          "reminder",
          "note",
          "type"
        ])
      )
  
      const reminders = (
        await Reminder.find({ userId }, [
          "reminder",
          "_id",
          "userId",
          "description",
          "title",
          "type",
        ])
      )
      
      const allReminders = tasks
        .map((task) => ({
          type: "task",
          _id: task._id,
          userId: task.userId,
          title: task.title,
          reminder: task.reminder,
          description: task.description,
        }))
        .concat(
          notes.map((note) => ({
            type: "note",
            _id: note._id,
            userId: note.userId,
            title: note.title,
            reminder: note.reminder,
            description: note.content,
          }))
        )
        .concat(
          reminders.map((reminder) => ({
            type: reminder.type,
            _id: reminder._id,
            title: reminder.title,
            userId: reminder.userId,
            reminder: reminder.reminder,
            description: reminder.description,
          }))
        )
        .concat(
          events.map((event) => ({
            type: 'event',
            _id: event._id,
            title: event.title,
            userId: event.userId,
            reminder: event.reminder,
            description: event.description,
          }))
        );
  
      return allReminders
    } catch (error) {
      throw error
    }
  }

const getIdTitleData = async (userId) => {
    try {
        const tasks = (
            await Task.find({ userId }, [
                "title",
                "_id"
            ])
        )

        const notes = (
            await Note.find({ userId }, [
                "title",
                "_id"
            ])
        )

        const events = (
            await Event.find({ userId }, [
                "title",
                "_id"
            ])
        )

        const allReminders =
            tasks.map((task) => ({
                type: "task",
                id: task._id,
                title: task.title,
            }))
                .concat(
                    notes.map((note) => ({
                        type: "note",
                        id: note._id,
                        title: note.title
                    }))
                )
                .concat(
                    events.map((event) => ({
                        type: "event",
                        id: event._id,
                        title: event.title
                    }))
                );
        return allReminders
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
}

const getOnlyNames = (allDataArr) => {
    if (!allDataArr || allDataArr.length <= 0) {
        return null
    }
    const onlyNames = allDataArr?.map((element) => {
        return element.title
    })
}

const getTools = async (userId) => {
    const onlyNames = getOnlyNames(await getIdTitleData(userId))
    const tools = [{
        type: "function",
        function: {
            name: "addTask",
            description: "agrega una tarea nueva para el usuario, si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la tarea'},
                    isImportant: { type: 'boolean', description: 'indica si una tarea es importante' },
                    myDay: { type: 'string', description: 'indica una fecha para la tarea hoy es '+ moment().format('DD/MM/YYYY') },
                    description: { type: 'string', description: 'indica la descripcion de la tarea' },
                    isRemainder: { type: 'boolean', description: 'indica si la tarea cuenta con un recordatorio' },
                    priority: { type: 'string', enum: ["Alta", "Media", "Baja"], description: 'indica la prioridad de la tarea, por default es baja' },
                    reminder: { type: 'string', description: 'indica una fecha para el recordatorio la tarea.. hoy es '+ moment().format('DD/MM/YYYY') },
                    isAgend: { type: 'boolean', description: 'indica si se agregara a la agenda' },
                    initDate: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda, hoy es '+ moment().format('DD/MM/YYYY') }, // Asegúrate de tener moment.js instalado y configurado
                    initHour: { type: 'string', description: 'indica la fecha final para agregarse a la agenda, hoy es '+ moment().format('DD/MM/YYYY') },
                    endDate: { type: 'string', description: 'indica la hora inicial para agregarse a la agenda, hoy es '+ moment().format('DD/MM/YYYY') },
                    endHour: { type: 'string', description: 'indica la hora final para agregarse a la agenda, hoy es '+ moment().format('DD/MM/YYYY') },
                    note: { type: 'string', description: 'indica la nota que llevara la tarea' },
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "addNote",
            description: "agrega una nota nueva, si algun dato es requerido y no se proporsiona solicitalo y si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la Nota' },
                    content: { type: "string", description: 'indica el contenido de la nota' },
                    isImportant: { type: 'boolean', description: 'indica si una Nota es importante' },
                    reminder: { type: 'string', description: 'indica la fecha del recordatorio' },
                    initAt: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda' }, // Asegúrate de tener moment.js instalado y configurado
                    endAt: { type: 'string', description: 'indica la fecha final para agregarse a la agenda' }
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateTask",
            description: "actualiza una tarea o asigna a un dia la tarea, en la prop myDay, dame solo las propiedades a actualizar respetando sus propiedades el titulo anterior lo debes de mandar en oldTitle y el nuevo en title..si algun dato es requerido y no se proporsiona solicitalo y si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'nuevo titulo de la tarea'},
                    oldTitle: { type: 'string', description: 'titulo anterior de la tarea'},
                    isImportant: { type: 'boolean', description: 'nuevo indicador si una tarea es importante' },
                    myDay: { type: 'string', description: 'nueva fecha para la tarea, hoy es '+ moment().format('DD/MM/YYYY') },
                    description: { type: 'string', description: 'indica la nueva descripcion de la tarea' },
                    isRemainder: { type: 'boolean', description: 'indica nuevo recordatorio' },
                    priority: { type: 'string', enum: ["Alta", "Media", "Baja"], description: 'indica la nuevo prioridad de la tarea, por default es baja' },
                    reminder: { type: 'string', description: 'indica la nueva fecha del recordatorio hoy es '+ moment().format('DD/MM/YYYY') },
                    isAgend: { type: 'boolean', description: 'nuevo indicador de si se agregara a la agenda hoy es '+ moment().format('DD/MM/YYYY') },
                    initDate: { type: 'string', description: 'nuevo indicador de la fecha inicial para agregarse a la agenda hoy es '+ moment().format('DD/MM/YYYY') }, // Asegúrate de tener moment.js instalado y configurado
                    initHour: { type: 'string', description: 'nuevo indicador de la fecha final para agregarse a la agenda hoy es '+ moment().format('DD/MM/YYYY') },
                    endDate: { type: 'string', description: 'nuevo indicador de la hora inicial para agregarse a la agenda hoy es '+ moment().format('DD/MM/YYYY') },
                    endHour: { type: 'string', description: 'nuevo indicador de la hora final para agregarse a la agenda hoy es '+ moment().format('DD/MM/YYYY') },
                    note: { type: 'string', description: 'nuevo indicador de la nota que llevara la tarea' },
                },
                require:["oldTitle"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateNote",
            description: "actualiza una nota, si algun dato es requerido y no se proporsiona solicitalo y si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la Nota' },
                    content: { type: "string", description: 'indica el contenido de la nota' },
                    isImportant: { type: 'boolean', description: 'indica si una Nota es importante' },
                    reminder: { type: 'string', description: 'indica la fecha del recordatorio' },
                    initAt: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda' }, // Asegúrate de tener moment.js instalado y configurado
                    endAt: { type: 'string', description: 'indica la fecha final para agregarse a la agenda' }
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "changeStatusTask",
            description: "actualiza el estado de una tarea, si algun dato es requerido y no se proporsiona solicitalo",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la Nota' },
                    isCompleted:{ type: 'boolean', description: 'indica si una tarea se marca como completada' },
                    isImportant:{ type: 'boolean', description: 'indica si una tarea se marca como importante' },
                    isPending:{ type: 'boolean', description: 'indica si una tarea se marca como pendiente' },
                    isActive:{ type: 'boolean', description: 'indica si una tarea se marca como activa' },
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteTask",
            description: "elimina una tarea, si algun dato es requerido y no se proporsiona solicitalo",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la Nota' }
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getInfoByName",
            description: "Get information of a task, event or note",
            parameters: {
                type: "object",
                properties: {
                    name: { type: 'string', enum: onlyNames ?? [], description: 'titulo de la nota, evento o tarea' }
                },
                required: ["name"]
            }
        }
    },

    ]
    return tools
}

const retriveRun = async (run_id, thread_id,userId=null) => {
    if (!run_id || !thread_id) {
        throw new Error()
    }
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            },
            { timeout: 6000 }
        );
        // console.log(response.data);
        if (response && response.data) {
            const status = response.data.status
            console.log(status)
            if (status == 'in_progress'|| status=='queued') {
                    return retriveRun(run_id, thread_id,userId)
            }
            else if (status == 'completed') {
                const messageToShow = await getMessage(thread_id)
                console.log(messageToShow, 'messageToShow')
                return {...messageToShow,type:'message'}
            }
            else if (status == 'requires_action') {
                const functionToCall = {...response.data,type:'function'}
                // const tool=functionToCall.required_action.submit_tool_outputs.tool_calls[0]
                // const tool_id=tool.id
                // if(tool.function.name=='getInfoByName')
                // {
                //     const all= await getAll(userId)
                //     console.log(all)
                //     submitToolOutputs(run_id,thread_id,userId,tool_id,all)
                reiniciarTemporizador();
                segundaSolicitudRecibida = false;
                // }
                return functionToCall
            }
            return null
        }
        console.log(result, 'result')
        return result
    } catch (error) {
        console.error('Error starting thread:', error.response);
        throw error;
    }
}

const getAssistants = async () => {
    try {
        const response = await axios.get(
            'https://api.openai.com/v1/assistants',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        console.log(response.data);
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }
}

const getRun = async () => {
    try {
        const response = await axios.get(
            'https://api.openai.com/v1/threads/thread_hLFuflge4HX4AORHfGmfgSaE/runs/run_aFzQzRqmhdGUAGxyoSYFKHOK',
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        console.log(response.data);
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }
}

const createRun = async (thread_id, userId) => {
    const tools = await getTools(userId)
    if (!thread_id || thread_id === "") {
        return
    }
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${thread_id}/runs`,
            {
                assistant_id: "asst_Bl4GkbYfEeJa646wmSgxg1aX",
                instructions:'If there is missing data or data that is not clear that is required, request it.. today is' + moment().format('DD/MM/YYY') + 'if there are a date use that date to calculate the final date',
                additional_instructions: 'If there is missing data or data that is not clear that is required, request it, respond with short messages',
                tools,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        );
        if (response && response.data) {
            const responseRetriveRun = await retriveRun(response.data.id, response.data.thread_id,userId)
            return responseRetriveRun
        }
    } catch (error) {
        console.error('Error starting thread:', error.response);
        throw error;
    }
}

router.post('/sendMessage', (async (req, res) => {
    const metadata=await getAll()
    try {
        let thread_id
        const { inputValue, thread, userId } = req.body

        if (thread && thread != '') {
            thread_id = thread
        } else {
            thread_id = await startThread()
        }
        if (!inputValue || !thread_id || !userId) {
            throw new Error()
        }

        const response = await axios.post(
            `https://api.openai.com/v1/threads/${thread_id}/messages
            `,
            {
                role: "user", content: inputValue, metadata
            },

            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        )
        if (response.data) {
            const thread_id = response.data.thread_id
            const finalResponse = await createRun(thread_id, userId) // puede ser mensaje o call function
            console.log(finalResponse,'final responseeeeeeeeeeeee')
            if (finalResponse) {
                lastRunId=finalResponse.id
                lastThreadId=finalResponse.thread_id
                res.send(finalResponse)
            }
            else {
                throw new Error()
            }
            //   const callFunctions= responseOIA.tool_calls[0]?.function
            //   const message =responseOIA.content
        }

    } catch (error) {
        res.status(error.response.status).send(error)
        console.log(error.response.status)
    }
}))

router.post('/responseFromFunction', (async (req, res) => {
    try {
        const { run_Id, thread_id, userId, tool_id ,resFunction } = req.body
        if (!thread_id || !userId || !run_Id) {
            throw new Error()
        }
        console.log(run_Id, thread_id, userId, tool_id ,resFunction)
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${thread_id}/runs/${run_Id}/submit_tool_outputs`,
            {
                tool_outputs:[
                    {tool_call_id:tool_id,
                    output:resFunction?JSON.stringify(resFunction):'Ah ocurrido un error'}
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CHATGPT_KEY}`,
                    'OpenAI-Beta': 'assistants=v1',
                },
            }
        )
        if (response.data) {
            console.log(response.data)
            const messageAfterComplete= await retriveRun(run_Id,thread_id,userId)
            res.send(messageAfterComplete)
            segundaSolicitudRecibida = true;
        }

    } catch (error) {
        res.status(500).send('Ah ocurrido un error. Intentalo mas tarde')
        console.log(error.response)
    }
}))

module.exports = router