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
//       console.log(response.data.id);
//       return response.data.id;
//     } catch (error) {
//       console.error('Error starting thread:', error);
//       throw error;
//     }
//   };


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
            return response.data.data[0]
        }
    } catch (error) {
        console.error('Error starting thread:', error);
        throw error;
    }
};

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
            description: "agrega una tarea nueva para el usuario, si algun dato es requerido y no se proporsiona solicitalo y si se indico alguna fecha o hora se debe agregar en formato DD/MM/YYYY y h:mm",
            parameters: {
                type: "object",
                properties: {
                    title: { type: 'string', description: 'titulo de la tarea'},
                    isImportant: { type: 'boolean', description: 'indica si una tarea es importante' },
                    isMyDay: { type: 'boolean', description: 'indica si una tarea corresponde a mi dia' },
                    description: { type: 'string', description: 'indica la descripcion de la tarea' },
                    isRemainder: { type: 'boolean', description: 'indica si la tarea cuenta con un recordatorio' },
                    priority: { type: 'string', enum: ["Alta", "Media", "Baja"], description: 'indica la prioridad de la tarea, por default es baja' },
                    reminder: { type: 'string', description: 'indica la fecha del recordatorio' },
                    isAgend: { type: 'boolean', description: 'indica si se agregara a la agenda' },
                    initDate: { type: 'string', description: 'indica la fecha inicial para agregarse a la agenda' }, // Asegúrate de tener moment.js instalado y configurado
                    initHour: { type: 'string', description: 'indica la fecha final para agregarse a la agenda' },
                    endDate: { type: 'string', description: 'indica la hora inicial para agregarse a la agenda' },
                    endHour: { type: 'string', description: 'indica la hora final para agregarse a la agenda' },
                    note: { type: 'string', description: 'indica la nota que llevara la tarea' },
                },
                required: ["title", "priority"]
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
                required: ["title", "content"]
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

const retriveRun = async (run_id, thread_id) => {
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
            }
        );
        // console.log(response.data);
        if (response && response.data) {
            const status = response.data.status
            console.log(status)
            if (status == 'in_progress') {
                return retriveRun(run_id, thread_id)
            }
            else if (status == 'completed') {
                const messageToShow = await getMessage(thread_id)
                console.log(messageToShow, 'messageToShow')
                return {...messageToShow,type:'message'}
            }
            else if (status == 'requires_action') {
                const functionToCall = {...response.data,type:'function'}
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
                instructions:'If there is missing data or data that is not clear that is required, request it',
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
            const responseRetriveRun = await retriveRun(response.data.id, response.data.thread_id)
            console.log(responseRetriveRun, 'responseRetriveRun')
            return responseRetriveRun
        }
    } catch (error) {
        console.error('Error starting thread:', error.response);
        throw error;
    }
}

router.post('/sendMessage', (async (req, res) => {
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
                role: "user", content: inputValue
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
            console.log(finalResponse)
            if (finalResponse) {
                res.send(finalResponse)
            }
            else {
                throw new Error()
            }
            //   const callFunctions= responseOIA.tool_calls[0]?.function
            //   const message =responseOIA.content
        }

    } catch (error) {
        res.status(500).send('Ah ocurrido un error. Intentalo mas tarde')
        console.log(error.response)
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
                    output:resFunction??'completada'}
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
        }

    } catch (error) {
        res.status(500).send('Ah ocurrido un error. Intentalo mas tarde')
        console.log(error.response)
    }
}))

module.exports = router