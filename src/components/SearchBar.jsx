// components/SearchBar.js
import React, { useState } from 'react';
import '../assets/styles/SearchBar.css';
const SearchBar = ({ onSearch }) => {
  const [termino, setTermino] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (termino.trim() === '') return;
    
    setIsLoading(true);
    try {
      await onSearch(termino);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    setTermino(valor);
    if (valor.trim() === '') {
      onSearch('');
    }
  };

  const handleClear = () => {
    setTermino('');
    onSearch('');
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group shadow-sm">
          {/* Icono de búsqueda */}
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          
          {/* Campo de búsqueda */}
          <input
            type="text"
            className="form-control border-start-0 search-input"
            placeholder="Buscar por nombre, correo, teléfono o clave..."
            value={termino}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="off"
          />
          
          {/* Botón de limpiar */}
          {termino && (
            <button
              type="button"
              className="btn btn-outline-secondary border-start-0"
              onClick={handleClear}
              disabled={isLoading}
              title="Limpiar búsqueda"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
          
          {/* Botón de búsqueda */}
          <button 
            className="btn btn-primary search-button" 
            type="submit"
            disabled={isLoading || !termino.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Buscando...
              </>
            ) : (
              <>
                <i className="bi bi-search me-2"></i>
                Buscar
              </>
            )}
          </button>
        </div>
        
        {/* Sugerencias de búsqueda */}
        <div className="search-hints">
          <small className="text-muted d-flex align-items-center">
            <i className="bi bi-lightbulb me-1"></i>
            Busca por nombre, correo, teléfono o clave del cliente
          </small>
        </div>
      </form>

     
    </div>
  );
};

export default SearchBar;