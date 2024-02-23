type units = 'days' | 'months' | 'years';
type directions = 'from now' | 'ago';

export function createDate(timeAmount: number, unit: units, direction: directions) {
	if(timeAmount < 0)
		throw new Error('amount must be greater than 0');

	let amount = timeAmount;
	if(direction === 'ago') {
		amount = 0 - amount;
	}

	const date = new Date();
	if(unit === 'days') {
		date.setDate(date.getDate() + amount);
	} else if(unit === 'months') {
		date.setMonth(date.getMonth() + amount)
	} else {
		date.setFullYear(date.getFullYear() + amount)
	}

	return date;
}

export function compareDates(date1: Date, direction: 'before' | 'after', date2: Date) {
	if(direction === 'before') {
		return date1 < date2;
	}
	return date2 > date1
}