// SearchBar.js

import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    // Ajoutez un délai (par exemple, 500 ms) avant de déclencher la recherche
    // Cela permet d'éviter une recherche instantanée à chaque frappe de touche
    setTimeout(() => {
      onSearch(newQuery);
    }, 500);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Rechercher des mangas..."
        value={query}
        onChange={handleChange}
      />
      <button
        className="search-button"
        onClick={() => onSearch(query)}
      >
        Rechercher
      </button>
    </div>
  );
};

export default SearchBar;
