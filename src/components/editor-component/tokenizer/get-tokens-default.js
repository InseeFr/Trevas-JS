import { mergeLines } from './tokenizer-tools';

/* */
const getTokensDefault = text => [
	{ start: 0, stop: text.length, value: text, className: 'unmapped' },
];

export default lines => {
	const content = mergeLines(lines);
	return Promise.resolve(getTokensDefault(content));
};
