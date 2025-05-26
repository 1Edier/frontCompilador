// App.js - Versión Corregida
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import ClienteForm from './components/ClienteForm';
import ClientesList from './components/ClientesList';
import SearchBar from './components/SearchBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [clientes, setClientes] = useState([]); // Todos los clientes
  const [filtrados, setFiltrados] = useState([]); // Clientes filtrados - inicializar como array vacío
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina] = useState(50); // Paginación para mejor rendimiento

  useEffect(() => {
    cargarClientesConValidacion();
  }, []);

  const cargarClientesConValidacion = async (signal) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clientes/validacion/todos', {
        signal // Soporte para cancelación
      });
      
      if (response.ok) {
        const data = await response.json();
        // Asegurar que data sea un array
        const clientesData = Array.isArray(data) ? data : [];
        setClientes(clientesData);
        setFiltrados(clientesData);
        setPaginaActual(1); // Reset pagination
      } else {
        toast.error('Error al cargar clientes con validación');
        // Establecer arrays vacíos en caso de error
        setClientes([]);
        setFiltrados([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error(`Error de conexión: ${error.message}`);
        // Establecer arrays vacíos en caso de error
        setClientes([]);
        setFiltrados([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda optimizada con soporte para cancelación
  const handleSearch = useCallback(async (termino, signal) => {
    setBusqueda(termino);
    
    if (termino.trim() === '') {
      setFiltrados(clientes);
      setPaginaActual(1);
      return;
    }
    
    setLoading(true);
    try {
      const url = `http://localhost:8080/clientes/validacion/buscar?q=${encodeURIComponent(termino)}`;
      
      const response = await fetch(url, {
        signal // Soporte para cancelación
      });
      
      if (response.ok) {
        const data = await response.json();
        // Asegurar que data sea un array
        const resultados = Array.isArray(data) ? data : [];
        setFiltrados(resultados);
        setPaginaActual(1); // Reset pagination
      } else {
        toast.error('Error en la búsqueda');
        setFiltrados([]); // Establecer array vacío en caso de error
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error(`Error de conexión: ${error.message}`);
        setFiltrados([]); // Establecer array vacío en caso de error
      }
    } finally {
      setLoading(false);
    }
  }, [clientes]);

  const handleGuardarCliente = async (cliente) => {
    try {
      const metodo = cliente.id ? 'PUT' : 'POST';
      const url = cliente.id 
        ? `http://localhost:8080/clientes/${cliente.clave}` 
        : 'http://localhost:8080/clientes';
      
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });

      if (response.ok) {
        toast.success(cliente.id ? 'Cliente actualizado con éxito' : 'Cliente creado con éxito');
        await cargarClientesConValidacion();
        setClienteSeleccionado(null);
      } else {
        const errorData = await response.json();
        if (errorData.errores) {
          toast.error('Errores de validación encontrados');
          errorData.errores.forEach(error => {
            toast.error(`${error.campo}: ${error.mensaje}`);
          });
        } else {
          const errorText = await response.text();
          toast.error(`Error: ${errorText}`);
        }
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    }
  };

  const handleEditarCliente = useCallback((cliente) => {
    setClienteSeleccionado({...cliente, id: true});
  }, []);

  const handleEliminarCliente = async (clave) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const response = await fetch(`http://localhost:8080/clientes/${clave}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Cliente eliminado con éxito');
          await cargarClientesConValidacion();
        } else {
          const error = await response.text();
          toast.error(`Error: ${error}`);
        }
      } catch (error) {
        toast.error(`Error de conexión: ${error.message}`);
      }
    }
  };

  const handleNuevoCliente = useCallback(() => {
    setClienteSeleccionado({
      clave: '',
      nombreContacto: '',
      correo: '',
      telefonoContacto: ''
    });
  }, []);

  const handleCancelar = useCallback(() => {
    setClienteSeleccionado(null);
  }, []);

  // Memoización de estadísticas con validación de null/undefined
  const estadisticas = useMemo(() => {
    // Validar que filtrados sea un array válido
    if (!Array.isArray(filtrados)) {
      return { total: 0, conErrores: 0, validos: 0 };
    }
    
    const total = filtrados.length;
    const conErrores = filtrados.filter(item => item && item.tieneErrores).length;
    const validos = total - conErrores;
    
    return { total, conErrores, validos };
  }, [filtrados]);

  // Paginación con validación de array
  const clientesPaginados = useMemo(() => {
    // Validar que filtrados sea un array válido
    if (!Array.isArray(filtrados)) {
      return [];
    }
    
    const inicio = (paginaActual - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    return filtrados.slice(inicio, fin);
  }, [filtrados, paginaActual, clientesPorPagina]);

  // Validar que filtrados sea un array antes de calcular páginas
  const totalPaginas = Array.isArray(filtrados) 
    ? Math.ceil(filtrados.length / clientesPorPagina) 
    : 0;

  const handleCambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
        rel="stylesheet"
      />
      
      {/* Header optimizado */}
      <header className="app-header">
        <div className="header-background"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="header-title">
                <i className="bi bi-shield-check me-3"></i>
                Sistema de Validación de Clientes
              </h1>
              <p className="header-subtitle">Administra y valida tu base de datos de clientes</p>
            </div>
            <div className="col-md-4 text-end">
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-number">{estadisticas.total}</span>
                  <span className="stat-label">
                    {busqueda ? 'Encontrados' : 'Clientes'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="container">
          {/* Barra de acciones */}
          <div className="actions-section">
            <div className="actions-left">
              <button 
                className="btn-new-client" 
                onClick={handleNuevoCliente}
                disabled={clienteSeleccionado !== null}
              >
                <i className="bi bi-plus-circle"></i>
                <span>Nuevo Cliente</span>
              </button>
            </div>
            
            <div className="actions-center">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="actions-right">
              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <span>Cargando...</span>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas optimizadas */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-title">
                    {busqueda ? 'Encontrados' : 'Total'}
                  </span>
                  <span className="stat-value">{estadisticas.total}</span>
                </div>
              </div>
              
              <div className="stat-card errors">
                <div className="stat-icon">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-title">Con Errores</span>
                  <span className="stat-value">{estadisticas.conErrores}</span>
                </div>
              </div>
              
              <div className="stat-card valid">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-title">Válidos</span>
                  <span className="stat-value">{estadisticas.validos}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="content-section">
            {clienteSeleccionado ? (
              <div className="form-container">
                <div className="form-card">
                  <div className="form-header">
                    <h2 className="form-title">
                      <i className={`bi ${clienteSeleccionado.id ? 'bi-pencil-square' : 'bi-plus-circle'}`}></i>
                      {clienteSeleccionado.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                  </div>
                  <div className="form-body">
                    <ClienteForm 
                      cliente={clienteSeleccionado} 
                      onGuardar={handleGuardarCliente}
                      onCancelar={handleCancelar}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-container">
                {/* Información de paginación */}
                {totalPaginas > 1 && (
                  <div className="pagination-info mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Mostrando {((paginaActual - 1) * clientesPorPagina) + 1} - {Math.min(paginaActual * clientesPorPagina, estadisticas.total)} de {estadisticas.total} registros
                      </small>
                      <div className="pagination-controls">
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleCambiarPagina(paginaActual - 1)}
                          disabled={paginaActual === 1}
                        >
                          <i className="bi bi-chevron-left"></i> Anterior
                        </button>
                        <span className="pagination-current">
                          Página {paginaActual} de {totalPaginas}
                        </span>
                        <button 
                          className="btn btn-sm btn-outline-primary ms-2"
                          onClick={() => handleCambiarPagina(paginaActual + 1)}
                          disabled={paginaActual === totalPaginas}
                        >
                          Siguiente <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <ClientesList 
                  clientes={clientesPaginados} // Usar clientes paginados
                  onEditar={handleEditarCliente} 
                  onEliminar={handleEliminarCliente}
                  mostrarValidacion={true}
                />
                
                {/* Paginación inferior */}
                {totalPaginas > 1 && (
                  <div className="pagination-bottom mt-3">
                    <nav aria-label="Navegación de páginas">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handleCambiarPagina(1)}
                            disabled={paginaActual === 1}
                          >
                            Primera
                          </button>
                        </li>
                        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handleCambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                          >
                            Anterior
                          </button>
                        </li>
                        
                        {/* Páginas numéricas */}
                        {[...Array(Math.min(5, totalPaginas))].map((_, index) => {
                          let pageNum;
                          if (totalPaginas <= 5) {
                            pageNum = index + 1;
                          } else if (paginaActual <= 3) {
                            pageNum = index + 1;
                          } else if (paginaActual >= totalPaginas - 2) {
                            pageNum = totalPaginas - 4 + index;
                          } else {
                            pageNum = paginaActual - 2 + index;
                          }
                          
                          return (
                            <li key={pageNum} className={`page-item ${paginaActual === pageNum ? 'active' : ''}`}>
                              <button 
                                className="page-link"
                                onClick={() => handleCambiarPagina(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handleCambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                          >
                            Siguiente
                          </button>
                        </li>
                        <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => handleCambiarPagina(totalPaginas)}
                            disabled={paginaActual === totalPaginas}
                          >
                            Última
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <ToastContainer 
        position="bottom-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="custom-toast"
      />
    </div>
  );
}

export default App;