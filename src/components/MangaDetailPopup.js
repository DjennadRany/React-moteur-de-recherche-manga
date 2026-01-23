// MangaDetailPopup.js

import React, { useEffect, useMemo, useRef } from 'react';

const MangaDetailPopup = ({ manga, onClose, isModalOpen, onToggleFavorite, isFavorite }) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const trailerUrl = useMemo(() => {
    const trailer = manga?.trailer;
    if (!trailer) {
      return '';
    }

    if (trailer.embed_url) {
      return trailer.embed_url;
    }

    if (trailer.youtube_id) {
      return `https://www.youtube.com/embed/${trailer.youtube_id}`;
    }

    if (trailer.url && trailer.url.includes('youtube.com/watch')) {
      try {
        const url = new URL(trailer.url);
        const id = url.searchParams.get('v');
        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }
      } catch (error) {
        return '';
      }
    }

    return '';
  }, [manga]);

  useEffect(() => {
    if (isModalOpen) {
      previousFocusRef.current = document.activeElement;
      const previousOverflow = document.body.style.overflow;
      const previousPadding = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarGap > 0) {
        document.body.style.paddingRight = `${scrollbarGap}px`;
      }

      setTimeout(() => {
        dialogRef.current?.focus();
      }, 0);

      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPadding;
      };
    }

    return undefined;
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return () => {
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          last.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay open"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manga-modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        />

        <div className="modal-layout">
          <div className="modal-media">
            <div className="modal-poster">
              <img
                className="img-mod"
                src={manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url}
                alt={manga.title}
              />
            </div>

            <div className="trailer-section">
              <h3>Trailer</h3>
              {trailerUrl ? (
                <div className="trailer">
                  <iframe
                    title={`Trailer ${manga.title}`}
                    src={trailerUrl}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="trailer-empty">Aucun trailer disponible.</div>
              )}
            </div>
          </div>

          <div className="modal-details">
            <div className="modal-header">
              <h2 id="manga-modal-title">{manga.title}</h2>
              <button
                type="button"
                className={`fav-button ${isFavorite ? 'is-active' : ''}`}
                onClick={() => onToggleFavorite(manga.mal_id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              />
            </div>
            <p className="syno">{manga.synopsis || 'Synopsis indisponible.'}</p>
            <div className="modal-meta">
              <p>Type: {manga.type || 'N/A'}</p>
              <p>Episodes: {manga.episodes || 'N/A'}</p>
              <p>Statut: {manga.status || 'N/A'}</p>
              <p>Durée: {manga.duration || 'N/A'}</p>
              <p>Note: {manga.score ? `${manga.score} / 10` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetailPopup;
