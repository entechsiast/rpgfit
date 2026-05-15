import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import CharacterAvatar from '../../components/CharacterAvatar/CharacterAvatar';
import './SavedCharacters.css';

export default function SavedCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    const chars = await api.getSavedCharacters();
    setCharacters(chars);
    setLoading(false);
  };

  const handleLoad = async (id) => {
    await api.loadCharacterById(id);
    window.location.href = '/adventure';
  };

  const handleDelete = async (id) => {
    await api.deleteCharacter(id);
    await loadCharacters();
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="saved-characters">
        <div className="loading-state">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="saved-characters">
      <div className="saved-header">
        <h2>Your Characters</h2>
        <Link to="/creator" className="create-new-btn">
          + Create New Character
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">\uD83E\uDDDB</div>
          <p>No characters yet</p>
          <Link to="/creator" className="get-started-btn">
            Create Your First Hero
          </Link>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map(char => (
            <div key={char.id} className="character-card" data-testid={`character-card-${char.id}`}>
              <div className="card-avatar">
                <CharacterAvatar character={char} />
              </div>
              <div className="card-info">
                <h3 className="card-name">{char.name || 'Unnamed Hero'}</h3>
                <p className="card-class">
                  {char.race?.name} {char.class?.name}
                </p>
                <p className="card-level">Level {char.level || 1}</p>
                <div className="card-stats-mini">
                  <span className="stat-mini">HP: {char.maxHP || 10}</span>
                  <span className="stat-mini">MP: {char.maxMP || 5}</span>
                  <span className="stat-mini">Gold: {char.gold || 0}</span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="btn-load"
                  onClick={() => handleLoad(char.id)}
                  data-testid={`btn-load-${char.id}`}
                >
                  \uD83C\uDFAD Play
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setConfirmDelete(char.id)}
                  data-testid={`btn-delete-${char.id}`}
                >
                  \uD83D\uDDD1\uFE0F
                </button>
              </div>
              {confirmDelete === char.id && (
                <div className="delete-confirm" data-testid={`delete-confirm-${char.id}`}>
                  <p>Delete this character?</p>
                  <button className="btn-confirm-delete" onClick={() => handleDelete(char.id)}>
                    Yes, Delete
                  </button>
                  <button className="btn-cancel-delete" onClick={() => setConfirmDelete(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
