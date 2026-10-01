import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra el service worker — necesario para poder mostrar notificaciones
// reales del sistema operativo (pantalla de bloqueo / centro de notificaciones),
// no solo alertas dentro de la app.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // si falla (ej. navegador viejo), la app sigue funcionando normal,
      // solo sin notificaciones push
    });
  });
}
