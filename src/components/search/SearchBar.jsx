import React from 'react';

const SearchBar = ({ query, onQueryChange, onSearch }) => {
  const handleChange = (event) => {
    const newQuery = event.target.value;
    onQueryChange(newQuery);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query, { explicit: true });
  };

  const handleClear = () => {
    onQueryChange('');
    onSearch('', { explicit: true });
  };

  return (
    <form className="search-bar panel" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input input"
        placeholder="Rechercher des mangas..."
        value={query}
        onChange={handleChange}
        aria-label="Rechercher un anime"
      />
      <button type="submit" className="search-button btn btnPrimary">
        Rechercher
      </button>
      <button
        type="button"
        className="ghost-button btn btnGhost"
        onClick={handleClear}
        aria-label="Effacer la recherche"
      >
        Effacer
      </button>
    </form>
  );
};

export default React.memo(SearchBar);
