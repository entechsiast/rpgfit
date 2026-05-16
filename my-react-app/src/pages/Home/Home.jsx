import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-title" data-testid="home-title">RPG Character Creator</h1>
        <p className="home-subtitle">
          Design your hero. Choose a class, race, stats, appearance, and skills.
          Then venture into dungeons, battle monsters, and grow stronger.
        </p>
        <div className="home-buttons">
          <Link to="/creator" className="home-button btn-create" data-testid="btn-create-character" aria-label="Create a new character">
            🗡️ Create Character
          </Link>
          <Link to="/characters" className="home-button btn-characters" data-testid="btn-my-characters" aria-label="View my saved characters">
            👤 My Characters
          </Link>
          <Link to="/adventure" className="home-button btn-adventure" data-testid="btn-adventure" aria-label="Start an adventure session">
            ⚔️ Adventure
          </Link>
        </div>
      </div>
    </div>
  );
}
