@NERVIntel
Feature: Human Instrumentality
	A great big plan to get everyone to have a cool time
	
	Background:
		Given Angels attack the earth 15 years ago
		And NERV is founded to fight back

	Scenario: Raising Penguins
		Given I am Misato
		When I arrive home
		Then I feed PenPen
		Then I feed Misato

	Scenario: End Credits
		Given the episode is over
		When the credits roll
		Then the audience should hear the following lyrics
			| verb | noun  |
			| fly  | moon  |
			| play | stars |

	@questionableEthics
	Scenario Outline: Shouting at Teens
		Given unit <unit> is prepared for launch
		When I shout at <name>
		Then <name> should feel <mood>

		Examples:
			| name   | unit | mood |
			| Rei    |  00  | sad  |
			| Shinji |  01  | sad  |
			| Asuka  |  02  | loud |

