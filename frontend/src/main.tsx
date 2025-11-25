// =========================================================================
// 1. Imports principais
// =========================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import { AuthProvider } from "./hooks/LoginHooks";
import App from "./App";

// =========================================================================
// 2. Tema Hogwarts
// =========================================================================
const hogwartsTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#740001" },
    secondary: { main: "#D3A625" },
    background: {
      default: "#0e0e0e",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#d3d3d3",
    },
  },
  typography: {
    fontFamily: `"Cinzel", serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    button: { textTransform: "none" },
  },
});

// =========================================================================
// 3. Renderização do App
// =========================================================================
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={hogwartsTheme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
