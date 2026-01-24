import React from 'react';

const getInitials = (text) => {
  if (!text) return 'OD';
  const trimmed = text.trim();
  if (!trimmed) return 'OD';
  return trimmed.slice(0, 2).toUpperCase();
};

const Poster = ({ src, alt, className = '' }) => {
  const initials = getInitials(alt);

  return (
    <div className={`poster ${className}`.trim()}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="poster__img" />
      ) : (
        <div className="poster__placeholder" aria-label="No cover">
          <span className="poster__initials">{initials}</span>
          <span className="poster__label">No cover</span>
        </div>
      )}
    </div>
  );
};

export default Poster;
