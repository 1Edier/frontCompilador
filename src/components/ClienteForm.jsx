// components/ClienteForm.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ClienteForm = ({ cliente, onGuardar, onCancelar }) => {
  const [formData, setFormData] = useState({
    clave: '',
    nombreContacto: '',
    correo: '',
    telefonoContacto: ''
  });
  
  const [errors, setErrors] = useState({});

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
    // Validar que la clave solo contiene números
    if (!/^\d+$/.test(clave)) {
      return 'La clave debe contener únicamente números';
    }
    return '';
  };

  const validarNombre = (nombre) => {
    // Validar que el nombre no contiene números
    if (/\d/.test(nombre)) {
      return 'El nombre no debe contener números';
    }
    if (!nombre.trim()) {
      return 'El nombre es requerido';
    }
    return '';
  };

  const validarCorreo = (correo) => {
    // Validar formato básico de correo
    if (!correo.trim()) {
      return 'El correo es requerido';
    }
    
    // Expresión regular para validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return 'Formato de correo inválido';
    }
    
    // Dominios conocidos (extensión simplificada)
    const dominiosConocidos = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'mail.com'];
    const dominio = correo.split('@')[1].toLowerCase();
    
    // Verificar si es dominio empresarial (con al menos un punto después del @)
    const esDominioPersonalizado = dominio.includes('.');
    
    // Si no es un dominio conocido ni un dominio empresarial personalizado
    if (!dominiosConocidos.includes(dominio) && (!esDominioPersonalizado || dominio.split('.')[1].length < 2)) {
      return 'Por favor utiliza un servicio de correo conocido';
    }
    
    return '';
  };

  const validarTelefono = (telefono) => {
    // Eliminar cualquier caracter que no sea número para la validación
    const numeroLimpio = telefono.replace(/\D/g, '');
    
    // Validar que solo contiene números y tiene exactamente 10 dígitos
    if (!/^\d+$/.test(numeroLimpio)) {
      return 'El teléfono debe contener únicamente números';
    }
    
    if (numeroLimpio.length !== 10) {
      return 'El teléfono debe tener 10 dígitos incluyendo lada';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validar en tiempo real
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const nuevoErrors = {
      clave: validarClave(formData.clave),
      nombreContacto: validarNombre(formData.nombreContacto),
      correo: validarCorreo(formData.correo),
      telefonoContacto: validarTelefono(formData.telefonoContacto)
    };
    
    setErrors(nuevoErrors);
    
    // Verificar si hay errores
    const hayErrores = Object.values(nuevoErrors).some(error => error !== '');
    
    if (!hayErrores) {
      onGuardar(formData);
    } else {
      toast.error('Por favor corrija los errores en el formulario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="clave" className="form-label">Clave Cliente</label>
        <input
          type="text"
          className={`form-control ${errors.clave ? 'is-invalid' : ''}`}
          id="clave"
          name="clave"
          value={formData.clave}
          onChange={handleChange}
          disabled={formData.id} // Deshabilitar edición de clave si es actualización
          required
        />
        {errors.clave && <div className="invalid-feedback">{errors.clave}</div>}
        <small className="form-text text-muted">Solo se aceptan números.</small>
      </div>
      
      <div className="mb-3">
        <label htmlFor="nombreContacto" className="form-label">Nombre de Contacto</label>
        <input
          type="text"
          className={`form-control ${errors.nombreContacto ? 'is-invalid' : ''}`}
          id="nombreContacto"
          name="nombreContacto"
          value={formData.nombreContacto}
          onChange={handleChange}
          required
        />
        {errors.nombreContacto && <div className="invalid-feedback">{errors.nombreContacto}</div>}
        <small className="form-text text-muted">No debe contener números.</small>
      </div>
      
      <div className="mb-3">
        <label htmlFor="correo" className="form-label">Correo Electrónico</label>
        <input
          type="email"
          className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
          id="correo"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
        />
        {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
        <small className="form-text text-muted">Use un proveedor de correo conocido.</small>
      </div>
      
      <div className="mb-3">
        <label htmlFor="telefonoContacto" className="form-label">Teléfono de Contacto</label>
        <input
          type="tel"
          className={`form-control ${errors.telefonoContacto ? 'is-invalid' : ''}`}
          id="telefonoContacto"
          name="telefonoContacto"
          value={formData.telefonoContacto}
          onChange={handleChange}
          placeholder="10 dígitos incluyendo lada"
          required
        />
        {errors.telefonoContacto && <div className="invalid-feedback">{errors.telefonoContacto}</div>}
        <small className="form-text text-muted">Solo números, 10 dígitos incluyendo lada.</small>
      </div>
      
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary me-2" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
};

export default ClienteForm;