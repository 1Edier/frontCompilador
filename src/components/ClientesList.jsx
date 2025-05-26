// components/ClientesList.js
import React from 'react';
import '../assets/styles/ClientesList.css'
const ClientesList = ({ clientes, onEditar, onEliminar, mostrarValidacion = false }) => {
  // Función para determinar si un campo tiene error
  const getErrorClass = (campo, errores = []) => {
    return errores.some(error => error.campo === campo) ? 'error-field' : '';
  };

  // Función para obtener el mensaje de error
  const getErrorMessage = (campo, errores = []) => {
    const error = errores.find(error => error.campo === campo);
    return error ? error.mensaje : '';
  };

  // Función para renderizar una celda con posible error
  const renderCellWithError = (valor, campo, errores = []) => {
    const hasError = errores.some(error => error.campo === campo);
    const errorMessage = getErrorMessage(campo, errores);
    
    return (
      <td className={`data-cell ${hasError ? 'error-cell' : ''}`}>
        <div className="cell-content">
          <span className={getErrorClass(campo, errores)}>
            {valor || 'N/A'}
          </span>
          {hasError && (
            <div className="error-indicator-wrapper">
              <i className="bi bi-exclamation-triangle-fill error-indicator" title={errorMessage}></i>
              <div className="error-tooltip">
                {errorMessage}
              </div>
            </div>
          )}
        </div>
      </td>
    );
  };

  if (clientes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <i className="bi bi-people"></i>
        </div>
        <h3>No se encontraron clientes</h3>
        <p>Agrega nuevos clientes o ajusta los filtros de búsqueda</p>
        <div className="empty-decoration"></div>
        
        
      </div>
    );
  }

  return (
    <div className="modern-table-container">
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
              {mostrarValidacion && (
                <th>
                  <div className="th-content">
                    <i className="bi bi-shield-check"></i>
                    <span>Estado</span>
                  </div>
                </th>
              )}
              <th>
                <div className="th-content">
                  <i className="bi bi-tools"></i>
                  <span>Acciones</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((item, index) => {
              // Determinar si es un cliente con información de errores o un cliente simple
              const cliente = item.cliente || item;
              const errores = item.errores || [];
              const tieneErrores = item.tieneErrores || false;
              
              return (
                <tr 
                  key={cliente.clave} 
                  className={`table-row ${mostrarValidacion && tieneErrores ? 'error-row' : ''}`}
                  style={{'--delay': `${index * 0.1}s`}}
                >
                  {mostrarValidacion ? (
                    <>
                      {renderCellWithError(cliente.clave, 'clave', errores)}
                      {renderCellWithError(cliente.nombreContacto, 'nombreContacto', errores)}
                      {renderCellWithError(cliente.correo, 'correo', errores)}
                      {renderCellWithError(cliente.telefonoContacto, 'telefonoContacto', errores)}
                      <td className="data-cell status-cell">
                        {tieneErrores ? (
                          <div className="status-badge error-badge">
                            <div className="badge-icon">
                              <i className="bi bi-exclamation-triangle-fill"></i>
                            </div>
                            <div className="badge-content">
                              <span className="badge-number">{errores.length}</span>
                              <span className="badge-text">error{errores.length !== 1 ? 'es' : ''}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="status-badge success-badge">
                            <div className="badge-icon">
                              <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <div className="badge-content">
                              <span className="badge-text">Válido</span>
                            </div>
                          </div>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="data-cell">
                        <div className="cell-content">
                          <span className="data-value">{cliente.clave}</span>
                        </div>
                      </td>
                      <td className="data-cell">
                        <div className="cell-content">
                          <span className="data-value">{cliente.nombreContacto}</span>
                        </div>
                      </td>
                      <td className="data-cell">
                        <div className="cell-content">
                          <span className="data-value">{cliente.correo}</span>
                        </div>
                      </td>
                      <td className="data-cell">
                        <div className="cell-content">
                          <span className="data-value">{cliente.telefonoContacto}</span>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="data-cell actions-cell">
                    <div className="action-buttons">
                      <button 
                        className={`action-btn ${mostrarValidacion && tieneErrores ? 'btn-fix' : 'btn-edit'}`}
                        onClick={() => onEditar(cliente)}
                        title={mostrarValidacion && tieneErrores ? 'Corregir errores' : 'Editar cliente'}
                      >
                        <i className={`bi ${mostrarValidacion && tieneErrores ? 'bi-tools' : 'bi-pencil-square'}`}></i>
                        <span>{mostrarValidacion && tieneErrores ? 'Corregir' : 'Editar'}</span>
                      </button>
                      <button 
                        className="action-btn btn-delete" 
                        onClick={() => onEliminar(cliente.clave)}
                        title="Eliminar cliente"
                      >
                        <i className="bi bi-trash3-fill"></i>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {mostrarValidacion && (
        <div className="validation-guide">
          <div className="guide-header">
            <h3>
              <i className="bi bi-info-circle-fill"></i>
              Guía de Validación
            </h3>
          </div>
          <div className="guide-content">
            <div className="guide-section">
              <h4>Estados de Cliente</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="status-badge success-badge small">
                    <div className="badge-icon">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div className="badge-content">
                      <span className="badge-text">Válido</span>
                    </div>
                  </div>
                  <span>Cliente sin errores de validación</span>
                </div>
                <div className="legend-item">
                  <div className="status-badge error-badge small">
                    <div className="badge-icon">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div className="badge-content">
                      <span className="badge-number">N</span>
                      <span className="badge-text">errores</span>
                    </div>
                  </div>
                  <span>Cliente con errores que requieren corrección</span>
                </div>
                <div className="legend-item">
                  <div className="error-indicator">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                  </div>
                  <span>Campo específico con error (pasa el cursor para ver detalles)</span>
                </div>
              </div>
            </div>
            <div className="guide-section">
              <h4>Reglas de Validación</h4>
              <div className="validation-rules">
                <div className="rule-item">
                  <div className="rule-icon clave">
                    <i className="bi bi-key-fill"></i>
                  </div>
                  <div className="rule-content">
                    <strong>Clave Cliente:</strong> Solo debe contener números
                  </div>
                </div>
                <div className="rule-item">
                  <div className="rule-icon nombre">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="rule-content">
                    <strong>Nombre:</strong> No debe contener números
                  </div>
                </div>
                <div className="rule-item">
                  <div className="rule-icon correo">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div className="rule-content">
                    <strong>Correo:</strong> Debe ser de un dominio conocido
                  </div>
                </div>
                <div className="rule-item">
                  <div className="rule-icon telefono">
                    <i className="bi bi-telephone-fill"></i>
                  </div>
                  <div className="rule-content">
                    <strong>Teléfono:</strong> Debe tener exactamente 10 dígitos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ClientesList;