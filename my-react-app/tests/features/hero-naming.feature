Feature: Hero Naming
  As a user of the RPG Character Creator
  I want to name my hero
  So that I can personalize my character

  Scenario: Display "Unnamed Hero" when no name set
    Given I am on the character creator page
    When I view the character preview
    Then I should see "Unnamed Hero" as the character name

  Scenario: Click to enter name edit mode
    Given I am on the character creator page
    When I click on the character name
    Then the name input field should be visible
    And the input field should be focused

  Scenario: Enter a name and save
    Given I am on the character creator page
    When I click on the character name
    And I type "Aragorn" into the name input
    And I save the name
    Then the character name should display "Aragorn"

  Scenario: Verify name displays in preview
    Given I am on the character creator page
    And I have set the hero name to "Gandalf"
    When I view the character preview
    Then I should see "Gandalf" in the preview header

  Scenario: Cancel edit with Escape
    Given I am on the character creator page
    And the character name is "Aragorn"
    When I click on the character name
    And I type "Gimli" into the name input
    And I press Escape
    Then the character name should still be "Aragorn"

  Scenario: Truncate name at 30 characters
    Given I am on the character creator page
    When I click on the character name
    And I type a 31 character name into the name input
    Then the name input should not accept the 31st character
