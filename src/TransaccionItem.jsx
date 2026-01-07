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
  }, [t.id]); // Solo cuando cambia la transacción completa, no en cada campo

  return (
    <div className={`p-4 rounded-xl border-2 ${borderColor} ${modoOscuro ? 'bg-slate-700/40' : 'bg-white'} shadow-sm`}>
      {/* Header con tipo y botón eliminar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
            Tipo de Transacción
          </label>
          <select
            value={t.tipo || 'gasto'}
            onChange={(e) => onUpdate(t.id, 'tipo', e.target.value)}
            className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm font-medium ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="gasto">💸 Gasto</option>
            <option value="ingreso">💰 Ingreso</option>
            <option value="deuda">📋 Deuda</option>
          </select>
        </div>
        <button
          onClick={() => onDelete(t.id)}
          className="ml-3 p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
          title="Eliminar transacción"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Categoría */}
      <div className="mb-3">
        <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
          Categoría
        </label>
        <select
          value={t.categoria || 'casa'}
          onChange={(e) => onUpdate(t.id, 'categoria', e.target.value)}
          className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
      </div>

      {/* Concepto */}
      <div className="mb-3">
        <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
          Concepto / Descripción
        </label>
        <input
          type="text"
          value={localConcepto}
          onChange={(e) => setLocalConcepto(e.target.value)}
          onBlur={(e) => onUpdate(t.id, 'concepto', e.target.value)}
          placeholder="Ej: Supermercado, Salario, etc."
          className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>

      {/* Fecha y Monto en 2 columnas */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
            Fecha
          </label>
          <input
            type="date"
            value={localFecha}
            onChange={(e) => setLocalFecha(e.target.value)}
            onBlur={(e) => onUpdate(t.id, 'fecha', e.target.value)}
            className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
            Monto ($)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={localMonto}
            onChange={(e) => setLocalMonto(e.target.value)}
            onBlur={(e) => onUpdate(t.id, 'monto', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>
      </div>

      {/* Interés (solo para deudas) */}
      {t.tipo === 'deuda' && (
        <>
          <div className="mb-3">
            <label className={`block text-xs font-semibold ${textSecondary} mb-1.5`}>
              Tasa de Interés (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={localInteres}
              onChange={(e) => setLocalInteres(e.target.value)}
              onBlur={(e) => onUpdate(t.id, 'interes', e.target.value)}
              placeholder="0.0"
              min="0"
              max="300"
              step="0.1"
              className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm ${inputBg} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>

          {/* Total con interés */}
          {localMonto > 0 && (
            <div className={`p-3 rounded-lg ${modoOscuro ? 'bg-yellow-900/30' : 'bg-yellow-50'} border-2 ${modoOscuro ? 'border-yellow-700' : 'border-yellow-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${modoOscuro ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  Total con Interés:
                </span>
                <span className={`text-lg font-bold ${modoOscuro ? 'text-yellow-300' : 'text-yellow-900'}`}>
                  {formatearMoneda(calcularTotalDeuda(localMonto, localInteres))}
                </span>
              </div>
              <p className={`text-xs mt-1 ${modoOscuro ? 'text-yellow-500' : 'text-yellow-700'}`}>
                💡 Monto original: {formatearMoneda(localMonto)} + Interés {localInteres || 0}%
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
});

TransaccionItem.displayName = 'TransaccionItem';

export default TransaccionItem;
