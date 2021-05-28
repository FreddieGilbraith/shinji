angelAttack.matcher = /Angels attack the earth 15 years ago/;
export function angelAttack(t) {
	t.context = {
		tokyo: 3,
	};
}

foundNerv.matcher = /NERV is founded to fight back/;
export function foundNerv(t) {
	t.context = {
		NERVFounded: true,
	};
}
