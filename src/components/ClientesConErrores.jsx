// components/ClientesConErrores.js
import React from 'react';

const ClientesConErrores = ({ clientesConErrores, onEditar, onEliminar }) => {
  // Agregar logging para debugging
  console.log('ClientesConErrores - Datos recibidos:', clientesConErrores);
  
  // Validar que clientesConErrores sea un array
  if (!Array.isArray(clientesConErrores)) {
    console.error('clientesConErrores no es un array:', clientesConErrores);
    return (
      <div className="error-container">
        <p>Error: Los datos no tienen el formato esperado</p>
      </div>
    );
  }

  const getErrorClass = (campo, errores) => {
    if (!Array.isArray(errores)) return '';
    return errores.some(error => error.campo === campo) ? 'error-field' : '';
  };

  const getErrorMessage = (campo, errores) => {
    if (!Array.isArray(errores)) return '';
    const error = errores.find(error => error.campo === campo);
    return error ? error.mensaje : '';
  };

  const renderCellWithError = (valor, campo, errores) => {
    const hasError = Array.isArray(errores) && errores.some(error => error.campo === campo);
    const errorMessage = getErrorMessage(campo, errores);
    
    return (
      <td className={`data-cell ${hasError ? 'error-cell' : ''}`}>
        <div className="cell-content">
          <span className={getErrorClass(campo, errores)}>
            {valor || '-'}
          </span>
          {hasError && (
            <div className="error-indicator">
              <i className="bi bi-exclamation-triangle-fill" title={errorMessage}></i>
            </div>
          )}
        </div>
        {hasError && (
          <div className="error-tooltip">
            {errorMessage}
          </div>
        )}
      </td>
    );
  };

  // Función para normalizar los datos
  const normalizeClientData = (item) => {
    // Si el item ya tiene la estructura correcta (item.cliente)
    if (item.cliente) {
      return {
        cliente: item.cliente,
        errores: item.errores || [],
        tieneErrores: item.tieneErrores || false
      };
    }
    
    // Si el item es directamente un cliente con errores
    if (item.clave || item.nombreContacto || item.correo || item.telefonoContacto) {
      return {
        cliente: {
          clave: item.clave,
          nombreContacto: item.nombreContacto,
          correo: item.correo,
          telefonoContacto: item.telefonoContacto
        },
        errores: item.errores || [],
        tieneErrores: item.tieneErrores || false
      };
    }
    
    // Estructura desconocida, log para debugging
    console.warn('Estructura de datos no reconocida:', item);
    return null;
  };

  // Normalizar todos los elementos
  const datosNormalizados = clientesConErrores
    .map(normalizeClientData)
    .filter(item => item !== null); // Filtrar elementos null

  console.log('Datos normalizados:', datosNormalizados);

  if (datosNormalizados.length === 0) {
    return (
      <div className="success-container">
        <div className="success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h3>¡Excelente!</h3>
        <p>No se encontraron clientes con errores de validación.</p>
        <div className="success-decoration"></div>
      </div>
    );
  }

  return (
    <div className="error-clients-container">
      <div className="error-header">
        <div className="error-icon">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div className="error-info">
          <h2>Clientes con Errores de Validación</h2>
          <p>
            <span className="error-count">{datosNormalizados.length}</span>
            {datosNormalizados.length === 1 ? ' cliente requiere' : ' clientes requieren'} corrección
          </p>
        </div>
      </div>
      
      <div className="table-container">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <i className="bi bi-key-fill"></i>
                    <span>Clave</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <i className="bi bi-person-fill"></i>
                    <span>Nombre de Contacto</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <i className="bi bi-envelope-fill"></i>
                    <span>Correo</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <i className="bi bi-telephone-fill"></i>
                    <span>Teléfono</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <i className="bi bi-bug-fill"></i>
                    <span>Errores</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <i className="bi bi-tools"></i>
                    <span>Acciones</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {datosNormalizados.map((item, index) => {
                // Validación adicional antes de renderizar
                if (!item.cliente) {
                  console.warn('Cliente undefined en item:', item);
                  return null;
                }

                return (
                  <tr key={item.cliente.clave || `error-${index}`} className="table-row" style={{'--delay': `${index * 0.1}s`}}>
                    {renderCellWithError(item.cliente.clave, 'clave', item.errores)}
                    {renderCellWithError(item.cliente.nombreContacto, 'nombreContacto', item.errores)}
                    {renderCellWithError(item.cliente.correo, 'correo', item.errores)}
                    {renderCellWithError(item.cliente.telefonoContacto, 'telefonoContacto', item.errores)}
                    <td className="data-cell">
                      <div className="error-badge">
                        <span className="error-number">{Array.isArray(item.errores) ? item.errores.length : 0}</span>
                        <span className="error-text">
                          error{(Array.isArray(item.errores) ? item.errores.length : 0) !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="data-cell actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="btn-fix" 
                          onClick={() => onEditar(item.cliente)}
                          title="Corregir errores"
                        >
                          <i className="bi bi-tools"></i>
                          <span>Corregir</span>
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => onEliminar(item.cliente.clave)}
                          title="Eliminar cliente"
                        >
                          <i className="bi bi-trash3-fill"></i>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }).filter(row => row !== null)}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="validation-legend">
        <h3>Guía de Validaciones</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <div className="legend-icon clave">
              <i className="bi bi-key-fill"></i>
            </div>
            <div className="legend-content">
              <h4>Clave Cliente</h4>
              <p>Solo debe contener números</p>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-icon nombre">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="legend-content">
              <h4>Nombre de Contacto</h4>
              <p>No debe contener números</p>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-icon correo">
              <i className="bi bi-envelope-fill"></i>
            </div>
            <div className="legend-content">
              <h4>Correo Electrónico</h4>
              <p>Debe ser de un dominio conocido</p>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-icon telefono">
              <i className="bi bi-telephone-fill"></i>
            </div>
            <div className="legend-content">
              <h4>Teléfono</h4>
              <p>Debe tener exactamente 10 dígitos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientesConErrores;