import React, { memo, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const TransaccionItem = memo(({
  transaccion,
  onUpdate,
  onDelete,
  categoriasGastos,
  categoriasIngresos,
  categoriasDeudas,
  inputBg,
  borderColor,
  modoOscuro,
  textSecondary,
  formatearMoneda,
  calcularTotalDeuda
}) => {
  const t = transaccion;

  // Estado local para evitar que el padre re-renderice mientras escribes
  const [localConcepto, setLocalConcepto] = useState(t.concepto || '');
  const [localMonto, setLocalMonto] = useState(t.monto || '');
  const [localInteres, setLocalInteres] = useState(t.interes || '');
  const [localFecha, setLocalFecha] = useState(t.fecha || '');

  // Sincronizar estado local si el padre cambia (por ejemplo, al cargar datos)
  useEffect(() => {
    setLocalConcepto(t.concepto || '');
    setLocalMonto(t.monto || '');
    setLocalInteres(t.interes || '');
    setLocalFecha(t.fecha || '');
  }, [t.concepto, t.monto, t.interes, t.fecha, t.id]); // Sincronizar cuando cambien los valores

  return (
    <div className={`p-3 rounded-lg border ${borderColor} ${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
      {/* Primera fila: Fecha, Tipo y Categoría */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="date"
          value={localFecha}
          onChange={(e) => setLocalFecha(e.target.value)}
          onBlur={(e) => onUpdate(t.id, 'fecha', e.target.value)}
          className={`w-32 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
          style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
        />

        <select
          value={t.tipo || 'gasto'}
          onChange={(e) => onUpdate(t.id, 'tipo', e.target.value)}
          className={`w-24 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
          style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
        >
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
          <option value="deuda">Deuda</option>
        </select>

        <select
          value={t.categoria || 'casa'}
          onChange={(e) => onUpdate(t.id, 'categoria', e.target.value)}
          className={`flex-1 min-w-0 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
          style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
        >
          {t.tipo === 'gasto'
            ? Object.entries(categoriasGastos).filter(([k]) => k !== 'personalizada').map(([key, nombre]) => (
                <option key={key} value={key}>{nombre}</option>
              ))
            : t.tipo === 'ingreso'
            ? Object.entries(categoriasIngresos).filter(([k]) => k !== 'personalizada').map(([key, nombre]) => (
                <option key={key} value={key}>{nombre}</option>
              ))
            : Object.entries(categoriasDeudas).filter(([k]) => k !== 'personalizada').map(([key, nombre]) => (
                <option key={key} value={key}>{nombre}</option>
              ))
          }
        </select>

        <button
          onClick={() => onDelete(t.id)}
          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Segunda fila: Concepto, Monto e Interés */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={localConcepto}
          onChange={(e) => setLocalConcepto(e.target.value)}
          onBlur={(e) => onUpdate(t.id, 'concepto', e.target.value)}
          placeholder="Concepto"
          className={`flex-1 min-w-0 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
          style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
        />

        <input
          type="number"
          inputMode="decimal"
          value={localMonto}
          onChange={(e) => setLocalMonto(e.target.value)}
          onBlur={(e) => onUpdate(t.id, 'monto', e.target.value)}
          placeholder="Monto"
          min="0"
          step="0.01"
          className={`w-24 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
          style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
        />

        {t.tipo === 'deuda' && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="decimal"
              value={localInteres}
              onChange={(e) => setLocalInteres(e.target.value)}
              onBlur={(e) => onUpdate(t.id, 'interes', e.target.value)}
              placeholder="Interés %"
              min="0"
              max="300"
              step="0.1"
              className={`w-20 px-2 py-1.5 border rounded text-xs ${inputBg} ${modoOscuro ? 'text-white' : 'text-gray-900'}`}
              style={{ WebkitTextFillColor: modoOscuro ? 'white' : '#111827', opacity: 1 }}
              title="Porcentaje de interés (0-300%)"
            />
            <span className={`text-xs ${textSecondary}`}>%</span>
          </div>
        )}

        {t.tipo === 'deuda' && localMonto > 0 && (
          <div className={`px-2 py-1.5 rounded text-xs font-semibold ${modoOscuro ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'} whitespace-nowrap`}>
            Total: {formatearMoneda(calcularTotalDeuda(localMonto, localInteres))}
          </div>
        )}
      </div>

      {t.tipo === 'deuda' && (
        <div className={`mt-2 text-xs ${textSecondary} flex items-center gap-1`}>
          <span>💡</span>
          <span>El interés se suma automáticamente al monto de la deuda</span>
        </div>
      )}
    </div>
  );
});

TransaccionItem.displayName = 'TransaccionItem';

export default TransaccionItem;
