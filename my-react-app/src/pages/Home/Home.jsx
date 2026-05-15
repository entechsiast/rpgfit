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
          <Link to="/creator" className="home-button btn-create" data-testid="btn-create-character">
            \uD83E\uDDF5 Create Character
          </Link>
          <Link to="/characters" className="home-button btn-characters">
            \uD83D\uDC64 My Characters
          </Link>
          <Link to="/adventure" className="home-button btn-adventure">
            \u2694\uFE0F Adventure
          </Link>
        </div>
      </div>
    </div>
  );
}
