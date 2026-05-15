Feature: Leveling System
  As a player with a created character
  I want to gain XP and level up to grow stronger
  So that I can unlock new dungeons and face tougher enemies.

  Background:
    Given I have a saved character with class and race selected

  Scenario: Character starts at level 1
    Given my character is at level 1
    When I view my character sheet
    Then I should see my level displayed as 1

  Scenario: Gain XP increases progress
    Given my character is at level 1
    And my character has 0 XP
    When I gain 50 XP
    Then I should see my XP progress bar updated
    And I should see "50/100 XP" displayed

  Scenario: XP threshold triggers level up
    Given my character is at level 1
    And my character has 100 XP
    When I gain 0 XP
    Then a level up modal should appear
    And the modal should display "Level Up!"
    And the modal should show remaining stat points to allocate

  Scenario: Allocate stat point on level up
    Given my character is at level 1
    And I have just leveled up to level 2
    When I allocate a stat point to "Strength"
    Then the stat point allocation should be recorded
    And remaining stat points should decrease by 1

  Scenario: Stat point increases chosen stat
    Given my character is at level 1
    And I have allocated a stat point to "Strength"
    When I view my character sheet
    Then Strength should display the value 9
    And other stats should remain unchanged

  Scenario: Max HP increases on level up
    Given my character is at level 1
    And I have just leveled up to level 2
    When I view my character sheet
    Then my max HP should increase
    And the HP increase should reflect the class hitDie and CON modifier

  Scenario: Max MP increases on level up
    Given my character is at level 1
    And I have just leveled up to level 2
    When I view my character sheet
    Then my max MP should increase
    And the MP increase should reflect INT, WIS, and level scaling
