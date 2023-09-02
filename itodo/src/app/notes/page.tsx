"use client";

import { ReactNode, useEffect, useState } from "react";
import Home from "../main/main";
import React from "react";
import Loader from "../Components/Loader";
import "./styles.css";
import { Col, Row } from "react-bootstrap";
import ModalAddTask from "../Components/tasksComponents/modalAddTask";
import { getPendingByIdUser } from "../utils/services/services";
import openNotification from "../utils/notify";
import FastLoader from "../Components/FastLoader";
import Task from "../Components/tasksComponents/Task";
import NoDataPlaceholder from "../Components/NoDataPlaceholder";
import { Input } from "antd";
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState } from 'draft-js';
import dynamic from 'next/dynamic'
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
  finishAt: string;
  file: string;
  note: string;
  originalFileName: string;
  categoryId: string;
  userId: string;
}

const page = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [allTaskData, setAllTaskData] = useState<taskDAata[] | null>(null);
  const [loaderAllTask, setLoaderAllTask] = useState(false);
  const [errorAllTask, setErrorAllTask] = useState(false);
  const [fastSpin, setFastSpin] = useState(false);
  const [editorFocused, setEditorFocused] = React.useState(false);

  const [editorState, setEditorState] = useState(
   EditorState.createEmpty()
  );

  const editor = React.useRef<typeof Editor | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("user")) {
      getAllTaskPendingByUser();
    }
  }, []);

  useEffect(() => {
    console.log(allTaskData);
  }, [allTaskData]);

  const getAllTaskPendingByUser = async () => {
    setErrorAllTask(false);
    setAllTaskData(null);
    setLoaderAllTask(true);
    const id = sessionStorage.getItem("user");
    try {
      const response = await getPendingByIdUser(id);
      console.log(response.data);
      setAllTaskData(response.data);
    } catch (error: any) {
      setErrorAllTask(true);
      openNotification("error", error.message);
    } finally {
      setLoaderAllTask(false);
    }
  };

  const description =
    " Falta-- Vacaciones-- incapacidades solo dias, concecutivos---Permisos - permiso normal---sin gose de sueldo añadir nombre delempleado columna de fecha de creacion ultima act- quien lo hizoorden decendente de fecha de creacion mostrar modal de detalleal agregar incidencia eliminar o cancelar pendiende de ap..-pendiente, justificado, rechazado incapacidad";

  return (
    <Home>
      <div className="row p-0 w-100 m-auto">
        <FastLoader isLoading={fastSpin} />

        <div className="asideNotes p-2 mr-3 cardContainer">
          <div className="w-100 m-auto row justify-content-between align-content-center align-items-center pt-1">
            <div className="fs-5 col-6">
              <i className="fa-solid mr-2 fa-note-sticky"></i>
              Notas
            </div>
            <div className="col-6 fs-5 text-end">
              <i className="fa-solid fa-plus"></i>
            </div>
          </div>
          <div
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
              style={{ lineHeight: "9px" }}
            >
              5 Notas
            </div>
            <i className="fa-solid col-1 col-auto fa-filter"></i>
          </div>

          <div className="card-container">
            <div className="cardNote p-3 relative">
              <h3>Modificaciones tab Incidencias</h3>
              <p
                className="mt-2"
                style={{ color: "#989898", fontSize: "15px" }}
              >
                {description.substring(1, 160) + "..."}
              </p>
              <p
                className="px-3 absolute bottom-2 left-1"
                style={{ color: "#989898", fontSize: "13px" }}
              >
                Agosto 26 2023
              </p>
            </div>
            <div className="cardNote">nota </div>
            <div className="cardNote">nota </div>
          </div>
        </div>

        <div className="asideNotes content p-3">
          <Row
            className="justify-content-between align-content-center align-items-center"
            style={{ color: "#989898" }}
          >
            <i
              className="fa-solid fa-expand fs-4 pr-3 col-auto"
              style={{ borderRight: "1px solid #4b4b4b", color: "#989898" }}
            ></i>
            <div className="col-4">Fecha de creación: 25/05/2023</div>
            <div className="col-4">Ultima actualización: 25/05/2023</div>
            <button
              className="col-auto btn btn-success py-1 px-2 mr-3"
              style={{ fontSize: 14 }}
            >
              Compartir
            </button>

            <div className="col-12 mt-3">
            <input type="text" className="inputTitle" title="title"
            placeholder="Ingresa un titulo"
            />
            <Editor
      editorState={editorState}
      toolbarClassName={editorFocused ? "toolbarClassName" : "toolbarClassName toolbarHidden"}
      wrapperClassName="wrapperClassName"
      editorClassName="editorClassName"
      onEditorStateChange={(e) => {
        console.log(e);
        setEditorState(e);
      }}
      onFocus={() => setEditorFocused(true)}
      onBlur={() => setEditorFocused(false)}
      placeholder="Ingresa el contenido de la nota"
    />
            </div>
            
            {/* <div className="noteTitle">Modificaciones tab Incidencias</div> */}
            {/* <div className="noteContent">{description}</div> */}
          </Row>

        </div>
      </div>
    </Home>
  );
};

export default page;
