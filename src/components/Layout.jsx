import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/mi-turno", label: "Mi turno", icon: "🕐" },
  { to: "/personal", label: "Personal", icon: "👥" },
  { to: "/cerveza", label: "Cerveza", icon: "🍺" },
  { to: "/postres", label: "Postres", icon: "🍰" },
  { to: "/mas", label: "Más", icon: "⋯" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — escritorio */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-gray-100 bg-white p-4">
        <p className="font-semibold text-lg mb-6 px-2">🌶️ Chilli Wings OS</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 pb-24 md:pb-8">{children}</main>

        {/* Barra inferior — móvil */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs gap-0.5 px-2 py-1 ${
                  isActive ? "text-orange-700" : "text-gray-500"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
