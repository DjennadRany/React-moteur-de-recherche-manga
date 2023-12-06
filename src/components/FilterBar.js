// src/components/FilterBar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterBar = ({ filters, onChange, onApplyFilter }) => {
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    // Récupérer la liste des genres depuis l'API
    axios.get('https://api.jikan.moe/v4/genres/anime')
      .then(response => {
        setGenres(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching genres:', error);
      });

    // Récupérer la liste des années depuis l'API
    axios.get('https://api.jikan.moe/v4/years')
      .then(response => {
        // Mapper directement la propriété "year" de chaque objet
        const yearsArray = response.data.data.map(yearObj => yearObj.year);
        setYears(yearsArray);
      })
      .catch(error => {
        console.error('Error fetching years:', error);
      });
  }, []); // Le tableau vide [] signifie que cela s'exécute une seule fois après le montage

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
