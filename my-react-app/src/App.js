import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CharacterProvider } from './contexts/CharacterContext';
import Home from './pages/Home/Home';
import RPGCharacterCreator from './pages/RPGCharacterCreator/RPGCharacterCreator';
import AdventurePage from './pages/Adventure/AdventurePage';
import SavedCharacters from './pages/SavedCharacters/SavedCharacters';

function App() {
  return (
    <CharacterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/creator" element={<RPGCharacterCreator />} />
          <Route path="/adventure" element={<AdventurePage />} />
          <Route path="/characters" element={<SavedCharacters />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CharacterProvider>
  );
}

export default App;
