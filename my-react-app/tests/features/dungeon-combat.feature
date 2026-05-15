Feature: Dungeon Exploration and Combat

  As a player with a created character,
  I want to explore dungeons and engage in combat,
  So that I can earn XP, gold, and loot to grow stronger.

  Background:
    Given I have a saved character
    And I navigate to the adventure page

  Scenario: View available dungeons
    When I view the adventure tab
    Then I should see a list of available dungeons
    And the "Goblin Caves" dungeon should be visible
    And the "Dark Forest Ruins" dungeon should be visible

  Scenario: Enter and complete a dungeon
    When I enter the "Goblin Caves" dungeon
    Then combat should begin
    And I should see the current monster's name
    And the combat log should show battle results
    When combat resolves
    Then I should see the dungeon complete results
    And I should see XP and gold rewards

  Scenario: View character sheet
    When I switch to the character tab
    Then I should see my character's name
    And I should see my level
    And I should see all six core stats
    And I should see my HP and MP values

  Scenario: View inventory
    When I switch to the inventory tab
    Then I should see the equipment section
    And I should see the consumables section
    And I should see the shop section

  Scenario: Buy items from shop
    When I switch to the inventory tab
    And I have at least 25 gold
    Then I should see the shop items
    When I buy a "Healing Potion"
    Then my gold should decrease by 25
    And I should have one "Healing Potion" in my inventory

  Scenario: Use a consumable
    Given I have a "Healing Potion" in my inventory
    When I am on the inventory tab
    And my current HP is less than my max HP
    Then I should see a "Use" button for the Healing Potion
    When I use the "Healing Potion"
    Then my HP should increase

  Scenario: Navigate back to character creator
    When I click the "Edit Character" link
    Then I should be on the character creator page
