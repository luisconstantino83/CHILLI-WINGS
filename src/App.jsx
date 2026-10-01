import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ReservacionesProvider } from "./context/ReservacionesContext";
import { NotificacionesProvider } from "./context/NotificacionesContext";
import Dashboard from "./pages/Dashboard";
import MiTurno from "./pages/MiTurno";
import Personal from "./pages/Personal";
import Cerveza from "./pages/Cerveza";
import Barra from "./pages/Barra";
import Mas from "./pages/Mas";
import Asignacion from "./pages/Asignacion";
import Checklists from "./pages/Checklists";
import Incidencias from "./pages/Incidencias";
import Mantenimiento from "./pages/Mantenimiento";
import Reservaciones from "./pages/Reservaciones";
import Quejas from "./pages/Quejas";
import Facturas from "./pages/Facturas";
import Capacitacion from "./pages/Capacitacion";
import Tecnicos from "./pages/Tecnicos";
import Avisos from "./pages/Avisos";
import Notificaciones from "./pages/Notificaciones";
import Evidencias from "./pages/Evidencias";
import ImportarExcel from "./pages/ImportarExcel";
import HistorialGlobal from "./pages/HistorialGlobal";
import Reportes from "./pages/Reportes";
import Postres from "./pages/Postres";
import InventariosGenerales from "./pages/InventariosGenerales";

export default function App() {
  return (
    <ReservacionesProvider>
      <NotificacionesProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mi-turno" element={<MiTurno />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/cerveza" element={<Cerveza />} />
          <Route path="/barra" element={<Barra />} />
          <Route path="/mas" element={<Mas />} />
          <Route path="/asignacion" element={<Asignacion />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/incidencias" element={<Incidencias />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
          <Route path="/reservaciones" element={<Reservaciones />} />
          <Route path="/quejas" element={<Quejas />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/capacitacion" element={<Capacitacion />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/evidencias" element={<Evidencias />} />
          <Route path="/importar-excel" element={<ImportarExcel />} />
          <Route path="/historial" element={<HistorialGlobal />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/postres" element={<Postres />} />
          <Route path="/inventarios-generales" element={<InventariosGenerales />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </NotificacionesProvider>
    </ReservacionesProvider>
  );
}
