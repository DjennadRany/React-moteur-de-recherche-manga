// App.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false); // Nouvel état pour indiquer si une requête est en cours

  const searchManga = useCallback(async (query) => {
    try {
      setLoading(true); // Définir le chargement sur vrai au début de la requête
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}&genre=${filters.genre}&date=${filters.date}`);
      setMangaResults(response.data.data);
    } catch (error) {
      console.error('Error searching manga:', error);

      if (error.response && error.response.status === 429) {
        console.log('Too many requests. Waiting before retrying...');
        setTimeout(() => {
          searchManga(query);
        }, 5000);
      }
    } finally {
      setLoading(false); // Définir le chargement sur faux, que la requête réussisse ou échoue
    }
  }, [filters]);

  const fetchGenresAndYears = async () => {
    try {
      const genresResponse = await axios.get('https://api.jikan.moe/v3/genre/anime/1');
      setGenres(genresResponse.data.anime);
      
      // Replace '2023' with the current year or a suitable default
      const currentYear = new Date().getFullYear();
      const yearsArray = Array.from({ length: 10 }, (_, index) => currentYear - index);
      setYears(yearsArray);
    } catch (error) {
      console.error('Error fetching genres and years:', error);
    }
  };

  useEffect(() => {
    searchManga('');
    fetchGenresAndYears();
  }, [searchManga]);

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
      <FilterBar
        filters={filters}
        genres={genres}
        years={years}
        onChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onApplyFilter={() => searchManga('')}
      />
      <MangaList mangas={mangaResults} onMangaClick={handleMangaClick} />
      {selectedManga && <MangaDetailPopup manga={selectedManga} onClose={handleClosePopup} />}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default App;
