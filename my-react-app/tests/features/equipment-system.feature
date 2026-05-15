Feature: Equipment System
  As a user of the RPG Character Creator
  I want to equip items on my hero
  So that I can enhance their capabilities

  Scenario: View available equipment items
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Equipment" tab
    Then I should see the "Leather Cap" item
    And I should see the "Iron Helm" item
    And I should see the "Longsword" item

  Scenario: Filter items by slot
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Equipment" tab
    And I filter by slot "Head"
    Then I should see "Leather Cap"
    And I should see "Iron Helm"
    And I should not see "Longsword"

  Scenario: Filter items by rarity
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Equipment" tab
    And I filter by rarity "Rare"
    Then I should see "Iron Plate"
    And I should not see "Leather Vest"

  Scenario: Equip an item to a slot
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And I am on the "Equipment" tab
    When I equip the "Iron Helm" item
    Then the "Head" slot should show "Iron Helm"

  Scenario: Unequip an item from a slot
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And the "Iron Helm" is equipped to the "Head" slot
    When I unequip the item from the "Head" slot
    Then the "Head" slot should be empty

  Scenario: Verify stat bonuses apply when equipped
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And I have equipped the "Iron Plate" item
    Then the STR stat should show the base value plus 3
    And the CON stat should show the base value plus 3

  Scenario: Verify stat bonuses remove when unequipped
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And I have equipped the "Iron Plate" item
    And the STR bonus is visible
    When I unequip the "Iron Plate" item
    Then the STR bonus should be removed

  Scenario: Equip rare item
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And I am on the "Equipment" tab
    When I equip the "Iron Plate" item
    Then the item should be displayed with a "rare" rarity color

  Scenario: Equip epic item
    Given I am on the character creator page
    And I have selected the "Paladin" class
    And I am on the "Equipment" tab
    When I equip the "Paladin Armor" item
    Then the item should be displayed with an "epic" rarity color
