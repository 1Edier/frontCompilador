// components/SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [termino, setTermino] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(termino);
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    setTermino(valor);
    if (valor.trim() === '') {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex">
      <input
        type="text"
        className="form-control me-2"
        placeholder="Buscar clientes..."
        value={termino}
        onChange={handleChange}
      />
      <button className="btn btn-outline-primary" type="submit">
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;