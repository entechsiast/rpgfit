Feature: Reward System

  As a player completing dungeon combat,
  I want to receive XP, gold, and loot rewards so that I can grow stronger and progress.

  Background:
    Given I have a saved character with class and race selected
    And I am in an active dungeon combat

  Scenario: Earn XP from defeating monsters
    Given the player defeats a monster
    When combat round ends
    Then the player should earn XP from the monster defeat
    And the XP reward should be displayed in the rewards summary
    And the player's total XP should increase by the monster's XP value

  Scenario: Earn gold from defeating monsters
    Given the player defeats a monster
    When combat round ends
    Then the player should earn gold from the monster defeat
    And the gold reward should be displayed in the rewards summary
    And the player's total gold should increase by the monster's gold value

  Scenario: Receive guaranteed dungeon completion reward
    Given the player has defeated all regular monsters in the dungeon
    When the player defeats the dungeon boss
    Then the player should receive a guaranteed dungeon completion reward
    And the guaranteed reward should be displayed in the rewards summary
    And the player's inventory should contain the guaranteed reward item

  Scenario: Receive boss guaranteed loot
    Given the player has defeated all regular monsters in the dungeon
    When the player defeats the dungeon boss
    Then the player should receive guaranteed boss loot
    And the boss loot should be a rare quality item
    And the boss loot should be displayed in the rewards summary

  Scenario: Receive random loot drops
    Given the player defeats a monster
    When combat round ends
    Then the player should have a chance to receive random loot drops
    And the loot drop chance should follow weighted probabilities
    And any dropped loot should be displayed in the rewards summary

  Scenario: XP triggers level up
    Given the player has enough XP to reach the next level threshold
    When the player earns XP from a monster defeat
    Then the player should level up immediately
    And a level up notification should be displayed
    And the player's new level should be shown

  Scenario: Level up grants stat point
    Given the player levels up
    When the level up completes
    Then the player should receive 1 free stat point
    And the free stat point should be available for allocation
    And the available stat points counter should reflect the new point

  Scenario: Level up increases max HP and max MP
    Given the player levels up
    When the level up completes
    Then the player's max HP should increase based on class
    And the player's max MP should increase based on class
    And the new max HP and max MP values should be displayed
