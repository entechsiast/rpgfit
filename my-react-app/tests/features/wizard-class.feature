Feature: Wizard Class Selection
  As a player creating a character
  I want to select the Wizard class
  So that I can play a magic-focused hero

  Background:
    Given I am on the character creator page
    And I am on the "Class" tab

  Scenario: Select Wizard class
    When I select the "Wizard" class
    Then the Wizard card should be highlighted

  Scenario: Wizard shows correct stat bonuses
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Wizard" class
    Then "STR" should display the value 7
    And "INT" should display the value 10
    And "WIS" should display the value 9

  Scenario: Wizard starts with staff and robe
    Given I am on the character creator page
    And I am on the "Class" tab
    When I select the "Wizard" class
    Then I should see "Apprentice Staff"
    And I should see "Cloth Robe"
