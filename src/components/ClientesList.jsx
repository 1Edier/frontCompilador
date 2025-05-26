  import React from 'react';

  const ClientesList = ({ clientes, onEditar, onEliminar }) => {
    return (
      <div className="table-responsive">
        {clientes.length === 0 ? (
          <div className="alert alert-info">No se encontraron clientes</div>
        ) : (
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Clave</th>
                <th>Nombre de Contacto</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.clave}>
                  <td>{cliente.clave}</td>
                  <td>{cliente.nombreContacto}</td>
                  <td>{cliente.correo}</td>
                  <td>{cliente.telefonoContacto}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary me-1" 
                      onClick={() => onEditar(cliente)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => onEliminar(cliente.clave)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  export default ClientesList;