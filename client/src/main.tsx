import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { UserContext } from "./context/UserContext";

const email = ""; // You can set this from login or Home page

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContext.Provider value={{ email }}>
        <App />
      </UserContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);
