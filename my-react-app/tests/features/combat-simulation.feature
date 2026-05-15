Feature: Combat Simulation

  As a player engaged in dungeon combat,
  I want combat to simulate automatically so that I can see fight outcomes clearly.

  Background:
    Given I have a saved character
    And I am in an active dungeon combat

  Scenario: Start combat in a dungeon
    When I enter a dungeon
    Then combat should begin
    And I should see the first monster's name
    And the combat log should be visible
    And the player's current HP should be displayed

  Scenario: Combat resolves automatically
    Given combat has started
    When time passes
    Then each monster fight should resolve without user input
    And the next monster should engage automatically
    And the combat log should update with each round

  Scenario: Win combat against all monsters and boss
    Given combat is in progress
    And the player has defeated all regular monsters
    When the boss fight completes
    Then I should see a victory message
    And I should see full XP rewards
    And I should see full gold rewards
    And the dungeon should be marked as completed

  Scenario: Lose combat (HP reaches 0)
    Given combat is in progress
    And the player's HP is low
    When the player takes damage
    Then the player's HP should reach 0
    And I should see a defeat message
    And the combat should end

  Scenario: See partial rewards on defeat
    Given the player has been defeated
    When combat ends
    Then I should see partial XP rewards
    And the XP reward should be 50% of the expected amount
    And I should see partial gold rewards
    And the gold reward should be 25% of the expected amount

  Scenario: View combat log after fight
    Given combat has ended
    When I view the combat log
    Then the combat log should show each round's damage
    And the log should display player actions
    And the log should display monster actions
    And the log should show damage values for each attack

  Scenario: Combat log shows player HP after each round
    Given combat is in progress
    When each round completes
    Then the combat log should show the player's HP after that round
    And the HP value should reflect the damage taken in that round
    And the HP should be visible for all rounds of combat
