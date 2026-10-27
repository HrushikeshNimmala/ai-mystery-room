
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import InvestigationRoom from "./pages/InvestigationRoom";

function Placeholder() {
  return <div className="p-8 text-white">Loading investigation...</div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/case/:id"
          element={<InvestigationRoom />}
        />
        <Route path="*" element={<Placeholder />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
