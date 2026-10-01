import { Link } from "react-router-dom";

const grupos = [
  {
    titulo: "Bar",
    items: [
      { to: "/barra", label: "Barra — bajada diaria", icon: "🍹" },
    ],
  },
  {
    titulo: "Operación",
    items: [
      { to: "/asignacion", label: "Asignación de áreas", icon: "🗺️" },
      { to: "/checklists", label: "Checklists apertura/cierre", icon: "📋" },
      { to: "/incidencias", label: "Incidencias", icon: "⚠️" },
      { to: "/evidencias", label: "Fotos y evidencias", icon: "📷" },
    ],
  },
  {
    titulo: "Instalaciones",
    items: [
      { to: "/mantenimiento", label: "Mantenimiento y temperaturas", icon: "🔧" },
      { to: "/tecnicos", label: "Técnicos y proveedores", icon: "🧰" },
    ],
  },
  {
    titulo: "Inventarios",
    items: [
      { to: "/inventarios-generales", label: "Material, platos, vasos y más", icon: "📦" },
    ],
  },
  {
    titulo: "Clientes",
    items: [
      { to: "/reservaciones", label: "Reservaciones", icon: "📅" },
      { to: "/quejas", label: "Quejas de clientes", icon: "💬" },
      { to: "/facturas", label: "Facturas", icon: "🧾" },
    ],
  },
  {
    titulo: "Equipo",
    items: [
      { to: "/capacitacion", label: "Capacitación y desempeño", icon: "🎓" },
    ],
  },
  {
    titulo: "Comunicación",
    items: [
      { to: "/avisos", label: "Avisos y juntas", icon: "📢" },
      { to: "/notificaciones", label: "Notificaciones", icon: "🔔" },
    ],
  },
  {
    titulo: "Datos",
    items: [
      { to: "/historial", label: "Historial global", icon: "🕘" },
      { to: "/reportes", label: "Reportes", icon: "📊" },
      { to: "/importar-excel", label: "Importar Excel", icon: "📥" },
    ],
  },
];

export default function Mas() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Más módulos</h1>
      </div>

      {grupos.map((g) => (
        <div key={g.titulo}>
          <p className="text-sm font-medium text-gray-700 mb-2">{g.titulo}</p>
          <div className="flex flex-col gap-2">
            {g.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
