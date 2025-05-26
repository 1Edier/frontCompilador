// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import ClienteForm from './components/ClienteForm';
import ClientesList from './components/ClientesList';
import SearchBar from './components/SearchBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await fetch('http://localhost:8080/clientes');
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
        setFiltrados(data);
      } else {
        toast.error('Error al cargar clientes');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    }
  };

  const handleSearch = async (termino) => {
    setBusqueda(termino);
    if (termino.trim() === '') {
      setFiltrados(clientes);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/clientes/buscar?q=${encodeURIComponent(termino)}`);
      if (response.ok) {
        const data = await response.json();
        setFiltrados(data);
      } else {
        toast.error('Error en la búsqueda');
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    }
  };

  const handleGuardarCliente = async (cliente) => {
    try {
      // Determinar si es creación o actualización
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
        cargarClientes();
        setClienteSeleccionado(null);
      } else {
        const error = await response.text();
        toast.error(`Error: ${error}`);
      }
    } catch (error) {
      toast.error(`Error de conexión: ${error.message}`);
    }
  };

  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado({...cliente, id: true}); // Usamos id como flag para edición
  };

  const handleEliminarCliente = async (clave) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        const response = await fetch(`http://localhost:8080/clientes/${clave}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Cliente eliminado con éxito');
          cargarClientes();
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gestión de Clientes</h1>
      </header>
      <main className="App-main">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <button 
                className="btn btn-primary" 
                onClick={handleNuevoCliente}
                disabled={clienteSeleccionado !== null}
              >
                Nuevo Cliente
              </button>
            </div>
            <div className="col-md-6">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          
          {clienteSeleccionado ? (
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <div className="card">
                  <div className="card-header">
                    {clienteSeleccionado.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </div>
                  <div className="card-body">
                    <ClienteForm 
                      cliente={clienteSeleccionado} 
                      onGuardar={handleGuardarCliente}
                      onCancelar={handleCancelar}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ClientesList 
              clientes={filtrados} 
              onEditar={handleEditarCliente} 
              onEliminar={handleEliminarCliente} 
            />
          )}
        </div>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;