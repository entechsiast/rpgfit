Feature: Stat Allocation System
  As a user of the RPG Character Creator
  I want to distribute stat points
  So that I can customize my hero's abilities

  Scenario: Verify initial stats default to 8
    Given I am on the character creator page
    And I am on the "Stats" tab
    Then each stat should display the value 8

  Scenario: Verify 27 points are available
    Given I am on the character creator page
    And I am on the "Stats" tab
    Then I should see "27 points remaining"

  Scenario: Increment a stat
    Given I am on the character creator page
    And I am on the "Stats" tab
    And I have 27 points remaining
    When I click the increment button for "Strength"
    Then Strength should display the value 9
    And I should see "26 points remaining"

  Scenario: Decrement a stat
    Given I am on the character creator page
    And I am on the "Stats" tab
    And I have incremented "Strength" to 9
    When I click the decrement button for "Strength"
    Then Strength should display the value 8
    And I should see "27 points remaining"

  Scenario: Cannot exceed max stat of 15
    Given I am on the character creator page
    And I am on the "Stats" tab
    And I have incremented "Strength" to 14
    When I click the increment button for "Strength"
    Then Strength should display the value 15
    And the increment button for Strength should be disabled

  Scenario: Cannot go below base stat of 8
    Given I am on the character creator page
    And I am on the "Stats" tab
    When I click the decrement button for "Strength"
    Then Strength should display the value 8
    And the decrement button for Strength should be disabled

  Scenario: Cannot allocate when 0 points remaining
    Given I am on the character creator page
    And I am on the "Stats" tab
    And I have allocated all 27 points
    When I click the increment button for "Strength"
    Then the increment button should be disabled
