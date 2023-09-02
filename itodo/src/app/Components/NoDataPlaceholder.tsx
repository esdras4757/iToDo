import React from "react";
import { Row } from "react-bootstrap";

const NoDataPlaceholder = () => {
  return (
    <Row className="justify-center align-content-center">
      <div className="col-12 row justify-content-center text-center">
        {" "}
        <img src="/images/folderEmpty.png" style={{ width: "110px" }} alt="" />
      </div>
      <p className="text-center w-auto" 
      style={{padding:8,borderRadius:7,backgroundColor:'rgb(16 72 121 / 60%)',fontSize:15}}
      >
        No se han encontrado datos para mostrar aquí.
      </p>
    </Row>
  );
};

export default NoDataPlaceholder;
