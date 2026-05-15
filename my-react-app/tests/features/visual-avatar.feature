Feature: Visual Avatar Rendering
  As a user of the RPG Character Creator
  I want to see a visual representation of my hero
  So that I can verify my customization choices

  Scenario: Avatar shows placeholder before class/race selection
    Given I am on the character creator page
    When I view the character preview
    Then I should see the avatar placeholder message

  Scenario: Avatar updates when race changes
    Given I am on the character creator page
    And I have selected the "Elf" race
    When I view the character preview
    Then I should see elf ears on the avatar

  Scenario: Avatar updates when class changes
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I view the character preview
    Then I should see warrior armor on the avatar

  Scenario: Avatar updates when appearance changes
    Given I am on the character creator page
    And I have selected the "Elf" race
    And I have selected hair color "Red"
    When I view the character preview
    Then the avatar hair should be red

  Scenario: Avatar shows race-specific features
    Given I am on the character creator page
    And I have selected the "Orc" race
    When I view the character preview
    Then I should see orc tusks on the avatar

  Scenario: Avatar shows class armor
    Given I am on the character creator page
    And I have selected the "Mage" class
    When I view the character preview
    Then I should see mage robes on the avatar
