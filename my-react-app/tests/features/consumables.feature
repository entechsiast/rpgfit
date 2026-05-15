Feature: Consumables
  As a player managing inventory
  I want to use consumable items to heal and buff my character
  So that I can survive combat and overcome stronger enemies.

  Background:
    Given I have a saved character with class and race selected
    And I am on the adventure page
    And I have navigated to the inventory tab

  Scenario: View available consumables
    Given I have a "Healing Potion" in my inventory
    And I have a "Buff Scroll" in my inventory
    When the consumables section is displayed
    Then I should see the consumables section
    And I should see "Healing Potion" in the consumables list
    And I should see "Buff Scroll" in the consumables list

  Scenario: Use healing potion to restore HP
    Given I have a "Healing Potion" in my inventory
    And my current HP is less than my max HP
    When I use the "Healing Potion"
    Then my HP should increase
    And my HP should increase by 30

  Scenario: Use buff scroll to increase stats
    Given I have a "Buff Scroll" in my inventory
    When I use the "Buff Scroll"
    Then my stats should be temporarily increased
    And I should see a confirmation message about the buff

  Scenario: Consumable is consumed after use
    Given I have a "Healing Potion" in my inventory
    When I use the "Healing Potion"
    Then the "Healing Potion" should be removed from my inventory
    And the consumables section should show zero items remaining
