// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import MangaList from './components/MangaList';
import MangaDetailPopup from './components/MangaDetailPopup';
import FilterBar from './components/FilterBar';
import './App.css';

const App = () => {
  const [mangaResults, setMangaResults] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const [filters, setFilters] = useState({
    genre: '',
    date: '',
  });

  const searchManga = async (query) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}&genre=${filters.genre}&date=${filters.date}`);
      setMangaResults(response.data.data);
    } catch (error) {
      console.error('Error searching manga:', error);
  
      // Ajouter une gestion de l'erreur 429 (Too Many Requests)
      if (error.response && error.response.status === 429) {
        console.log('Too many requests. Waiting before retrying...');
        // Attendre 5 secondes (ou un autre délai de votre choix) avant de réessayer
        setTimeout(() => {
          searchManga(query);
        }, 5000); // 5000 millisecondes = 5 secondes
      }
    }
  };
  

  useEffect(() => {
    searchManga('');
  }, [filters]);

  // Fonctions manquantes
  const handleMangaClick = async (manga) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${manga.mal_id}`);
      setSelectedManga(response.data.data);
    } catch (error) {
      console.error('Error getting manga details:', error);
    }
  };

  const handleClosePopup = () => {
    setSelectedManga(null);
  };

  return (
    <div>
      <h1>My Anime Search</h1>
      <SearchBar onSearch={searchManga} />
      <FilterBar filters={filters} onChange={(key, value) => setFilters({ filters, [key]: value })} onApplyFilter={() => searchManga('')} />
      <MangaList mangas={mangaResults} onMangaClick={handleMangaClick} />
      {selectedManga && <MangaDetailPopup manga={selectedManga} onClose={handleClosePopup} />}
    </div>
  );
};

export default App;
