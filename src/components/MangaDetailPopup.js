// src/components/MangaDetailPopup.js
import React from 'react';

const MangaDetailPopup = ({ manga, onClose }) => {
  return (
    <div class="pop-upmod">
      <button class="modal-close"onClick={onClose}>Fermer</button>
      <h2>{manga.title}</h2>
      <img src={manga.images.jpg.large_image_url} alt={manga.title} />
      <p>Synopsis: {manga.synopsis}</p>
      <p>Type: {manga.type}</p>
      <p>Episodes: {manga.episodes}</p>
      <p>Statut: {manga.status}</p>
      <p>Durée: {manga.duration}</p>
      <p>Note: {manga.score} / 10</p>
      {/* Ajoutez d'autres détails en fonction des informations disponibles */}
    </div>
  );
};

export default MangaDetailPopup;
