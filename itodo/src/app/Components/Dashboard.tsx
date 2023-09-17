import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, Box, TextField } from "@mui/material";
import { Col, Row } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Resizable } from "re-resizable";
import Link from "next/link";
import { Input, Spin } from "antd";
import { useAddCategoryByIdUserMutation } from "@/redux/services/categoryApi";
import openNotification from "../utils/notify";
import { useGetCategoryByIdUserQuery } from "@/redux/services/categoryApi";
import IconSelector from "./IconSelector";
import { useUpdateCategoryMutation } from "@/redux/services/categoryApi";
import { addCategories } from "@/redux/features/categorySlice";
interface User {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: number;
  correo: string;
}

type DashboarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  userInfo: User | null;
};

interface dataResponseByIdUser {
  data: {
    id: string;
    idUser: string;
    name: string;
    styles: string;
    idList: string;
  }[];
}

interface Category {
  id: string;
  idUser: string;
  name: string;
  styles: string;
  idList: string;
}

const Dashboard = (props: DashboarProps) => {
  const { isOpen, setIsOpen, userInfo } = props;
  const [size, setSize] = useState<{ width: number; height: any }>({
    width: 200,
    height: "auto",
  });
  const [isEditcustomList, setIsEditcustomList] = useState(false);
  const [editingId, setEditingId] = useState<null | string>(null); // nuevo estado

  const dispatch = useAppDispatch();
  const [addCategoryByIdUser, { isLoading: isLoadingAddCategory }] =
    useAddCategoryByIdUserMutation();
  const [userId, setUserId] = useState<null | string>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const response = useGetCategoryByIdUserQuery(userInfo?.id || "", {
    skip: !userInfo?.id,
  });
  const [categoryData, setCategoryData] = useState<Category[] | null>(null);
  let categoryLoading = false;
  let categoryError: any = false;
  const [nameCategoryToUpdate, setNameCategoryToUpdate] = useState("");
  const [updateCategory, { data, isLoading, error }] =
    useUpdateCategoryMutation();

  useEffect(() => {
    if (response && response.data) {
      setCategoryData(response.data ?? null);
      categoryLoading = response.isLoading;
      categoryError = response.error;
    }
  }, [response]);

  useEffect(()=>{
    dispatch(addCategories(categoryData))
  },[categoryData])

  useEffect(() => {
    if (userInfo?.id) {
      setUserId(userInfo.id);
    }
  }, [userInfo]);

  useEffect(() => {
    setSize({ width: isOpen ? 298 : 50, height: "auto" });
  }, [isOpen]);
  const [nameCategory, setNameCategory] = useState("");

  const addCategory = () => {
    if (
      nameCategory == null ||
      nameCategory == undefined ||
      nameCategory == "" ||
      !userInfo
    ) {
      return;
    }

    addCategoryByIdUser({
      name: nameCategory,
      idUser: userInfo.id,
      styles: selectedIcon,
    })
      .unwrap()
      .then((value) => {
        console.log(value);
        setNameCategory("");
        setIsEditcustomList(false);
        setCategoryData((CatDat) => {
          if (CatDat) {
            // Si CatDat no es null, agregamos value al final de la matriz
            return [...CatDat, value];
          } else {
            // Si CatDat es null, inicializamos la matriz con value
            return [value];
          }
        });
      })
      .catch((error: any) => {
        openNotification(
          "error",
          error.message || "ah ocurrido un error intentalo de nuevo"
        );
      });
  };

  const updateCategoryfn = (idCategory: string, stylesDefault: string) => {
    if (nameCategoryToUpdate == "" || !nameCategoryToUpdate) {
      return;
    }

    const stylesEnd = selectedIcon != "" ? selectedIcon : stylesDefault;

    console.log(idCategory);
    updateCategory({
      id: idCategory,
      name: nameCategoryToUpdate,
      styles: stylesEnd,
    })
      .unwrap()
      .then((data) => {
        setCategoryData((CatDat) => {
          const updatedCatData = CatDat?.map((item) => {
            if (item.idList === idCategory) {
              return data;
            } else {
              return item;
            }
          });

          console.log(CatDat);

          return updatedCatData ?? CatDat;
        });

        setEditingId(null);
      });
  };

  const editList = (idList: string) => {};

  const deleteList = (idList: string) => {};

  const handleIconSelection = (iconKey: string, iconColor: string) => {
    const stylesIcon = { class: `fa-solid fa-${iconKey}`, color: iconColor };
    setSelectedIcon(JSON.stringify(stylesIcon));
  };

  return (
    <Resizable
      size={size}
      onResizeStop={(e, direction, ref, d) => {
        console.log(ref.style.width, ref.style.height);
        setSize({ width: Number.parseFloat(ref.style.width), height: "auto" });
      }}
      minWidth={isOpen ? "240px" : "65px"}
      maxWidth={isOpen ? "240px" : "3vw"}
      className={`flex flex-col px-1 overflow-hidden transition-all duration-200 ease-in-out bg-mainContainers`}
    >
      <div
        className={`w-all flex ${
          size.width > 20 ? "justify-center" : "justify-center"
        } align-center px-2`}
        style={{ height: 60 }}
      >
        <Row className="w-100 justify-center dashboardClose align-items-center">
          <div className="text-center  justify-center">
            <img
              src="/images/textWhite.png"
              style={{ height: 21, margin: "auto" }}
              alt="Descripción de la imagen"
            />
          </div>
        </Row>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            let elements = document.getElementsByClassName("dashboardClose");
            for (let i = 0; i < elements.length; i++) {
              elements[i].classList.toggle("d-none");
            }
          }}
          className="p-0 w-auto btnDashboard text-white rounded"
        >
          {/* {isOpen ? "Cerrar" : "Abrir"} */}
          <i
            className={`fas btnDashboard fa-bars fs-3 transition-all 
            duration-200 ease-in-out ${isOpen ? "" : "fa-rotate-90"}`}
          ></i>
        </button>
      </div>

      <div>
        <div style={{ height: "90vh", overflowY: "auto", overflowX: "hidden" }}>
          <nav className="pt-2 pb-4">
            <section className="pb-1 mb-2" style={{borderBottom:'1px solid #4b4b4b'}}>
              <Link replace href="/task">
                <i className="fas fa-list-check fs-5 text-primary mr-3" />
                <span className="dashboardClose">Tareas</span>
              </Link>
              <br />
              <Link replace href="/notes">
              <i className="fas fa-note-sticky fs-5 text-warning mr-3" />
                <span className="dashboardClose">Notas</span>
              </Link>
              <br />
            </section>
            <Link replace href="/myDay">
              <i className="fas fa-sun text-primary fs-5 mr-3" />
              <span className="dashboardClose">Mi día</span>
            </Link>
            <br />
            <Link className="col-12" replace href="/important">
            <i className="fas fa-star fs-5 text-warning mr-3" />
              <span className="dashboardClose">Importantes</span>
            </Link>
            <br />
            <Link className="col-12" replace href="/completed">
              <i className="fas fa-circle-check fs-5 text-success mr-3" />
              <span className="dashboardClose">Completadas</span>
            </Link>
            <br />
            <Link className="col-12" replace href="/pending">
            <i className="fas fa-clock text-danger fs-5 mr-3" />
              <span className="dashboardClose">Pendientes</span>
            </Link>
            <br />
            <a href="#" className="block py-1 text-gray-500 hover:underline">
              <i className="fas fa-bars-progress text-info fs-5 mr-3" />
              <span className="dashboardClose">En curso</span>
            </a>
            <Link className="col-12" replace href="/reminder">
            <i className="fas fa-bookmark fs-5 text-warning mr-3" />
              <span className="dashboardClose">Recordatorios</span>
            </Link>
            <br />
            <Link className="col-12" replace href="/diary">
            <i className="fas fa-calendar fs-5 text-primary mr-3" />
              <span className="dashboardClose">Agenda</span>
            </Link>
            <br />
            <a href="#" className="block py-1 text-gray-500 hover:underline">
              <i className="fas fa-chalkboard-user fs-5 text-info mr-3" />
              <span className="dashboardClose">Seguimiento</span>
            </a>
          </nav>

          <nav className="block text-gray-500 mb-4">
            <Row className="w-100 justify-between align-items-center align-content-center mb-2">
              <h2 className="col-8 text-white text-start fs-6 pl-5">
                <span className="dashboardClose">Mis listas</span>
              </h2>
              <i className="col-4 dashboardClose fas fa-list text-end p-0 text-primary" />
            </Row>

            {!categoryData && !categoryError && categoryLoading && (
              <Spin size="large" />
            )}
            {!categoryData && categoryError && !categoryLoading && <>Error</>}
            {categoryData &&
              !categoryError &&
              !categoryLoading &&
              categoryData.map((element: any, key) => {
                return (
                  <span key={element.idList}>
                    <a href="#" className="block listUser py-1 text-gray-500 ">
                      <Row>
                        {editingId === element.idList ? (
                          <>
                            <div className="col-2 mr-2 align-items-center">
                              <IconSelector
                                onIconClick={handleIconSelection}
                                defaultIcon={element.styles ?? ""}
                              />
                            </div>
                            <Input
                              placeholder="Nombre"
                              className="col-6 inputAddList bg-none h-25"
                              defaultValue={element.name}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateCategoryfn(
                                    element.idList,
                                    element.styles
                                  );
                                }
                              }}
                              onChange={(e) => {
                                setNameCategoryToUpdate(e.target.value);
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <div className="col-1">
                              <i
                                className={
                                  element.styles
                                    ? JSON.parse(element.styles).class + " mr-2"
                                    : "fas fa-list mr-2"
                                }
                                style={{
                                  color: element.styles
                                    ? JSON.parse(element.styles).color
                                    : "lightgray",
                                }}
                              />
                            </div>
                            <p className="col-6 dashboardClose">
                              {element.name}
                            </p>
                          </>
                        )}
                        <span
                          style={{ display: "inline-flex", fontSize: 14 }}
                          className="col-2 align-items-center justify-items-end"
                        >
                          <i
                            onClick={() => {
                              editingId !== element.idList
                                ? setEditingId(element.idList)
                                : setEditingId(" ");

                              setNameCategoryToUpdate(element.name);
                            }}
                            className={`fas d-none ${
                              editingId !== element.idList
                                ? "fa-pen-to-square text-primary"
                                : "fa-xmark text-danger"
                            } text-end ml-2 mr-1 ${
                              isOpen ? "ocult" : "dashboardClose"
                            } `}
                          />
                          {editingId !== element.idList ? (
                            <i
                              onClick={(e) => deleteList(element.idList)}
                              className={`fas d-none fa-trash text-end  text-danger ml-2 mr-1 ${
                                isOpen ? "ocult" : "dashboardClose"
                              } `}
                            />
                          ) : (
                            <i
                              onClick={(e) =>
                                updateCategoryfn(element.idList, element.styles)
                              }
                              className={`fas d-none fa-check text-end  text-success ml-2 mr-1 ${
                                isOpen ? "ocult" : "dashboardClose"
                              } `}
                            />
                          )}
                        </span>
                      </Row>
                    </a>
                  </span>
                );
              })}

            {isEditcustomList && (
              <Spin spinning={isLoadingAddCategory}>
                <a className="block py-1 text-gray-500">
                  <Row className="justify-between w-100 align-items-center align-content-center">
                    <div className="col-1">
                      <IconSelector onIconClick={handleIconSelection} />
                    </div>
                    <Input
                      placeholder="Nombre"
                      value={nameCategory}
                      className="col-9 inputAddList bg-none h-25"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addCategory();
                        }
                      }}
                      onChange={(e) => {
                        setNameCategory(e.target.value);
                      }}
                    />
                  </Row>
                </a>
              </Spin>
            )}

            <div className="flex bg-dark dashboardClose justify-between absolute bottom-0 p-2 items-center w-full text-gray-300 ">
              <div
                onClick={() => {
                  setIsEditcustomList(!isEditcustomList);
                  setNameCategory("");
                }}
                className="inline-flex cursor-pointer items-center"
              >
                {!isEditcustomList ? (
                  <i className="fas fa-plus text-start text-white mr-1"></i>
                ) : (
                  <i className="fa-solid fa-arrow-left mr-1"></i>
                )}

                <p className="dashboardClose" style={{ fontSize: 13 }}>
                  Agregar lista
                </p>
              </div>

              <i className="fas dashboardClose fa-pen-to-square text-end text-primar ml-2 mr-1"></i>
            </div>
          </nav>
        </div>
      </div>
      {/* <h1>Total: {count}</h1>
    <button
        onClick={(e) => dispatch(increment())}
        className="py-2 text-white rounded"
      >
        {"aumentar"}
      </button>
      <button
        onClick={(e) => dispatch(decrement())}
        className="py-2 text-white rounded"
      >
        { "disminuir"}
      </button> */}
    </Resizable>
  );
};

export default Dashboard;
