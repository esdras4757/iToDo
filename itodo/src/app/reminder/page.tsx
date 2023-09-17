"use client";
import Calendar from "react-calendar";
import { ReactNode, useEffect, useRef, useState, } from "react";
import { isNil, isEmpty, debounce } from "lodash";
import Home from "../main/main";
import React from "react";
import Loader from "../Components/Loader";
import "./styles.css";
import { Col, Row } from "react-bootstrap";
import ModalAddTask from "../Components/tasksComponents/modalAddTask";
import openNotification from "../utils/notify";
import FastLoader from "../Components/FastLoader";
import Task from "../Components/tasksComponents/Task";
import NoDataPlaceholder from "../Components/NoDataPlaceholder";
import { Avatar, Card, DatePicker, Input, Popover, Skeleton, TimePicker } from "antd";
import draftToHtml from "draftjs-to-html";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import { getAllRemindersByIdUser } from "../utils/services/services";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Notar cómo se importa el plugin aquí
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  EditorState,
  convertFromRaw,
  SelectionState,
  RichUtils,
} from "draft-js";
import dynamic from "next/dynamic";
import ErrorPlaceHolder from "../Components/ErrorPlaceHolder";
import { convertToRaw } from "draft-js";
import dayjs, { Dayjs } from "dayjs";
import "react-calendar/dist/Calendar.css";
import FullCalendar from "@fullcalendar/react";
import CalendarApi from "@fullcalendar/react";
import { ColorPicker } from "antd";
import Meta from "antd/es/card/Meta";

dayjs.extend(customParseFormat);
let timer: NodeJS.Timeout | null = null;
interface status {
  isCompleted: boolean;
  isImportant: boolean;
  isPending: boolean;
  isActive: boolean;
  isInProgress: boolean;
}

interface ReminderData {
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

const initValues: ReminderData = {
  id: "",
  title: "",
  initAt: null,
  endAt: null,
  reminder: null,
  type: "",
  description: "",
  color: "#ccc",
  note: "",
};
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
dayjs.locale("es");
const Page = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [allReminderData, setAllReminderData] = useState<ReminderData[] | null>(null);
  const [eventFormat, setReminderFormat] = useState<any>(null);

  const [loaderAllReminder, setLoaderAllReminder] = useState(false);
  const [errorAllReminder, setErrorAllReminder] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [idUser, setIdUser] = useState("");
  const [title, setTitle] = useState<null | string>(null);
  const [values, setValues] = useState(initValues);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState(false);

  const calendarRef = useRef<any>(null);
  useEffect(() => {
    if (sessionStorage.getItem("user")) {
      getAllReminderByUser();
    }
  }, []);

  useEffect(() => {
    if (allReminderData && isNil(allReminderData) == false) {
      const events = allReminderData.map((item: ReminderData) => {
        return {
          id: item.id,
          title: item.title,
          start:
            isNil(item.initAt) == false && item.initAt != ""
              ? dayjs(item.initAt, "DD/MM/YYYY HH:mm").toDate()
              : null,
          end:
            isNil(item.endAt) == false && item.endAt != ""
              ? dayjs(item.endAt, "DD/MM/YYYY HH:mm").toDate()
              : null,
          color: item.color
            ? item.color
            : item.type == "task"
            ? "blue"
            : item.type == "note" && "#8e8f3d",
          description: item.description,
          type: item.type,
          reminder: item.reminder,
          note: item.note,
        };
      });

      setReminderFormat(events);
    }
  }, [allReminderData]);

  const getAllReminderByUser = async () => {
    setErrorAllReminder(false);
    setAllReminderData(null);
    setLoaderAllReminder(true);
    const id = sessionStorage.getItem("user");

    if (id) {
      setIdUser(id);
    }

    try {
      const response = await getAllRemindersByIdUser(id);
      if (response.data && response.data.length > 0) {
        console.log(response.data);
        setAllReminderData(response.data);
      }
    } catch (error: any) {
      setErrorAllReminder(true);
      openNotification("error", error.message);
    } finally {
      setLoaderAllReminder(false);
    }
  };

  // const AddReminder= async () => {
  //   if (
  //     isNil(values.title) === true ||
  //     values.title.trim() === "" ||
  //     isNil(values.initAt) === true ||
  //     values.initAt === "" ||
  //     isNil(values.endAt) === true ||
  //     values.endAt === ""
  //   ) {
  //     setErrors(true);
  //     return;
  //   }
  //   setErrors(false);
  //   setFastSpin(true);
  //   try {
  //     console.log(values);
  //     const data = {
  //       userId: idUser,
  //       title: values.title,
  //       description: values.description,
  //       initAt: values.initAt,
  //       endAt: values.endAt,
  //       color: values.color,
  //       reminder: values.reminder,
  //       note: values.note,
  //       type: "event",
  //     };

  //     const response = await addReminder(data);
  //     if (isNil(response) === false && isNil(response.data) === false) {
  //       console.log("aaaaaaaaaaaaaaaaa");
  //       ShowHidePanel();
  //       setAllReminderData((prev) => {
  //         if (!prev) {
  //           return prev;
  //         }
  //         return [...prev, response.data];
  //       });
  //       const calendarApi = calendarRef.current.getApi();
  //       calendarApi.render();
  //     }
  //   } catch (error: any) {
  //     openNotification("error", error.message);
  //   } finally {
  //     setFastSpin(false);
  //   }
  // };

  // const updateReminder = async () => {
  //   if (
  //     isNil(values.title) === true ||
  //     values.title.trim() === "" ||
  //     isNil(values.initAt) === true ||
  //     values.initAt === "" ||
  //     isNil(values.endAt) === true ||
  //     values.endAt === ""
  //   ) {
  //     setErrors(true);
  //     return;
  //   }
  //   setErrors(false);
  //   setFastSpin(true);
  //   try {
  //     console.log(values);
  //     const data = {
  //       userId: idUser,
  //       title: values.title,
  //       description: values.description,
  //       initAt: values.initAt,
  //       endAt: values.endAt,
  //       color: values.color,
  //       reminder: values.reminder,
  //       note: values.note,
  //       type: "event",
  //     };

  //     const response = await updateReminderById(values.id,data);
  //     if (isNil(response) === false && isNil(response.data) === false) {
  //       ShowHidePanel();
  //       setAllReminderData((prev) => {
  //         if (!prev || isEmpty(prev)) {
  //           return prev;
  //         }
  //          const newReminder = prev.map((event)=>{
  //           if(event.id === response.data._id){
  //             const data = {
  //               id:response.data._id,
  //               userId: response.data.userId,
  //               title: response.data.title,
  //               description: response.data.description,
  //               initAt: response.data.initAt,
  //               endAt: response.data.endAt,
  //               color: response.data.color,
  //               reminder: response.data.reminder,
  //               note: response.data.note,
  //               type: response.data.type,
  //             }
  //             event=data
  //           }
  //           return event

  //         })
  //         return newReminder
  //       });
  //       const calendarApi = calendarRef.current.getApi();
  //       calendarApi.render();
  //     }
  //   } catch (error: any) {
  //     openNotification("error", error.message);
  //   } finally {
  //     setFastSpin(false);
  //   }
  // };

  const ShowHidePanel = (type: "toggle" | "add" | "remove" = "toggle") => {
    const detailPanel = document.querySelector(".detailPanel");
    const calndarPanel = document.querySelector(".calendarPanel");
    if (detailPanel && calndarPanel && calendarRef?.current) {
      detailPanel.classList[type]("d-none");
      calndarPanel.classList[type]("w-100");
      const calendarApi = calendarRef.current.getApi();
      calendarApi.render();
    }
  };

  const updateValues = <K extends keyof ReminderData>(
    value: ReminderData[K],
    name: K
  ) => {
    setValues((prev) => {
      return { ...prev, [name]: value };
    });
  };

  // useEffect(() => {
  //   console.log(values);
  // }, [values]);

  return (
    <Home>
      <div className="row align-content-end align-items-end  gap-3 justify-content-between p-5 w-100 m-auto">
        <FastLoader isLoading={fastSpin} />
        <h1 className="col-12 text-center mb-2 flex align-items-center justify-content-center title bold">
            <i className="fas fa-bell text-warning mr-3" /> Recordatorios
            </h1>
        <Card
        style={{ width: 340, marginTop: 16 }}
        actions={[
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Skeleton loading={fastSpin} avatar active>
          <Meta
            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />}
            title="Card title"
            description="This is the description"
          />
        </Skeleton>
      </Card>

      <Card
        style={{ width: 340, marginTop: 16 }}
        actions={[
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Skeleton loading={fastSpin} avatar active>
          <Meta
            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />}
            title="Card title"
            description="This is the description"
          />
        </Skeleton>
      </Card>

      <Card
        style={{ width: 340, marginTop: 16 }}
        actions={[
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Skeleton loading={fastSpin} avatar active>
          <Meta
            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />}
            title="Card title"
            description="This is the description"
          />
        </Skeleton>
      </Card>
      <Card
        style={{ width: 340, marginTop: 16 }}
        actions={[
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}
      >
        <Skeleton loading={fastSpin} avatar active>
          <Meta
            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />}
            title="Card title"
            description="This is the description"
          />
        </Skeleton>
      </Card>
      </div>
    </Home>
  );
};

export default Page;
