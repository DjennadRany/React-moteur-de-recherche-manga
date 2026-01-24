import React from 'react';
import DiscoverSections from '../components/anime/DiscoverSections';
import MangaList from '../components/anime/MangaList';
import FilterBar from '../components/search/FilterBar';
import SearchBar from '../components/search/SearchBar';

const HomePage = ({
  query,
  onQueryChange,
  onSearch,
  filters,
  genres,
  years,
  onFiltersChange,
  onClearFilters,
  rateLimitMessage,
  error,
  showDiscover,
  favoritesSet,
  onToggleFavorite,
  visibleMangas,
  loading,
  emptyMessage,
  hasNextPage,
  onLoadMore,
  viewMode,
  onViewModeChange,
}) => (
  <div className="appShell">
    <div className="view-toggle" role="tablist" aria-label="Basculer l'affichage">
      <button
        type="button"
        className={`view-toggle__button ${viewMode === 'all' ? 'is-active' : ''}`}
        onClick={() => onViewModeChange('all')}
        role="tab"
        aria-selected={viewMode === 'all'}
      >
        Tous
      </button>
      <button
        type="button"
        className={`view-toggle__button ${viewMode === 'favorites' ? 'is-active' : ''}`}
        onClick={() => onViewModeChange('favorites')}
        role="tab"
        aria-selected={viewMode === 'favorites'}
      >
        Favoris
      </button>
    </div>

    <SearchBar query={query} onQueryChange={onQueryChange} onSearch={onSearch} />

    <FilterBar
      filters={filters}
      genres={genres}
      years={years}
      onChange={onFiltersChange}
      onApplyFilter={() => onSearch(query)}
      onClearFilters={onClearFilters}
    />

    {rateLimitMessage && (
      <div className="status-banner" role="status" aria-live="polite">
        {rateLimitMessage}
      </div>
    )}

    {error && (
      <div className="error-state" role="alert">
        <p>{error}</p>
        <button type="button" className="ghost-button btn btnGhost" onClick={() => onSearch(query)}>
          Réessayer
        </button>
      </div>
    )}

    {showDiscover ? (
      <DiscoverSections favoritesSet={favoritesSet} onToggleFavorite={onToggleFavorite} />
    ) : (
      <MangaList
        mangas={visibleMangas}
        onToggleFavorite={onToggleFavorite}
        favoritesSet={favoritesSet}
        isLoading={loading}
        emptyMessage={emptyMessage}
      />
    )}

    {!loading && !error && hasNextPage && (
      <div className="load-more">
        <button type="button" className="primary-button btn btnPrimary" onClick={onLoadMore}>
          Charger plus
        </button>
      </div>
    )}
  </div>
);

export default HomePage;
