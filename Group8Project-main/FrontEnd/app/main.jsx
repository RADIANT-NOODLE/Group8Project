import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";


const rootElement =
    document.getElementById("root");


if (!rootElement) {

    throw new Error(
        "VALORA could not find the root element."
    );
}


createRoot(
    rootElement
).render(

    <React.StrictMode>

        <App />

    </React.StrictMode>
);






