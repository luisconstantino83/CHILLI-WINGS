import { useNotificaciones } from "../context/NotificacionesContext";

const tipoNotifStyles = {
  urgente: { icon: "🔴" },
  importante: { icon: "🟠" },
  recordatorio: { icon: "🟡" },
  informacion: { icon: "🔵" },
  completado: { icon: "🟢" },
};

export default function Notificaciones() {
  const { permiso, pedirPermiso, historial } = useNotificaciones();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-gray-500">Sucursal Centro</p>
        <h1 className="text-xl font-semibold">Notificaciones</h1>
      </div>

      {permiso === "unsupported" && (
        <div className="bg-gray-50 text-gray-600 rounded-xl p-3 text-sm">
          Tu navegador no soporta notificaciones push.
        </div>
      )}

      {permiso === "default" && (
        <div className="bg-amber-50 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm text-amber-800 font-medium">
            🔔 Activa las notificaciones para recibir avisos reales en tu celular
          </p>
          <p className="text-xs text-amber-700">
            Reservaciones próximas, recordatorios de pedido de cerveza y más — aunque tengas
            la app en segundo plano.
          </p>
          <button
            onClick={pedirPermiso}
            className="bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl self-start px-4"
          >
            Activar notificaciones
          </button>
        </div>
      )}

      {permiso === "denied" && (
        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
          Bloqueaste las notificaciones para esta app. Actívalas desde los ajustes de tu
          navegador (ícono de 🔒 o ⓘ junto a la dirección) para recibir avisos.
        </div>
      )}

      {permiso === "granted" && (
        <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm">
          ✅ Notificaciones activadas — te avisaremos de reservaciones próximas y pedidos de cerveza.
        </div>
      )}

      {historial.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 bg-white rounded-xl border border-gray-100">
          Sin notificaciones todavía — aquí aparecerán las alertas urgentes e importantes
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {historial.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-2">
              <span>{tipoNotifStyles[n.tipo]?.icon || "🔵"}</span>
              <div>
                <p className="text-sm text-gray-800">{n.texto}</p>
                <p className="text-xs text-gray-400">{n.fecha}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Las notificaciones aparecen mientras la app esté abierta (puede estar en segundo
        plano). Para mejores resultados, agrega la app a tu pantalla de inicio.
      </p>
    </div>
  );
}
