
import "./styles/features/leaves.css";
import "./styles/features/payroll.css";
import "./styles/features/salary-slips.css";
import "./styles/features/notifications.css";
import "./styles/features/reports.css";
import "./styles/features/audit-logs.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

