## Description

Implement a visual avatar component for the character creator that renders the player's hero based on race, class, and appearance selections. This component should display race-specific features (elf ears, orc tusks), class armor (warrior armor, mage robes), and appearance choices (hair color).

## Acceptance Criteria

Based on tests/features/visual-avatar.feature and tests/step-definitions/avatar.steps.ts:

- [ ] Avatar placeholder shows "Select a race to begin" when no race selected
- [ ] Avatar updates when race changes (elf ears for Elf, orc tusks for Orc, etc.)
- [ ] Avatar updates when class changes (warrior armor, mage robes, etc.)
- [ ] Avatar updates when hair color changes
- [ ] Component has data-testid="character-avatar" and data-testid="preview-card"
- [ ] Race tab has data-testid="tab-race", race cards have data-testid="race-card-{name}"
- [ ] Class tab has data-testid="tab-class", class cards have data-testid="class-card-{name}"
- [ ] Appearance tab has data-testid="tab-appearance", hair options have data-testid="hairColor-{color}"

## Related Issues

Parent Epic: #79 (epic: avatar system)
Stories: #97, #98, #99

## BDD Tests

- Feature: tests/features/visual-avatar.feature
- Steps: tests/step-definitions/avatar.steps.ts
