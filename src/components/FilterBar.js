// src/components/FilterBar.js
import React from 'react';

const FilterBar = ({ filters, genres, years, onChange, onApplyFilter, onClearFilters }) => {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          value={filters.genre}
          onChange={(e) => onChange('genre', e.target.value)}
        >
          <option value="">Tous les genres</option>
          {genres.map((genre) => (
            <option key={genre.mal_id} value={genre.mal_id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="date">Année</label>
        <select
          id="date"
          value={filters.year}
          onChange={(e) => onChange('year', e.target.value)}
        >
          <option value="">Toutes les dates</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button type="button" className="primary-button" onClick={onApplyFilter}>
          Appliquer les filtres
        </button>
        <button type="button" className="ghost-button" onClick={onClearFilters}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
