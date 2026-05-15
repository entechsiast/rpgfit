Feature: HP/MP System
  As a player managing my character's vitality and mana
  I want HP and MP bars to display accurately and respond correctly to combat and rest actions
  So that I can monitor my character's health and resources throughout gameplay.

  Background:
    Given I have a saved character with class and race selected
    And my character has full HP and full MP

  Scenario: HP displayed in character preview
    Given I am on the character creator page
    When I view the character preview
    Then the HP bar should be visible in the preview
    And the HP bar should show current/max HP values

  Scenario: MP displayed in character preview
    Given I am on the character creator page
    When I view the character preview
    Then the MP bar should be visible in the preview
    And the MP bar should show current/max MP values

  Scenario: HP decreases during combat
    Given my character has full HP
    When I enter a dungeon and combat resolves
    Then my HP should decrease
    And the HP bar should display the reduced HP value

  Scenario: MP decreases when using skills
    Given my character has full MP
    When I use a skill that costs MP
    Then my MP should decrease
    And the MP bar should display the reduced MP value

  Scenario: Rest restores HP to max
    Given my character has reduced HP
    When I rest to recover
    Then my HP should be restored to maximum
    And the HP bar should show the full HP value

  Scenario: Rest restores MP to max
    Given my character has reduced MP
    When I rest to recover
    Then my MP should be restored to maximum
    And the MP bar should show the full MP value

  Scenario: Rest costs gold based on character level
    Given my character has level 1
    And my character has sufficient gold
    When I rest to recover
    Then my gold should decrease
    And the gold cost should be calculated based on my level
