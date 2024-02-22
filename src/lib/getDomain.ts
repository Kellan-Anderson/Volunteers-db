export function getDomain() {
	if(process.env.NODE_ENV !== 'production') {
		return 'http://localhost:3000'
	}
}