import React, {
  ReactComponentElement,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Row } from "react-bootstrap";
import { useAppDispatch } from "@/redux/hooks";
import { Resizable } from "re-resizable";
import Link from "next/link";
import { Input, Spin } from "antd";
import {
  useAddCategoryByIdUserMutation,
  useGetCategoryByIdUserQuery,
  useUpdateCategoryMutation,
} from "@/redux/services/categoryApi";
import openNotification from "../utils/notify";

import IconSelector from "./IconSelector";

import { addCategories } from "@/redux/features/categorySlice";
import { isNil } from "lodash";
import { deleteCategoryById } from "../utils/services/services";
import FastLoader from "./FastLoader";
import { useRouter, useSearchParams } from 'next/navigation';
import PageTask from "../task/page";
import PageNote from "../note/page";
import PageMyDay from "../myDay/page";
import PageImportans from "../important/page";
import PageComplete from "../completed/page";
import PagePending from "../pending/page";
import PageReminder from "../reminder/page";
import PageInProgress from "../inProgress/page";
import PageDiary from "../diary/page";
import PageCategory from "../category/page";
import NoDataPlaceholder from "./NoDataPlaceholder";
interface User {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: number;
  correo: string;
}
// interface Components{
//   task : React.Component;
//   note : React.Component;
//   myDay : React.Component;
//   importants : React.Component;
//   completed : React.Component;
//   pending : React.Component;
//   Reminder : React.Component;
//   inProgress : React.Component;
//   diary : React.Component;
//   lists : React.Component;
// }
type CurrentComponentType = ReactElement;

type DashboarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  userInfo: User | null;
  setCurrentComponent: React.Dispatch<
    React.SetStateAction<CurrentComponentType | null>
  >;
  currentComponent?: CurrentComponentType | null;
  setLabelCurrentComponent:(value:string)=>void;
  labelCurrentComponent:string
};

interface Category {
  id: string;
  idUser: string;
  name: string;
  styles: string;
}

const Dashboard = (props: DashboarProps) => {
  const {
    isOpen, setIsOpen, userInfo, currentComponent,
    setCurrentComponent, setLabelCurrentComponent, labelCurrentComponent
  } =
    props;
  const [size, setSize] = useState<{ width: number; height: any }>({
    width: 200,
    height: "auto",
  });
  const [isEditcustomList, setIsEditcustomList] = useState(false);
  const [editingId, setEditingId] = useState<null | string>(null); // nuevo estado
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [addCategoryByIdUser, { isLoading: isLoadingAddCategory }] =
    useAddCategoryByIdUserMutation();
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const response = useGetCategoryByIdUserQuery(userInfo?.id || "", {
    skip: !userInfo?.id,
  });
  const [fastSpin, setFastSpin] = useState(false);
  const [categoryData, setCategoryData] = useState<Category[] | null>(null);
  let categoryLoading = false;
  let categoryError: any = false;
  const [nameCategoryToUpdate, setNameCategoryToUpdate] = useState("");
  const [updateCategory] = useUpdateCategoryMutation();

  useEffect(() => {
    const handleResize = (e: any) => {
      if (window.innerWidth < 425) {
        router.replace('/mobile')
      }
      if (window.innerWidth > 760) {
        setIsOpen(true)
        const elements = document.getElementsByClassName("dashboardClose");
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.remove("d-none");
        }
      } else {
        setIsOpen(false)
        const elements = document.getElementsByClassName("dashboardClose");
        for (let i = 0; i < elements.length; i++) {
          elements[i].classList.add("d-none");
        }
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function isMobileUserAgent () {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  useEffect(() => {
    if (isMobileUserAgent()) {
      router.replace('/mobile')
    }
    if (window.innerWidth < 600 && isOpen === true) {
      const disableBackground = document.querySelector('section main')
      if (disableBackground) {
        disableBackground.classList.add('invisible')
      }
    } else {
      const disableBackground = document.querySelector('section main')
      if (disableBackground) {
        disableBackground.classList.remove('invisible')
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (response && response.data) {
      setCategoryData(response.data ?? null);
      categoryLoading = response.isLoading;
      categoryError = response.error;
    }
  }, [response]);

  useEffect(() => {
    dispatch(addCategories(categoryData));
  }, [categoryData]);

  useEffect(() => {
    setSize({ width: isOpen ? 298 : 40, height: "auto" });
  }, [isOpen]);

  const [nameCategory, setNameCategory] = useState("");

  useEffect(() => {
    console.log(currentComponent)
  }, [currentComponent])

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
            if (item.id === idCategory) {
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

  const deleteList = async (id: string) => {
    setFastSpin(true);
    if (isNil(id) === true || id.trim() === "") {
      return;
    }
    try {
      const response = await deleteCategoryById(id, {});
      if (isNil(response) == false && isNil(response.data) == false) {
        setCategoryData((prev) => {
          if (!prev) {
            return prev;
          }
          return prev.filter((category) => {
            console.log(response.data, category.id);
            return category.id != response.data._id;
          });
        });
      }
    } catch (error: any) {
      openNotification(
        "error",
        error.message || "ah ocurrido un error intentalo de nuevo"
      );
    } finally {
      setFastSpin(false);
    }
  };

  const handleIconSelection = (iconKey: string, iconColor: string) => {
    const stylesIcon = { class: `fa-solid fa-${iconKey}`, color: iconColor };
    setSelectedIcon(JSON.stringify(stylesIcon));
  };

  const updateCurrentConponent = (component:ReactElement, label:string) => {
    setCurrentComponent(component)
    setLabelCurrentComponent(label)
  }

  useEffect(() => {
    updateCurrentConponent(<PageMyDay
      setCurrentComponent={setCurrentComponent}
      currentComponent={currentComponent}
      setLabelCurrentComponent={setLabelCurrentComponent}
      labelCurrentComponent={labelCurrentComponent}
    />, 'PageMyDay')
  }, [])

  return (
    <div
    style={{
      minWidth: isOpen ? "240px" : "60px",
      maxWidth: isOpen ? "240px" : "2vw",
    }}
      className={
        "flex flex-col px-1 overflow-hidden transition-all duration-200 ease-in-out bg-mainContainers"
      }
    >
      <FastLoader isLoading={fastSpin} />
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
            const elements = document.getElementsByClassName("dashboardClose");
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
        <div style={{ height: "82vh", overflowY: "auto", overflowX: "hidden" }}>
          <nav className="pt-2 pb-4">
            <section
              className="pb-1 mb-2"
              style={{ borderBottom: "1px solid #4b4b4b" }}
            >
              <div
                onClick={(e) => {
                  e.preventDefault();
                  updateCurrentConponent(<PageTask />, 'PageTask');
                }}
                className="col-12 d-block itemDashboard"
                style={
                  labelCurrentComponent == 'PageTask'
                    ? { background: "#393939" }
                    : {}
                }
                // replace
                // href="/task"
              >
                <i className="fas fa-list-check fs-5 text-primary mr-3" />
                <span className="dashboardClose">Tareas</span>
              </div>

              <div
                onClick={(e) => {
                  e.preventDefault();
                  updateCurrentConponent(<PageNote />, 'PageNote');
                }}
                style={
                  labelCurrentComponent == 'PageNote'
                    ? { background: "#393939" }
                    : {}
                }
                className="col-12 d-block itemDashboard"
                // replace
                // href="/note"
              >
                <i className="fas fa-note-sticky fs-5 text-warning mr-3" />
                <span className="dashboardClose">Notas</span>
              </div>
            </section>
            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageMyDay
                setCurrentComponent={setCurrentComponent}
                currentComponent={currentComponent}
                setLabelCurrentComponent={setLabelCurrentComponent}
                labelCurrentComponent={labelCurrentComponent}
              />, 'PageMyDay')
            }}
              style={
                labelCurrentComponent == 'PageMyDay'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/myDay"
            >
              <i className="fas fa-sun text-primary fs-5 mr-3" />
              <span className="dashboardClose">Mi día</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageImportans/>, 'PageImportans')
            }}
              style={
                labelCurrentComponent == 'PageImportans'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/important"
            >
              <i className="fas fa-star fs-5 text-warning mr-3" />
              <span className="dashboardClose">Importantes</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageComplete/>, 'PageComplete')
            }}
              style={
                labelCurrentComponent == 'PageComplete'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/completed"
            >
              <i className="fas fa-circle-check fs-5 text-success mr-3" />
              <span className="dashboardClose">Completadas</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PagePending/>, 'PagePending')
            }}
              style={
                labelCurrentComponent == 'PagePending'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/pending"
            >
              <i className="fas fa-clock text-danger fs-5 mr-3" />
              <span className="dashboardClose">Pendientes</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageReminder
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                setCurrentComponent={setCurrentComponent}
                currentComponent={currentComponent}
                setLabelCurrentComponent={setLabelCurrentComponent}
                labelCurrentComponent={labelCurrentComponent}
              />, 'PageReminder')
            }}
              style={
                labelCurrentComponent == 'PageReminder'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/reminder"
            >
              <i className="fas fa-bookmark fs-5 text-warning mr-3" />
              <span className="dashboardClose">Recordatorios</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageInProgress
                setCurrentComponent={setCurrentComponent}
                currentComponent={currentComponent}
                setLabelCurrentComponent={setLabelCurrentComponent}
                labelCurrentComponent={labelCurrentComponent}
              />, 'PageInProgress')
            }}
              style={
                labelCurrentComponent == 'PageInProgress'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/inProgress"
            >
              <i className="fas fa-bars-progress text-info fs-5 mr-3" />
              <span className="dashboardClose">En curso</span>
            </div>

            <div
            onClick={e => {
              e.preventDefault()
              updateCurrentConponent(<PageDiary
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                setCurrentComponent={setCurrentComponent}
                currentComponent={currentComponent}
                setLabelCurrentComponent={setLabelCurrentComponent}
                labelCurrentComponent={labelCurrentComponent}
                />, 'PageDiary')
            }}
              style={
                labelCurrentComponent == 'PageDiary'
                  ? { background: "#393939" }
                  : {}
              }
              className="col-12 d-block itemDashboard"
              // href="/diary"
            >
              <i className="fas fa-calendar fs-5 text-primary mr-3" />
              <span className="dashboardClose">Agenda</span>
            </div>

            {/* <a href="#" className="block py-1 text-gray-500 hover:underline">
              <i className="fas fa-chalkboard-user fs-5 text-info mr-3" />
              <span className="dashboardClose">Seguimiento</span>
            </a> */}
          </nav>

          <nav className="block text-gray-500">
            <Row className="w-100 m-auto justify-between align-items-center align-content-center mb-2">
              <h2 className="col-auto text-white text-start fs-6 pl-5">
                <span className="dashboardClose">Mis listas</span>
              </h2>
              <i className="col-4 dashboardClose fas fa-list text-end p-0 text-primary mr-2" />
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
                  <span
                    key={element.id}
                    onClick={() => {
                      setCurrentComponent(<PageCategory
                        idProps={element.id}
                        setCurrentComponent={setCurrentComponent}
                currentComponent={currentComponent}
                setLabelCurrentComponent={setLabelCurrentComponent}
                labelCurrentComponent={labelCurrentComponent}
                        />)
                      setLabelCurrentComponent('PageCategory')
                    }}
                  >
                    <a
                      style={currentComponent?.props.idProps == element.id ? { background: "#393939" } : {}}
                      href="#"
                      className="block listUser py-1 text-gray-500 "
                    >
                      <Row className="relative">
                        {editingId === element.id ? (
                          <>
                            <div className="col-2 mr-2 align-items-center">
                              <IconSelector
                                onIconClick={handleIconSelection}
                                defaultIcon={element.styles ?? ""}
                              />
                            </div>
                            <Input
                              placeholder="Nombre"
                              className="col-5 inputAddList bg-none h-25"
                              defaultValue={element.name}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateCategoryfn(element.id, element.styles);
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
                            <p className="col-6 dashboardClose m-0">
                              {element.name}
                            </p>
                          </>
                        )}
                        {isOpen === true && (
                          <span
                            style={{ display: "inline-flex", fontSize: 14 }}
                            className="col-auto absolute top-3 right-4 align-items-center justify-items-end m-0 p-0"
                          >
                            <i
                              onClick={() => {
                                editingId !== element.id
                                  ? setEditingId(element.id)
                                  : setEditingId(" ");

                                setNameCategoryToUpdate(element.name);
                              }}
                              className={`fas  ${
                                editingId !== element.id
                                  ? "fa-pen-to-square text-primary"
                                  : "fa-xmark text-danger"
                              } text-end ml-2 mr-1 ${
                                isOpen ? "ocult" : "dashboardClose"
                              } `}
                            />
                            {editingId !== element.id ? (
                              <i
                                onClick={(e) => deleteList(element.id)}
                                className={`fas  fa-trash text-end  text-danger ml-2 mr-1 ${
                                  isOpen ? "ocult" : "dashboardClose"
                                } `}
                              />
                            ) : (
                              <i
                                onClick={(e) =>
                                  updateCategoryfn(element.id, element.styles)
                                }
                                className={`fas  fa-check text-end  text-success ml-2 mr-1 ${
                                  isOpen ? "ocult" : "dashboardClose"
                                } `}
                              />
                            )}
                          </span>
                        )}
                      </Row>
                    </a>
                  </span>
                );
              })}

            {isEditcustomList && (
              <Spin spinning={isLoadingAddCategory}>
                <a className="block py-1 text-gray-500">
                  <Row className="justify-left w-100 align-items-center align-content-center">
                    <div className="col-auto pr-1">
                      <IconSelector onIconClick={handleIconSelection} />
                    </div>
                    <Input
                      placeholder="Nombre"
                      value={nameCategory}
                      className="col-7 inputAddList bg-none h-25"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addCategory();
                        }
                      }}
                      onChange={(e) => {
                        setNameCategory(e.target.value);
                      }}
                    />

                    <i
                      onClick={(e) => {
                        setIsEditcustomList(!isEditcustomList);
                        setNameCategory("");
                      }}
                      className="fas col-auto fa-xmark text-danger ml-2 mr-2 p-0 "
                    ></i>
                    <i
                      onClick={(e) => addCategory()}
                      className="fas col-auto fa-check text-success m-0 p-0 "
                    ></i>
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

                <p className="dashboardClose m-0" style={{ fontSize: 13 }}>
                  Agregar lista
                </p>
              </div>

              {/* <i className="fas dashboardClose fa-pen-to-square text-end text-primar ml-2 mr-1"></i> */}
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
    </div>
  );
};

export default Dashboard;
