Feature: Login
  As a user I want to sign in so I can access protected pages

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I fill in valid credentials and submit
    Then I should be redirected to the dashboard
