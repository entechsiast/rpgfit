/**
 * Passive Narrative Messages — Tower 1
 *
 * Curiosity-driven messages that trigger after extended periods of inactivity.
 * These make the tower feel alive and observant, never guilt-inducing.
 *
 * Per spec section 9.1: NEVER use formulations like "You haven't come in X days"
 * or "You're losing your progress". ALWAYS frame as a curious invitation or
 * a world update.
 */

const PASSIVE_MESSAGES = {
  1: [
    'The moss seems to grow faster when you watch. Or perhaps it is merely impatient.',
    'A path laid out by patient hands. You wonder who, and why.',
    'The walls hum faintly, as if the tower itself is breathing.',
  ],
  2: [
    'The embers pulse. They are counting. You feel it.',
    'Warmth reaches for you — not the warmth of fire, but the warmth of something that has been waiting a very long time.',
    'Your shadow moves slightly out of sync. You choose not to look back.',
  ],
  3: [
    'The crystals hum. They have opinions about you.',
    'You can see farther than you ever have. The tower is showing you its secrets.',
    'The silence here has weight. It presses against your ears.',
  ],
  4: [
    'The wind speaks in a language older than words. You almost understand.',
    'The tower reaches back. You feel its fingers on your shoulder.',
    'Sky and stone are not separate here. You are not separate either.',
  ],
  5: [
    'The water ripples. Something beneath is watching.',
    'You have climbed. The tower has been waiting. It has been counting your steps.',
    'The light pulses. It knows you are here. It has always known.',
  ],
};

/**
 * Get passive messages for a given floor.
 * @param {number} floorNumber
 * @returns {string[]}
 */
export function getPassiveMessages(floorNumber) {
  return PASSIVE_MESSAGES[floorNumber] || [];
}

/**
 * Get a random passive message for a given floor.
 * @param {number} floorNumber
 * @returns {string|null}
 */
export function getRandomPassiveMessage(floorNumber) {
  const messages = getPassiveMessages(floorNumber);
  if (messages.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

export default PASSIVE_MESSAGES;
