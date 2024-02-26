export function capitalizeString(str: string) {
	const words = str.split(' ');
	const capitalized = words.map(w => {
		return w.split('').map((s, i) => i === 0 ? s.toUpperCase() : s).join('')
	}).join(' ');
	return capitalized
}