import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
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