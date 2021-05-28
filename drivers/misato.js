iAmMisato.matcher = /I am Misato/;
export function iAmMisato(t) {
	t.assert(t.context.NERVFounded === true, "Misato must have an employer");

	t.context = {
		user: "misato",
	};
}

const homes = {
	misato: {
		inhabitants: ["misato", "penpen"],
	},
};

iArriveHome.matcher = /I arrive home/;
export function iArriveHome(t) {
	t.context = {
		home: homes[t.context.user],
	};
}

iFeedSomeone.matcher = /I feed (?<characterToFeed>\w+)/;
export function iFeedSomeone({ characterToFeed }, t) {
	t.assert(
		t.context.home.inhabitants.includes(characterToFeed.toLowerCase()),
		`Could not feed ${characterToFeed}`,
	);
}
