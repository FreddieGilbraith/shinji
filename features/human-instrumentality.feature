@NERVIntel
Feature: Human Instrumentality
	
	Background:
		Given Angels attack the earth 15 years ago
		And NERV is founded to fight back

	Scenario: Raising Penguins
		Given I am Misato
		When I arrive home
		Then I feed PenPen

	@questionableEthics
	Scenario Outline: Shouting at Teens
		Given I prepare unit <unit> for launch
		When I shout at <name>
		Then <name> should feel <mood>

		Examples:
			| name   | unit | mood |
			| Rei    |  00  | sad  |
			| Shinji |  01  | sad  |
			| Asuka  |  02  | loud |

