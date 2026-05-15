Feature: Skill Selection
  As a user of the RPG Character Creator
  I want to select skills for my hero
  So that I can define my character's expertise

  Scenario: View available skills for warrior
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Skills" tab
    Then I should see the "Swordsmanship" skill
    And I should see the "Shield Bash" skill
    And I should see the "War Cry" skill

  Scenario: View available skills for mage
    Given I am on the character creator page
    And I have selected the "Mage" class
    When I navigate to the "Skills" tab
    Then I should see the "Fireball" skill
    And I should see the "Ice Storm" skill
    And I should see the "Arcane Bolt" skill

  Scenario: Toggle a skill on
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Skills" tab
    And I toggle the "Swordsmanship" skill
    Then the "Swordsmanship" skill should be selected

  Scenario: Toggle a skill off
    Given I am on the character creator page
    And I have selected the "Warrior" class
    And the "Swordsmanship" skill is selected
    When I toggle the "Swordsmanship" skill
    Then the "Swordsmanship" skill should be unselected

  Scenario: Verify class starting skills are pre-selected
    Given I am on the character creator page
    And I have selected the "Warrior" class
    When I navigate to the "Skills" tab
    Then the "Swordsmanship" skill should be pre-selected
    And the "Shield Bash" skill should be pre-selected
    And the "War Cry" skill should be pre-selected

  Scenario: Verify race bonus skills are included
    Given I am on the character creator page
    And I have selected the "Elf" race
    When I navigate to the "Skills" tab
    Then I should see the "Arcana" skill
    And I should see the "Perception" skill
