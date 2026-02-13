Feature: Login
  As a user I want to sign in so I can access protected pages

  Scenario: Successful login with valid email and password
    Given I am on the login page
    When I enter email "admin@gmail.com" and password "admin@1234"
    And I submit the login form
    Then I should be redirected to the dashboard
    And I should see that I am logged in

  Scenario: Failed login with wrong password
    Given I am on the login page
    When I enter email "admin@gmail.com" and password "WrongPassword"
    And I submit the login form
    Then I should remain on the login page
    And I should see an error message about invalid credentials

  Scenario: Login with empty email and password
    Given I am on the login page
    When I leave email and password empty
    And I submit the login form
    Then I should remain on the login page
    And I should see validation errors for email and password

  Scenario: Boundary - very long email and password inputs
    Given I am on the login page
    When I enter an email of 256 characters and a password of 256 characters
    And I submit the login form
    Then I should remain on the login page
    And the form should handle the long inputs without crashing

  Scenario: Security - SQL injection attempt in email and password
    Given I am on the login page
    When I enter email "admin'--" and password "1' OR '1'='1"
    And I submit the login form
    Then I should remain on the login page
    And I should see an error or no unauthorized access
