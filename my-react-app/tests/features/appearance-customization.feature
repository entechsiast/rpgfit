Feature: Appearance Customization
  As a user of the RPG Character Creator
  I want to customize my hero's appearance
  So that my character looks unique

  Scenario: Change hair color
    Given I am on the character creator page
    And I am on the "Appearance" tab
    When I select hair color "Black"
    Then the selected hair color should be "Black"

  Scenario: Change skin tone
    Given I am on the character creator page
    And I am on the "Appearance" tab
    When I select skin tone "Dark"
    Then the selected skin tone should be "Dark"

  Scenario: Change eye color
    Given I am on the character creator page
    And I am on the "Appearance" tab
    When I select eye color "Blue"
    Then the selected eye color should be "Blue"

  Scenario: Change hair style
    Given I am on the character creator page
    And I am on the "Appearance" tab
    When I select hair style "Long"
    Then the selected hair style should be "Long"

  Scenario: Change build type
    Given I am on the character creator page
    And I am on the "Appearance" tab
    When I select build "Athletic"
    Then the selected build should be "Athletic"
