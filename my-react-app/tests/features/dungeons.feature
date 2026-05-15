Feature: Dungeon Exploration
  As a player with a created character
  I want to explore dungeons to earn XP, gold, and loot
  So that I can grow stronger and progress through the game.

  Background:
    Given I have a saved character with class and race selected

  Scenario: View list of available dungeons
    Given I am on the dungeons tab
    Then I should see a list of available dungeons
    And I should see "Goblin Caves" in the dungeon list
    And I should see "Dark Forest Ruins" in the dungeon list
    And I should see "Abandoned Mine" in the dungeon list
    And I should see "Dragon's Peak" in the dungeon list
    And I should see "The Abyssal Throne" in the dungeon list

  Scenario: Dungeon locked when level too low
    Given my character is at level 1
    And I am on the dungeons tab
    When dungeons are displayed
    Then "Dragon's Peak" should appear locked
    And "The Abyssal Throne" should appear locked
    And locked dungeons should display a level requirement message

  Scenario: Dungeon locked when level too high
    Given my character is at level 16
    And I am on the dungeons tab
    When dungeons are displayed
    Then "Goblin Caves" should appear locked
    And locked dungeons should display a level requirement message

  Scenario: Enter a dungeon
    Given my character is at level 2
    And I am on the dungeons tab
    When I click on "Goblin Caves" dungeon card
    Then combat should begin
    And I should see the current monster's name
    And the combat log should be visible

  Scenario: View dungeon details with monsters and boss
    Given my character is at level 2
    And I am on the dungeons tab
    When I click on "Goblin Caves" dungeon card
    Then I should see the dungeon name "Goblin Caves"
    And I should see the difficulty "Easy"
    And I should see a list of monsters
    And I should see a boss named "Goblin Chieftain"
    And I should see completion rewards

  Scenario: Dungeon shows completion badge
    Given my character is at level 2
    And I am on the dungeons tab
    And I have completed "Goblin Caves"
    When dungeons are displayed
    Then "Goblin Caves" should display a completion badge
    And the completion badge should contain a checkmark symbol

  Scenario: Dungeons tab shows placeholder without class/race
    Given I have not selected a class or race
    When I navigate to the dungeons tab
    Then I should see a placeholder message
    And the placeholder should say "Select a class and race to access dungeons"
    And no dungeon cards should be visible

  Scenario: Available dungeons sorted by difficulty
    Given my character is at level 5
    And I am on the dungeons tab
    When dungeons are displayed
    Then dungeons should appear in order of increasing difficulty
    And "Goblin Caves" should appear before "Dark Forest Ruins"
    And "Dark Forest Ruins" should appear before "Abandoned Mine"
