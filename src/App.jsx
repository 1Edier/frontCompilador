// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import ClienteForm from './components/ClienteForm';
import ClientesList from './components/ClientesList';
import ClientesConErrores from './components/ClientesConErrores';
import SearchBar from './components/SearchBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('todos'); // 'todos', 'errores'
  const [clientesConErrores, setClientesConErrores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clientes');
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
        if (vistaActual === 'todos') {
          setFiltrados(data);
        }
      } else {
        toast.error('Error al cargar clientes');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientesConValidacion = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clientes/validacion/todos');
      if (response.ok) {
        const data = await response.json();
        setFiltrados(data);
      } else {
        toast.error('Error al cargar clientes con validación');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientesConErrores = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/clientes/validacion/errores');
      if (response.ok) {
        const data = await response.json();
        setClientesConErrores(data);
        setFiltrados(data);
      } else {
        toast.error('Error al cargar clientes con errores');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (termino) => {
    setBusqueda(termino);
    if (termino.trim() === '') {
      if (vistaActual === 'todos') {
        setFiltrados(clientes);
      } else if (vistaActual === 'errores') {
        setFiltrados(clientesConErrores);
      } else if (vistaActual === 'validacion') {
        cargarClientesConValidacion();
      }
      return;
    }
    
    setLoading(true);
    try {
      let url;
      if (vistaActual === 'validacion' || vistaActual === 'errores') {
        url = `http://localhost:8080/clientes/validacion/buscar?q=${encodeURIComponent(termino)}`;
      } else {
        url = `http://localhost:8080/clientes/buscar?q=${encodeURIComponent(termino)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        if (vistaActual === 'errores') {
          // Filtrar solo los que tienen errores
          const soloConErrores = data.filter(item => item.tieneErrores);
          setFiltrados(soloConErrores);
        } else {
          setFiltrados(data);
        }
      } else {
        toast.error('Error en la búsqueda');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cambiarVista = (vista) => {
    setVistaActual(vista);
    setBusqueda('');
    
    switch(vista) {
      case 'todos':
        setFiltrados(clientes);
        break;
      case 'validacion':
        cargarClientesConValidacion();
        break;
      case 'errores':
        cargarClientesConErrores();
        break;
      default:
        setFiltrados(clientes);
    }
  };

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
        await cargarClientes();
        
        // Recargar la vista actual
        if (vistaActual === 'validacion') {
          cargarClientesConValidacion();
        } else if (vistaActual === 'errores') {
          cargarClientesConErrores();
        }
        
        setClienteSeleccionado(null);
      } else {
        const errorData = await response.json();
        if (errorData.errores) {
          toast.error('Errores de validación encontrados');
          // Mostrar errores específicos
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

  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado({...cliente, id: true});
  };

  const handleEliminarCliente = async (clave) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const response = await fetch(`http://localhost:8080/clientes/${clave}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Cliente eliminado con éxito');
          await cargarClientes();
          
          // Recargar la vista actual
          if (vistaActual === 'validacion') {
            cargarClientesConValidacion();
          } else if (vistaActual === 'errores') {
            cargarClientesConErrores();
          }
        } else {
          const error = await response.text();
          toast.error(`Error: ${error}`);
        }
      } catch (error) {
        toast.error(`Error de conexión: ${error.message}`);
      }
    }
  };

  const handleNuevoCliente = () => {
    setClienteSeleccionado({
      clave: '',
      nombreContacto: '',
      correo: '',
      telefonoContacto: ''
    });
  };

  const handleCancelar = () => {
    setClienteSeleccionado(null);
  };

  const contarClientesConErrores = () => {
    return filtrados.filter(item => item.tieneErrores).length;
  };

  return (
    <div className="App">
      {/* Bootstrap Icons y Custom CSS */}
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" 
        rel="stylesheet"
      />
      
      {/* Header mejorado */}
      <header className="app-header">
        <div className="header-background"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="header-title">
                <i className="bi bi-people-fill me-3"></i>
                Sistema de Gestión de Clientes
              </h1>
              <p className="header-subtitle">Administra y valida tu base de datos de clientes</p>
            </div>
            <div className="col-md-4 text-end">
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-number">{clientes.length}</span>
                  <span className="stat-label">Clientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="container">
          {/* Navigation mejorada */}
          <div className="navigation-section">
            <div className="nav-buttons">
              <button 
                className={`nav-btn ${vistaActual === 'todos' ? 'active' : ''}`}
                onClick={() => cambiarVista('todos')}
                disabled={clienteSeleccionado !== null}
              >
                <div className="nav-btn-content">
                  <i className="bi bi-people nav-icon"></i>
                  <div className="nav-text">
                    <span className="nav-title">Todos</span>
                    <span className="nav-count">{clientes.length}</span>
                  </div>
                </div>
              </button>
              
              <button 
                className={`nav-btn ${vistaActual === 'validacion' ? 'active' : ''}`}
                onClick={() => cambiarVista('validacion')}
                disabled={clienteSeleccionado !== null}
              >
                <div className="nav-btn-content">
                  <i className="bi bi-shield-check nav-icon"></i>
                  <div className="nav-text">
                    <span className="nav-title">Con Validación</span>
                    <span className="nav-count">Análisis</span>
                  </div>
                </div>
              </button>
              
              <button 
                className={`nav-btn error-btn ${vistaActual === 'errores' ? 'active' : ''}`}
                onClick={() => cambiarVista('errores')}
                disabled={clienteSeleccionado !== null}
              >
                <div className="nav-btn-content">
                  <i className="bi bi-exclamation-triangle nav-icon"></i>
                  <div className="nav-text">
                    <span className="nav-title">Con Errores</span>
                    <span className="nav-count">{vistaActual === 'errores' ? filtrados.length : '...'}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Barra de acciones mejorada */}
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

          {/* Estadísticas mejoradas */}
          {vistaActual === 'validacion' && (
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card total">
                  <div className="stat-icon">
                    <i className="bi bi-people"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">Total</span>
                    <span className="stat-value">{filtrados.length}</span>
                  </div>
                </div>
                
                <div className="stat-card errors">
                  <div className="stat-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">Con Errores</span>
                    <span className="stat-value">{contarClientesConErrores()}</span>
                  </div>
                </div>
                
                <div className="stat-card valid">
                  <div className="stat-icon">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-title">Válidos</span>
                    <span className="stat-value">{filtrados.length - contarClientesConErrores()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
                {vistaActual === 'errores' ? (
                  <ClientesConErrores 
                    clientesConErrores={filtrados}
                    onEditar={handleEditarCliente} 
                    onEliminar={handleEliminarCliente} 
                  />
                ) : (
                  <ClientesList 
                    clientes={filtrados} 
                    onEditar={handleEditarCliente} 
                    onEliminar={handleEliminarCliente}
                    mostrarValidacion={vistaActual === 'validacion'}
                  />
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