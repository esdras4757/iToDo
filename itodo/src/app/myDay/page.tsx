"use client";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import Home from "../main/main";
import React from "react";
import { useRouter } from "next/navigation";
import Loader from "../Components/Loader";
import "./styles.css";
import { Col, Row } from "react-bootstrap";

const page = () => {
  const router = useRouter();

  return (
    <Home>
      <div className="listMyDayContainer">
        <div className="listMyDay">
          <Row className="justify-content-center h-100 flex-wrap jus align-content-center align-items-center text-center">
            <div className="col-1">
              <i className="fa-regular fs-4 fa-circle"></i>
            </div>
            <Row className="col-10 text-left flex-wrap flex-column">
              <div className="mb-2 ">
                <i className="fa-solid fs-5 mr-2 text-primary fa-list-check"></i>
                <span className="titleTask">Nombre de la Tarea</span>
              </div>
              <div className="gap-2 contList fs-6">
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-layer-group"></i>
                  World
                </span>
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-user"></i>
                  esdras4757
                </span>
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-repeat"></i>
                </span>
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-bell"></i>
                  Today
                </span>
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-share-nodes"></i>
                  compartir
                </span>
                <span>
                  <i className="fa-solid mr-1 ml-1 fa-note-sticky"></i>
                </span>
              </div>
            </Row>
            <Row className="col-1 h-100 text-center justify-content-center justify-items-center align-content-around">
              <i className="col-12 fa-regular fs-6 fa-star"></i>
              <i className="col-12 fa fs-6 text-danger fa-trash"></i>
            </Row>
          </Row>
        </div>

        <div className="listMyDay">
          <Row className="justify-content-center h-100 flex-wrap jus align-content-center align-items-center text-center">
            <div className="col-1">
              <i className="fa-regular fs-4 fa-circle"></i>
            </div>
            <Row className="col-10 text-left flex-column">
              <div className="mb-2 ">
                <i className="fa-solid fs-5 mr-2 text-warning fa-note-sticky"></i>
                <span className="titleTask">Nombre de la Nota</span>
              </div>
              <div className="gap-2 contList fs-6">
                <span>
                  <i className="fa-solid mr-1 fa-layer-group"></i>
                  World
                </span>
                <i className="fa-solid dot fa-circle"></i>
                <span>
                  <i className="fa-solid mr-1 fa-user"></i>
                  esdras4757
                </span>
                <i className="fa-solid dot fa-circle"></i>
                <span>
                  <i className="fa-solid mr-1 fa-repeat"></i>
                </span>
                <i className="fa-solid dot fa-circle"></i>
                <span>
                  <i className="fa-solid mr-1 fa-bell"></i>
                  Today
                </span>
                <i className="fa-solid dot fa-circle"></i>
                <span>
                  <i className="fa-solid mr-1 fa-share-nodes"></i>
                  compartir
                </span>
                <i className="fa-solid dot fa-circle"></i>
                <span>
                  <i className="fa-solid mr-1 fa-note-sticky"></i>
                </span>
              </div>
            </Row>
            <Row className="col-1 h-100 text-center justify-content-center justify-items-center align-content-around">
              <i className="col-12 fa-regular fs-6 fa-star"></i>
              <i className="col-12 fa fs-6 text-danger fa-trash"></i>
            </Row>
          </Row>
        </div>
      </div>
    </Home>
  );
};

export default page;
