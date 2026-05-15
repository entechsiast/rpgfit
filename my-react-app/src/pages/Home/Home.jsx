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
        </p>
        <Link to="/creator" className="home-button" data-testid="btn-create-character">
          Create Character
        </Link>
      </div>
    </div>
  );
}
