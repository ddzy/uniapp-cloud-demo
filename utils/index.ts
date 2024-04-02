export function mergeObj(a : Record<string, any>, b : Record<string, any>) {
	for (let key in a) {
		if (b.hasOwnProperty(key)) {
			a[key] = b[key];
		}
	}
	return a;
}