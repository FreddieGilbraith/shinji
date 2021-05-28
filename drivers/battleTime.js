prepedForLaunch.matcher = /unit (?<unitNumber>\d+) is prepared for launch/;
export function prepedForLaunch({ unitNumber }, t) {
	t.context = {
		prepedUnit: unitNumber,
	};
}

const unitAssignment = {
	Rei: "00",
	Shinji: "01",
	Asuka: "02",
};

shoutAtTeen.matcher = /I shout at (?<teenName>\w+)/;
export function shoutAtTeen({ teenName }, t) {
	t.context = {
		shoutedTeen: teenName,
	};
}

teenShouldFeel.matcher = /(?<teenName>\w+) should feel (?<emotion>\w+)/;
export function teenShouldFeel({ teenName, emotion }, t) {
	t.assert(unitAssignment[t.context.shoutedTeen], t.context.prepedUnit);
}
