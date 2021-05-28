endOfTheEpisode.matcher = /the episode is over/;
export function endOfTheEpisode(t) {
	t.context = {
		endOfEp: true,
	};
}

rollCredits.matcher = /the credits roll/;
export function rollCredits(t) {
	t.assert(t.context.endOfEp);
	t.context = {
		creditsRolling: true,
	};
}

shouldHearLyrics.matcher = /the audience should hear the following lyrics/;
export function shouldHearLyrics(lyrics, t) {
	const validPairs = { fly: "moon", play: "stars" };

	for (const { verb, noun } of lyrics) {
		t.assert(validPairs[verb] === noun);
	}
}
