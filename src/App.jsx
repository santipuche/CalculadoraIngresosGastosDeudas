import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, PieChart, Moon, Sun, RotateCcw } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function PresupuestoMensual() {
  // Función para formatear números en formato argentino/latinoamericano
  const formatearMoneda = (numero) => {
    const partes = Number(numero).toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    return `$${entero},${decimal}`;
  };

  // Cargar datos desde el almacenamiento al iniciar
  const [transacciones, setTransacciones] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar transacciones
        const resultadoTransacciones = await window.storage.get('transacciones');
        if (resultadoTransacciones && resultadoTransacciones.value) {
          const transaccionesCargadas = JSON.parse(resultadoTransacciones.value);
          // Asignar IDs únicos a transacciones que no los tengan (migración)
          const transaccionesConId = transaccionesCargadas.map((t, index) => ({
            ...t,
            id: t.id || Date.now() + index + Math.random()
          }));
          setTransacciones(transaccionesConId);
        }

        // Cargar preferencia de modo oscuro
        const resultadoModo = await window.storage.get('modoOscuro');
        if (resultadoModo && resultadoModo.value) {
          setModoOscuro(JSON.parse(resultadoModo.value));
        }
      } catch (error) {
        console.log('Primera vez usando la app o error al cargar:', error);
        // Si es la primera vez, los valores ya están en 0 por defecto
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Guardar transacciones automáticamente cada vez que cambien
  useEffect(() => {
    if (!cargando && transacciones.length >= 0) {
      const guardarTransacciones = async () => {
        try {
          await window.storage.set('transacciones', JSON.stringify(transacciones));
        } catch (error) {
          console.error('Error al guardar transacciones:', error);
        }
      };
      guardarTransacciones();
    }
  }, [transacciones, cargando]);

  // Guardar modo oscuro automáticamente
  useEffect(() => {
    if (!cargando) {
      const guardarModo = async () => {
        try {
          await window.storage.set('modoOscuro', JSON.stringify(modoOscuro));
        } catch (error) {
          console.error('Error al guardar modo oscuro:', error);
        }
      };
      guardarModo();
    }
  }, [modoOscuro, cargando]);

  const categoriasGastos = {
    casa: 'Casa',
    entretenimiento: 'Entretenimiento',
    transporte: 'Transporte',
    tarjetas: 'Tarjetas y Préstamos',
    alimento: 'Alimento',
    impuestos: 'Impuestos',
    cuidadoPersonal: 'Cuidado Personal',
    varios: 'Varios',
    seguros: 'Seguros',
    ahorros: 'Ahorros',
    personalizada: '+ Agregar categoría personalizada'
  };

  const categoriasIngresos = {
    salario: 'Salario',
    freelance: 'Freelance',
    inversiones: 'Inversiones',
    alquiler: 'Alquiler',
    negocio: 'Negocio',
    bonos: 'Bonos',
    otros: 'Otros',
    personalizada: '+ Agregar categoría personalizada'
  };

  const categoriasDeudas = {
    prestamo: 'Préstamo Personal',
    hipoteca: 'Hipoteca',
    tarjetaCredito: 'Tarjeta de Crédito',
    prestamoCoche: 'Préstamo de Coche',
    estudiante: 'Préstamo Estudiantil',
    familiar: 'Deuda Familiar',
    otros: 'Otros',
    personalizada: '+ Agregar categoría personalizada'
  };

  const agregarTransaccion = () => {
    const hoy = new Date().toISOString().split('T')[0];
    setTransacciones([...transacciones, {
      id: Date.now() + Math.random(), // ID único para cada transacción
      tipo: 'gasto',
      categoria: 'casa',
      concepto: '',
      monto: 0,
      interes: 0, // Solo se usa cuando tipo es 'deuda'
      fecha: hoy
    }]);
  };

  const eliminarTransaccion = (id) => {
    setTransacciones(transacciones.filter(t => t.id !== id));
  };

  const reiniciar = async () => {
    setTransacciones([]);
    setMostrarConfirmacion(false);
    // Limpiar el almacenamiento
    try {
      await window.storage.delete('transacciones');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  };

  const actualizarTransaccion = (id, campo, valor) => {
    const nuevas = transacciones.map(t => {
      if (t.id !== id) return t;

      const actualizada = { ...t };

      if (campo === 'monto') {
        // Validar que no sea negativo
        const montoValor = parseFloat(valor) || 0;
        actualizada[campo] = montoValor >= 0 ? montoValor : 0;
      } else if (campo === 'interes') {
        // Validar rango de interés: 0-300%
        let interesValor = parseFloat(valor) || 0;
        if (interesValor < 0) interesValor = 0;
        if (interesValor > 300) interesValor = 300;
        actualizada[campo] = interesValor;
      } else if (campo === 'tipo') {
        actualizada[campo] = valor;
        // Resetear interés cuando no es deuda
        if (valor !== 'deuda') {
          actualizada.interes = 0;
        }
        // Asignar categoría por defecto según tipo
        if (valor === 'gasto') {
          actualizada.categoria = 'casa';
        } else if (valor === 'ingreso') {
          actualizada.categoria = 'salario';
        } else if (valor === 'deuda') {
          actualizada.categoria = 'prestamo';
        }
      } else if (campo === 'categoria' && valor === 'personalizada') {
        // Si selecciona personalizada, habilitar modo edición
        actualizada.categoriaPersonalizada = true;
        actualizada[campo] = '';
      } else if (campo === 'categoriaTexto') {
        // Actualizar el texto de categoría personalizada
        actualizada.categoria = valor;
      } else {
        actualizada[campo] = valor;
      }

      return actualizada;
    });

    setTransacciones(nuevas);
  };

  // Función para calcular el total de una deuda con interés
  const calcularTotalDeuda = (monto, interes) => {
    const montoBase = parseFloat(monto) || 0;
    const porcentajeInteres = parseFloat(interes) || 0;
    return montoBase + (montoBase * porcentajeInteres / 100);
  };

  const totalIngresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalGastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalDeudas = transacciones
    .filter(t => t.tipo === 'deuda')
    .reduce((sum, t) => {
      // Para deudas, usar el monto con interés calculado
      return sum + calcularTotalDeuda(t.monto, t.interes);
    }, 0);

  const diferencia = totalIngresos - totalGastos - totalDeudas;

  const COLORES_GASTOS = [
    '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#b91c1c',
    '#991b1b', '#7f1d1d', '#fee2e2', '#fecaca', '#dc2626'
  ];

  const COLORES_INGRESOS = [
    '#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7',
    '#a7f3d0', '#d1fae5'
  ];

  const COLORES_DEUDAS = [
    '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#b45309',
    '#92400e', '#78350f'
  ];

  const gastosPorCategoria = Object.entries(categoriasGastos)
    .filter(([key]) => key !== 'personalizada') // Excluir la opción de personalizada
    .map(([key, nombre], index) => {
      const total = transacciones
        .filter(t => t.tipo === 'gasto' && t.categoria === key)
        .reduce((sum, t) => sum + t.monto, 0);
      return {
        name: nombre,
        value: total,
        color: COLORES_GASTOS[index],
        key: key
      };
    })
    .filter(item => item.value > 0);

  // Agregar categorías personalizadas de gastos
  const gastosPersonalizados = transacciones
    .filter(t => t.tipo === 'gasto' && t.categoriaPersonalizada && t.categoria)
    .reduce((acc, t) => {
      const existing = acc.find(item => item.key === t.categoria);
      if (existing) {
        existing.value += t.monto;
      } else {
        acc.push({
          name: t.categoria,
          value: t.monto,
          color: COLORES_GASTOS[acc.length % COLORES_GASTOS.length],
          key: t.categoria
        });
      }
      return acc;
    }, []);

  const todosLosGastos = [...gastosPorCategoria, ...gastosPersonalizados];

  const ingresosPorCategoria = Object.entries(categoriasIngresos)
    .filter(([key]) => key !== 'personalizada') // Excluir la opción de personalizada
    .map(([key, nombre], index) => {
      const total = transacciones
        .filter(t => t.tipo === 'ingreso' && t.categoria === key)
        .reduce((sum, t) => sum + t.monto, 0);
      return {
        name: nombre,
        value: total,
        color: COLORES_INGRESOS[index],
        key: key
      };
    })
    .filter(item => item.value > 0);

  // Agregar categorías personalizadas de ingresos
  const ingresosPersonalizados = transacciones
    .filter(t => t.tipo === 'ingreso' && t.categoriaPersonalizada && t.categoria)
    .reduce((acc, t) => {
      const existing = acc.find(item => item.key === t.categoria);
      if (existing) {
        existing.value += t.monto;
      } else {
        acc.push({
          name: t.categoria,
          value: t.monto,
          color: COLORES_INGRESOS[acc.length % COLORES_INGRESOS.length],
          key: t.categoria
        });
      }
      return acc;
    }, []);

  const todosLosIngresos = [...ingresosPorCategoria, ...ingresosPersonalizados];

  const deudasPorCategoria = Object.entries(categoriasDeudas)
    .filter(([key]) => key !== 'personalizada') // Excluir la opción de personalizada
    .map(([key, nombre], index) => {
      const total = transacciones
        .filter(t => t.tipo === 'deuda' && t.categoria === key)
        .reduce((sum, t) => sum + calcularTotalDeuda(t.monto, t.interes), 0);
      return {
        name: nombre,
        value: total,
        color: COLORES_DEUDAS[index],
        key: key
      };
    })
    .filter(item => item.value > 0);

  // Agregar categorías personalizadas de deudas
  const deudasPersonalizadas = transacciones
    .filter(t => t.tipo === 'deuda' && t.categoriaPersonalizada && t.categoria)
    .reduce((acc, t) => {
      const existing = acc.find(item => item.key === t.categoria);
      if (existing) {
        existing.value += calcularTotalDeuda(t.monto, t.interes);
      } else {
        acc.push({
          name: t.categoria,
          value: calcularTotalDeuda(t.monto, t.interes),
          color: COLORES_DEUDAS[acc.length % COLORES_DEUDAS.length],
          key: t.categoria
        });
      }
      return acc;
    }, []);

  const todasLasDeudas = [...deudasPorCategoria, ...deudasPersonalizadas];

  // Clases de color dinámicas
  const bgPrimary = modoOscuro ? 'bg-slate-900' : 'bg-slate-50';
  const bgSecondary = modoOscuro ? 'bg-slate-800' : 'bg-white';
  const textPrimary = modoOscuro ? 'text-slate-100' : 'text-slate-800';
  const textSecondary = modoOscuro ? 'text-slate-300' : 'text-slate-600';
  const borderColor = modoOscuro ? 'border-slate-700' : 'border-slate-200';
  const inputBg = modoOscuro ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300';

  // Mostrar indicador de carga
  if (cargando) {
    return (
      <div className={`min-h-screen ${bgPrimary} flex items-center justify-center`}>
        <div className={`text-center ${textPrimary}`}>
          <DollarSign className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-600" />
          <p className="text-xl font-semibold">Cargando tu presupuesto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrimary} p-3 sm:p-4 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* Título Principal */}
        <div className="text-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Logo Calculadora de Ingresos, Costos y Deudas"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-2`}>
            Calculadora de Ingresos, Costos y Deudas
          </h1>
          <p className={`${textSecondary} text-sm sm:text-base`}>
            Administra tus finanzas personales de forma simple y efectiva
          </p>
        </div>

        {/* Modal de Confirmación */}
        {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${bgSecondary} rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-3`}>¿Reiniciar todos los datos?</h3>
              <p className={`${textSecondary} mb-6`}>Esta acción eliminará todas las transacciones y no se puede deshacer.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setMostrarConfirmacion(false)}
                  className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} hover:bg-slate-100 dark:hover:bg-slate-700 transition`}
                >
                  Cancelar
                </button>
                <button
                  onClick={reiniciar}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Sí, reiniciar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header con toggle modo oscuro y reiniciar */}
        <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
              <DollarSign className="text-blue-600" />
              Resumen General
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarConfirmacion(true)}
                className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                title="Reiniciar todo"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={() => setModoOscuro(!modoOscuro)}
                className={`p-2 rounded-lg ${modoOscuro ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-700'} hover:opacity-80 transition`}
              >
                {modoOscuro ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border-2 border-green-200 dark:border-green-700">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Ingresos</p>
              <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{formatearMoneda(totalIngresos)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl border-2 border-red-200 dark:border-red-700">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">Gastos</p>
              <p className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-300">{formatearMoneda(totalGastos)}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-700">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Deudas</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-800 dark:text-yellow-300">{formatearMoneda(totalDeudas)}</p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${diferencia >= 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'}`}>
              <p className={`text-sm font-medium ${diferencia >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'}`}>Balance</p>
              <p className={`text-xl sm:text-2xl font-bold ${diferencia >= 0 ? 'text-blue-800 dark:text-blue-300' : 'text-orange-800 dark:text-orange-300'}`}>{formatearMoneda(diferencia)}</p>
            </div>
          </div>
        </div>

        {/* Registrar Transacción - Lista Compacta */}
        <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary}`}>Transacciones</h2>
            <button
              onClick={agregarTransaccion}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <PlusCircle size={18} />
              Agregar
            </button>
          </div>

          {/* Contenedor con scroll limitado */}
          <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
            {transacciones.map((t) => (
              <div key={t.id} className={`p-3 rounded-lg border ${borderColor} ${modoOscuro ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                {/* Primera fila: Fecha, Tipo y Categoría */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="date"
                    value={t.fecha || ''}
                    onChange={(e) => actualizarTransaccion(t.id, 'fecha', e.target.value)}
                    className={`w-32 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                  />

                  <select
                    value={t.tipo || 'gasto'}
                    onChange={(e) => actualizarTransaccion(t.id, 'tipo', e.target.value)}
                    className={`w-24 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                  >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="deuda">Deuda</option>
                  </select>

                  {/* Categoría: Select o Input según si es personalizada */}
                  {t.categoriaPersonalizada ? (
                    <input
                      type="text"
                      placeholder="Escribe tu categoría"
                      value={t.categoria || ''}
                      onChange={(e) => actualizarTransaccion(t.id, 'categoriaTexto', e.target.value)}
                      onBlur={() => {
                        // Al salir del campo, si está vacío, volver al select
                        if (!t.categoria) {
                          const nuevas = transacciones.map(trans =>
                            trans.id === t.id
                              ? { ...trans, categoriaPersonalizada: false, categoria: t.tipo === 'gasto' ? 'casa' : t.tipo === 'ingreso' ? 'salario' : 'prestamo' }
                              : trans
                          );
                          setTransacciones(nuevas);
                        }
                      }}
                      className={`flex-1 min-w-0 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                      autoFocus
                    />
                  ) : (
                    <select
                      value={t.categoria || 'casa'}
                      onChange={(e) => actualizarTransaccion(t.id, 'categoria', e.target.value)}
                      className={`flex-1 min-w-0 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                    >
                      {t.tipo === 'gasto'
                        ? Object.entries(categoriasGastos).map(([key, nombre]) => (
                            <option key={key} value={key}>{nombre}</option>
                          ))
                        : t.tipo === 'ingreso'
                        ? Object.entries(categoriasIngresos).map(([key, nombre]) => (
                            <option key={key} value={key}>{nombre}</option>
                          ))
                        : Object.entries(categoriasDeudas).map(([key, nombre]) => (
                            <option key={key} value={key}>{nombre}</option>
                          ))
                      }
                    </select>
                  )}

                  <button
                    onClick={() => eliminarTransaccion(t.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Segunda fila: Concepto, Monto e Interés (si es deuda) */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Concepto"
                    value={t.concepto || ''}
                    onChange={(e) => actualizarTransaccion(t.id, 'concepto', e.target.value)}
                    className={`flex-1 min-w-0 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                  />

                  <input
                    type="number"
                    placeholder="Monto"
                    value={t.monto || ''}
                    onChange={(e) => actualizarTransaccion(t.id, 'monto', e.target.value)}
                    min="0"
                    step="0.01"
                    className={`w-24 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                  />

                  {/* Campo de Interés - Solo visible para deudas */}
                  {t.tipo === 'deuda' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Interés %"
                        value={t.interes || ''}
                        onChange={(e) => actualizarTransaccion(t.id, 'interes', e.target.value)}
                        min="0"
                        max="300"
                        step="0.1"
                        className={`w-20 px-2 py-1.5 border rounded text-xs ${inputBg}`}
                        title="Porcentaje de interés (0-300%)"
                      />
                      <span className={`text-xs ${textSecondary}`}>%</span>
                    </div>
                  )}

                  {/* Total calculado - Solo visible para deudas */}
                  {t.tipo === 'deuda' && t.monto > 0 && (
                    <div className={`px-2 py-1.5 rounded text-xs font-semibold ${modoOscuro ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'} whitespace-nowrap`}>
                      Total: {formatearMoneda(calcularTotalDeuda(t.monto, t.interes))}
                    </div>
                  )}
                </div>

                {/* Ayuda contextual para deudas */}
                {t.tipo === 'deuda' && (
                  <div className={`mt-2 text-xs ${textSecondary} flex items-center gap-1`}>
                    <span>💡</span>
                    <span>El interés se suma automáticamente al monto de la deuda</span>
                  </div>
                )}
              </div>
            ))}

            {transacciones.length === 0 && (
              <p className={`${textSecondary} text-center py-6 text-sm`}>No hay transacciones. Haz clic en "Agregar" para comenzar.</p>
            )}
          </div>

          {/* Indicador de cantidad de transacciones */}
          {transacciones.length > 0 && (
            <div className={`mt-3 pt-3 border-t ${borderColor} text-center`}>
              <p className={`text-xs ${textSecondary}`}>
                {transacciones.length} {transacciones.length === 1 ? 'transacción registrada' : 'transacciones registradas'}
              </p>
            </div>
          )}
        </div>

        {/* Gráficos Circulares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Gráfico de Ingresos */}
          <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <PieChart className="text-green-600" size={20} />
              Ingresos
            </h2>
            <div className="h-56 sm:h-64">
              {totalIngresos > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={todosLosIngresos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {todosLosIngresos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatearMoneda(value)} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={`${textSecondary} text-xs sm:text-sm`}>Sin ingresos</p>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Gastos */}
          <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <PieChart className="text-red-600" size={20} />
              Gastos
            </h2>
            <div className="h-56 sm:h-64">
              {totalGastos > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={todosLosGastos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {todosLosGastos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatearMoneda(value)} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={`${textSecondary} text-xs sm:text-sm`}>Sin gastos</p>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Deudas */}
          <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
            <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
              <PieChart className="text-yellow-600" size={20} />
              Deudas
            </h2>
            <div className="h-56 sm:h-64">
              {totalDeudas > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={todasLasDeudas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {todasLasDeudas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatearMoneda(value)} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className={`${textSecondary} text-xs sm:text-sm`}>Sin deudas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tablas de Resumen por Categoría - Solo categorías con datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Resumen de Ingresos */}
          {todosLosIngresos.length > 0 && (
            <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4`}>Resumen de Ingresos</h2>
              <div className="space-y-2">
                {todosLosIngresos.map((item) => (
                  <div key={item.key} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">{item.name}</p>
                    <p className="text-lg font-bold text-green-800 dark:text-green-300">{formatearMoneda(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de Gastos */}
          {todosLosGastos.length > 0 && (
            <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4`}>Resumen de Gastos</h2>
              <div className="space-y-2">
                {todosLosGastos.map((item) => (
                  <div key={item.key} className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">{item.name}</p>
                    <p className="text-lg font-bold text-red-800 dark:text-red-300">{formatearMoneda(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen de Deudas */}
          {todasLasDeudas.length > 0 && (
            <div className={`${bgSecondary} rounded-2xl shadow-xl p-4 sm:p-6`}>
              <h2 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-4`}>Resumen de Deudas</h2>
              <div className="space-y-2">
                {todasLasDeudas.map((item) => (
                  <div key={item.key} className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-1">{item.name}</p>
                    <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{formatearMoneda(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
