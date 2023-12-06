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
    year: '',
  });
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Ajout de l'état pour contrôler l'ouverture de la modal

  const searchManga = useCallback(async (query) => {
    try {
      setLoading(true);

      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${query}&genre=${filters.genre}&year=${filters.year}`);
      const filteredResults = response.data.data.filter((manga) => {
        if (filters.year === '') {
          return true;
        }
        return manga.aired.from.includes(filters.year);
      });

      const sortedResults = filteredResults.sort((a, b) => b.aired.from.localeCompare(a.aired.from));
      setMangaResults(sortedResults);
    } catch (error) {
      console.error('Error searching manga:', error);
      if (error.response && error.response.status === 429) {
        console.log('Too many requests. Waiting before retrying...');
        setTimeout(() => searchManga(query), 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchGenresAndYears = async () => {
    try {
      const [genresResponse, yearsResponse] = await Promise.all([
        axios.get('https://api.jikan.moe/v4/genres/anime'),
        axios.get('https://api.jikan.moe/v4/years')
      ]);
      
      setGenres(genresResponse.data.data);
      const yearsArray = yearsResponse.data.data.map((yearObj) => yearObj.year);
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
      setIsModalOpen(true); // Ouvrir la modal lorsqu'une image est cliquée
    } catch (error) {
      console.error('Error getting manga details:', error);
    }
  };

  const handleClosePopup = () => {
    setIsModalOpen(false);
    setSelectedManga(null);
  };

  return (
    <div className="container">
      <h1 className="text-center">My Anime Search</h1>
      <SearchBar onSearch={searchManga} />
      <FilterBar
        filters={filters}
        genres={genres}
        years={years}
        onChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onApplyFilter={() => searchManga('')}
      />
      <MangaList mangas={mangaResults} onMangaClick={handleMangaClick} />
      {selectedManga && (
        <MangaDetailPopup manga={selectedManga} onClose={handleClosePopup} isModalOpen={isModalOpen} />
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default App;
