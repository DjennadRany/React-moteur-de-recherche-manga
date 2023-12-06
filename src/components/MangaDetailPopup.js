// MangaDetailPopup.js

import React from 'react';

const MangaDetailPopup = ({ manga, onClose, isModalOpen  }) => {
  return (
    <div className={`modal ${isModalOpen ? 'open' : ''}`} id="mangaDetailPopup" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
          <button type="button" className="close" onClick={onClose}>
  <span aria-hidden="true">&times;</span>
</button>
          </div>
          <div className="modal-body">
      
            <h2>{manga.title}</h2>
            <img class="img-mod"src={manga.images.jpg.large_image_url} alt={manga.title} />
            <p class="syno">Synopsis: {manga.synopsis}</p>
            <p>Type: {manga.type}</p>
            <p>Episodes: {manga.episodes}</p>
            <p>Statut: {manga.status}</p>
            <p>Durée: {manga.duration}</p>
            <p>Note: {manga.score} / 10</p>
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetailPopup;
