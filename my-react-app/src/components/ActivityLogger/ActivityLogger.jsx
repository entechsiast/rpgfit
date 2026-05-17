import React, { useState, useRef, useEffect } from 'react';
import { useCharacterDispatch, useCharacter } from '../../contexts/CharacterContext';
import DailyStreakIndicator from '../RewardFeedback/DailyStreakIndicator';
import './ActivityLogger.css';

const ACTIVITY_TYPES = [
  { id: 'walking', label: 'Walking', emoji: '\uD83D\uDEB6' },
  { id: 'running', label: 'Running', emoji: '\uD83C\uDFC3' },
  { id: 'cycling', label: 'Cycling', emoji: '\uD83D\uDEB4' },
  { id: 'workout', label: 'Workout', emoji: '\uD83C\uDFCB' },
  { id: 'free-form', label: 'Free-form', emoji: '\uD83C\uDFAF' },
];

/**
 * ActivityLogger — Form for logging physical activity sessions.
 *
 * Props:
 *   onCapReached: function — callback when daily cap is reached
 *   streak: number — current reward streak
 *   todayCount: number — today's reward count
 */
export default function ActivityLogger({ onCapReached, streak = 0, todayCount = 0 }) {
  const dispatch = useCharacterDispatch();
  const character = useCharacter();
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const successTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check daily cap before processing
    const capped = todayCount >= 2;
    if (capped) {
      setError('Daily reward cap reached - try again tomorrow!');
      if (onCapReached) onCapReached();
      return;
    }

    if (!character.class || !character.race) {
      setError('Please select a class and race before logging activity');
      return;
    }

    if (!type) {
      setError('Please select an activity type');
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum < 5) {
      setError('Duration must be at least 5 minutes');
      return;
    }

    setLoading(true);

    const session = {
      type,
      duration: durationNum,
      notes: notes.trim(),
      date: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_SESSION', payload: session });

    // Reset form
    setType('');
    setDuration('');
    setNotes('');
    setLoading(false);

    // Show success briefly
    setSuccess(true);
    successTimer.current = setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="activity-logger" data-testid="activity-logger">
      <h3 className="activity-logger-title">Log Activity Session</h3>

      {/* Daily streak indicator */}
      <DailyStreakIndicator
        streak={streak}
        todayCount={todayCount}
        maxSessions={2}
      />

      {success && (
        <div className="activity-success" data-testid="activity-success">
          Session logged successfully!
        </div>
      )}

      {error && (
        <div className="activity-error" data-testid="activity-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="activity-form">
        <div className="activity-type-selector">
          <span className="activity-type-label">Activity Type:</span>
          <div className="activity-type-buttons">
            {ACTIVITY_TYPES.map(act => (
              <button
                key={act.id}
                type="button"
                className={`activity-type-btn ${type === act.id ? 'active' : ''}`}
                onClick={() => setType(act.id)}
                data-testid={`activity-type-${act.id}`}
              >
                <span className="activity-emoji">{act.emoji}</span>
                <span className="activity-label-text">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="activity-duration-field">
          <label htmlFor="activity-duration">Duration (minutes):</label>
          <input
            id="activity-duration"
            type="number"
            min="5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 30"
            data-testid="activity-duration-input"
          />
        </div>

        <div className="activity-notes-field">
          <label htmlFor="activity-notes">Notes (optional):</label>
          <textarea
            id="activity-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it go?"
            rows="2"
            data-testid="activity-notes-input"
          />
        </div>

        <button
          type="submit"
          className="btn-log-session"
          disabled={loading}
          data-testid="btn-log-session"
        >
          {loading ? 'Logging...' : 'Log Session'}
        </button>
      </form>
    </div>
  );
}
