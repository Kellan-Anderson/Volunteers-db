type randomIdProps = {
	prefix?: string,
	length?: number
}

const DEFAULT_LENGTH = 8;

export function randomId(props?: randomIdProps) {
	const key = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const len = props?.length ?? DEFAULT_LENGTH;
	const prefix = props?.prefix ? `${props.prefix}-` : ''
	let rtn = '';

	for(let i = 0; i < len; i++) {
		const randChar = key[Math.floor(Math.random() * key.length)];
		rtn = rtn + randChar!;
	}

	return `${prefix}${rtn}`
}