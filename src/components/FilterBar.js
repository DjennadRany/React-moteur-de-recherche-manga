// src/components/FilterBar.js
import React from 'react';

const FilterBar = ({ filters = {}, genres = [], years = [], onChange, onApplyFilter }) => {
  return (
    <div>
      <label htmlFor="genre">Genre :</label>
      <select id="genre" value={filters.genre} onChange={(e) => onChange('genre', e.target.value)}>
        <option value="">Tous les genres</option>
        {genres.map((genre) => (
          <option key={genre.mal_id} value={genre.name}>
            {genre.name}
          </option>
        ))}
      </select>

      <label htmlFor="date">Date :</label>
      <select id="date" value={filters.date} onChange={(e) => onChange('date', e.target.value)}>
        <option value="">Toutes les dates</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Ajoutez d'autres filtres si nécessaire */}
      <button onClick={onApplyFilter}>Appliquer les filtres</button>
    </div>
  );
};

export default FilterBar;
