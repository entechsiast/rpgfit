Feature: Navigation
  As a user of the RPG Character Creator
  I want to navigate between pages
  So that I can access the creator and return home

  Scenario: Home page displays title and create button
    Given I am on the home page
    Then I should see "RPG Character Creator" as the title
    And I should see a "Create Character" button

  Scenario: Navigate to creator page
    Given I am on the home page
    When I click the "Create Character" button
    Then I should be on the "/creator" page
    And I should see the "Character Creator" title

  Scenario: Unknown route redirects to home
    Given I am on an unknown route "/nonexistent"
    Then I should be redirected to the home page
    And I should see "RPG Character Creator" as the title
