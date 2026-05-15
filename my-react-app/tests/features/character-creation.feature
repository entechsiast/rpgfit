Feature: Character Class Selection
  As a user of the RPG Character Creator
  I want to choose a character class
  So that I can define my hero's role and abilities

  Scenario: Navigate to the character creator from home page
    Given I am on the home page
    When I click the "Create Character" button
    Then I should be on the "/creator" page
    And I should see the "Character Creator" title

  Scenario: Select warrior class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Warrior" class
    Then the Warrior card should be highlighted
    And the stats should reset to base values

  Scenario: Select mage class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Mage" class
    Then the Mage card should be highlighted
    And the stats should reset to base values

  Scenario: Select rogue class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Rogue" class
    Then the Rogue card should be highlighted
    And the stats should reset to base values

  Scenario: Select cleric class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Cleric" class
    Then the Cleric card should be highlighted
    And the stats should reset to base values

  Scenario: Select ranger class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Ranger" class
    Then the Ranger card should be highlighted
    And the stats should reset to base values

  Scenario: Select paladin class
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Paladin" class
    Then the Paladin card should be highlighted
    And the stats should reset to base values
