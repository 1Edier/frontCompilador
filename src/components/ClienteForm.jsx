// components/ClienteForm.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../assets/styles/ClienteForm.css'

const ClienteForm = ({ cliente, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    clave: '',
    nombreContacto: '',
    correo: '',
    telefonoContacto: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        clave: cliente.clave || '',
        nombreContacto: cliente.nombreContacto || '',
        correo: cliente.correo || '',
        telefonoContacto: cliente.telefonoContacto || '',
        id: cliente.id || false
      });
    }
  }, [cliente]);

  const validarClave = (clave) => {
    if (!/^\d+$/.test(clave)) {
      return 'La clave debe contener únicamente números';
    }
    return '';
  };

  const validarNombre = (nombre) => {
    if (/\d/.test(nombre)) {
      return 'El nombre no debe contener números';
    }
    if (!nombre.trim()) {
      return 'El nombre es requerido';
    }
    return '';
  };

  const validarCorreo = (correo) => {
    if (!correo.trim()) {
      return 'El correo es requerido';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return 'Formato de correo inválido';
    }
    
    const dominiosConocidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'mail.com'];
    const dominio = correo.split('@')[1].toLowerCase();
    
    const esDominioPersonalizado = dominio.includes('.');
    
    if (!dominiosConocidos.includes(dominio) && (!esDominioPersonalizado || dominio.split('.')[1].length < 2)) {
      return 'Por favor utiliza un servicio de correo conocido';
    }
    
    return '';
  };

  const validarTelefono = (telefono) => {
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    if (!/^\d+$/.test(numeroLimpio)) {
      return 'El teléfono debe contener únicamente números';
    }
    
    if (numeroLimpio.length < 10) {
      return 'El teléfono debe tener al menos 10 dígitos incluyendo lada';
    }

    // Códigos de área de Chiapas
    const codigosChiapas = ['961', '962', '963', '964', '965', '966', '967', '968', '992', '994'];
    const codigoArea = numeroLimpio.substring(0, 3);
    
    if (!codigosChiapas.includes(codigoArea)) {
      return 'El teléfono debe ser de Chiapas con códigos válidos: 961, 962, 963, 964, 965, 966, 967, 968, 992, 994';
    }
    
    if (numeroLimpio.length !== 10) {
      return 'El teléfono debe tener exactamente 10 dígitos (3 de lada + 7 del número local)';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    let error = '';
    
    switch (name) {
      case 'clave':
        error = validarClave(value);
        break;
      case 'nombreContacto':
        error = validarNombre(value);
        break;
      case 'correo':
        error = validarCorreo(value);
        break;
      case 'telefonoContacto':
        error = validarTelefono(value);
        break;
      default:
        break;
    }
    
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const nuevoErrors = {
      clave: validarClave(formData.clave),
      nombreContacto: validarNombre(formData.nombreContacto),
      correo: validarCorreo(formData.correo),
      telefonoContacto: validarTelefono(formData.telefonoContacto)
    };
    
    setErrors(nuevoErrors);
    
    const hayErrores = Object.values(nuevoErrors).some(error => error !== '');
    
    if (!hayErrores) {
      try {
        await onGuardar(formData);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Por favor corrija los errores en el formulario');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modern-form-container">
      <form onSubmit={handleSubmit} className="modern-form">
        {/* Campo Clave */}
        <div className="form-group">
          <div className="input-container">
            <label htmlFor="clave" className="form-label">
              <i className="bi bi-key-fill label-icon"></i>
              Clave Cliente
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className={`form-input ${errors.clave ? 'error' : ''} ${formData.clave ? 'filled' : ''}`}
                id="clave"
                name="clave"
                value={formData.clave}
                onChange={handleChange}
                disabled={formData.id}
                required
                placeholder="Ingrese la clave del cliente"
              />
              <div className="input-border"></div>
              {formData.id && (
                <div className="locked-indicator">
                  <i className="bi bi-lock-fill" title="No se puede editar"></i>
                </div>
              )}
            </div>
            {errors.clave && (
              <div className="error-message">
                <i className="bi bi-exclamation-circle"></i>
                {errors.clave}
              </div>
            )}
            <div className="form-hint tooltip-container">
              <i className="bi bi-info-circle"></i>
              Solo se aceptan números
              <div className="tooltip">
                <strong>Formato de Clave:</strong><br/>
                • Solo números permitidos (0-9)<br/>
                • Sin letras, espacios o símbolos<br/>
                • Ejemplo: 12345, 001, 9876
              </div>
            </div>
          </div>
        </div>

        {/* Campo Nombre */}
        <div className="form-group">
          <div className="input-container">
            <label htmlFor="nombreContacto" className="form-label">
              <i className="bi bi-person-fill label-icon"></i>
              Nombre de Contacto
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className={`form-input ${errors.nombreContacto ? 'error' : ''} ${formData.nombreContacto ? 'filled' : ''}`}
                id="nombreContacto"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre completo"
              />
              <div className="input-border"></div>
            </div>
            {errors.nombreContacto && (
              <div className="error-message">
                <i className="bi bi-exclamation-circle"></i>
                {errors.nombreContacto}
              </div>
            )}
            <div className="form-hint tooltip-container">
              <i className="bi bi-info-circle"></i>
              No debe contener números
              <div className="tooltip">
                <strong>Formato de Nombre:</strong><br/>
                • Solo letras y espacios<br/>
                • Sin números (0-9)<br/>
                • Acentos permitidos<br/>
                • Ejemplo: Juan Pérez, María García
              </div>
            </div>
          </div>
        </div>

        {/* Campo Correo */}
        <div className="form-group">
          <div className="input-container">
            <label htmlFor="correo" className="form-label">
              <i className="bi bi-envelope-fill label-icon"></i>
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                className={`form-input ${errors.correo ? 'error' : ''} ${formData.correo ? 'filled' : ''}`}
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
              <div className="input-border"></div>
            </div>
            {errors.correo && (
              <div className="error-message">
                <i className="bi bi-exclamation-circle"></i>
                {errors.correo}
              </div>
            )}
            <div className="form-hint tooltip-container">
              <i className="bi bi-info-circle"></i>
              Use un proveedor de correo conocido
              <div className="tooltip">
                <strong>Proveedores Aceptados:</strong><br/>
                • gmail.com<br/>
                • hotmail.com, outlook.com<br/>
                • yahoo.com, live.com<br/>
                • icloud.com, aol.com<br/>
                • protonmail.com, zoho.com<br/>
                • mail.com<br/>
                • También dominios empresariales válidos
              </div>
            </div>
          </div>
        </div>

        {/* Campo Teléfono */}
        <div className="form-group">
          <div className="input-container">
            <label htmlFor="telefonoContacto" className="form-label">
              <i className="bi bi-telephone-fill label-icon"></i>
              Teléfono de Contacto
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                className={`form-input ${errors.telefonoContacto ? 'error' : ''} ${formData.telefonoContacto ? 'filled' : ''}`}
                id="telefonoContacto"
                name="telefonoContacto"
                value={formData.telefonoContacto}
                onChange={handleChange}
                required
                placeholder="9611234567"
              />
              <div className="input-border"></div>
            </div>
            {errors.telefonoContacto && (
              <div className="error-message">
                <i className="bi bi-exclamation-circle"></i>
                {errors.telefonoContacto}
              </div>
            )}
            <div className="form-hint tooltip-container">
              <i className="bi bi-info-circle"></i>
              Solo números de Chiapas (10 dígitos)
              <div className="tooltip">
                <strong>Códigos de Área de Chiapas:</strong><br/>
                • 961 - Tuxtla Gutiérrez<br/>
                • 962 - San Cristóbal de las Casas, Comitán<br/>
                • 963 - Tapachula<br/>
                • 964 - Palenque<br/>
                • 965 - Tonalá<br/>
                • 966 - Arriaga, Pijijiapan<br/>
                • 967 - Las Margaritas, Altamirano<br/>
                • 968 - Villaflores, Villa Corzo<br/>
                • 992 - Reforma<br/>
                • 994 - Mapastepec<br/>
                <strong>Formato:</strong> 3 dígitos de lada + 7 dígitos locales
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancelar}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-circle"></i>
            <span>Cancelar</span>
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;