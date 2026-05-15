Feature: Save, Load and Reset
  As a user of the RPG Character Creator
  I want to save, load and reset my character
  So that I can persist my work and start fresh

  Scenario: Save character to localStorage
    Given I am on the character creator page
    And I have created a character with the name "Thorin"
    When I click the save button
    Then I should see a "Saved!" confirmation
    And the character should be stored in localStorage

  Scenario: Load character from localStorage on page visit
    Given I have saved a character named "Thorin" in localStorage
    When I navigate to the character creator page
    Then the character name should be loaded as "Thorin"

  Scenario: Reset character clears all data
    Given I am on the character creator page
    And I have created a character with the name "Gandalf"
    When I click the reset button
    Then the character name should be empty
    And the class should be unselected
    And the race should be unselected

  Scenario: Reset clears localStorage
    Given I have saved a character in localStorage
    When I click the reset button
    Then the localStorage should be cleared
