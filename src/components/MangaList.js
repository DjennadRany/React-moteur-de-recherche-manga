// src/components/MangaList.js
import React from 'react';

const MangaList = ({ mangas, onMangaClick }) => {
  return (
    <div>
      <h2>Résultats de la recherche :</h2>
      <ul className="hub">
        {mangas.map((manga) => (
          <li className="li-hub" key={manga.mal_id} onClick={() => onMangaClick(manga)}>
            <img src={manga.images.jpg.large_image_url} alt={manga.title} />
            <p>{manga.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MangaList;
