import { writeFile } from 'node:fs/promises';
import xmlBuilder from 'xmlbuilder';
import plistUtils from 'plist';

/** @type {Record<string, { codepoint: string; description: string; }>} */
const glyphNames = await fetchFromSpec('metadata/glyphnames.json');
/** @type {Record<string, { description: string; glyphs: string[]; range_end: string; range_start: string; }>} */
const smuflRanges = await fetchFromSpec('metadata/ranges.json');
const glyphToRangeMap = Object.values(smuflRanges).reduce((map, range) => {
	range.glyphs.forEach((glyph) => {
		map[glyph] = range.description;
	});
	return map;
}, /** @type {Record<string, string>} */ ({}));

/**
 * Fetch data from the SMuFL specification repository.
 * @param {string} path Filename in the `w3c/smufl` repo to download, e.g. `"metadata/glyphnames.json"`.
 * @returns {Promise<any>} Parsed JSON object
 */
async function fetchFromSpec(path) {
	const url = `https://raw.githubusercontent.com/w3c/smufl/refs/heads/gh-pages/${path}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Error fetching ${url} — ${response.status} ${response.statusText}`);
	}
	return response.json();
}

const attributeList = [
	{ att: 'unicode' },
	{ att: 'unicodeLegacy' },
	{ att: 'name', req: true },
	{ att: 'sortName' },
	{ att: 'sortNameKeep' },
	{ att: 'category', req: true },
	{ att: 'subCategory' },
	{ att: 'script' },
	{ att: 'description' },
	{ att: 'production' },
	{ att: 'altNames' },
	{ att: 'decompose' },
	{ att: 'anchors' },
	{ att: 'accents' },
];

/**
 * Main function generating GlyphData-smufl.xml
 * @return {string} An XML string
 */
function generateGlyphData() {
	let xml = xmlBuilder.create('glyphData', { version: '1.0', encoding: 'UTF-8' });

	let dtd = xml.dtd().ele('glyphData', '(glyph)+').ele('glyph', 'EMPTY');

	attributeList.forEach((item) => {
		dtd.att('glyph', item.att, 'CDATA', item.req ? '#REQUIRED' : '#IMPLIED');
	});

	for (let name in glyphNames) {
		let glyph = glyphNames[name];
		let codepoint = glyph.codepoint.replace('U+', '');
		xml.ele('glyph', {
			unicode: codepoint,
			name: name,
			sortName: `SMuFL.${name}`,
			category: glyphToRangeMap[name],
			script: 'SMuFL',
			production: `uni${codepoint}`,
			description: glyph.description.toUpperCase(),
		});
	}

	return xml.end({ pretty: true });
}

/**
 * Main function generating Groups-smufl.plist
 * @return {string} An XML string following the PropertyList DTD
 */
function generatePList() {
	let subGroups = Object.keys(smuflRanges).map((key) => {
		let range = smuflRanges[key];
		return {
			name: range.description,
			list: range.glyphs,
		};
	});

	let plist = {
		languages: [
			{
				name: 'SMuFL',
				icon: 'MusicTemplate',
				subGroup: subGroups,
			},
		],
	};
	return plistUtils.build(plist);
}

await writeFile('dist/GlyphData-smufl.xml', generateGlyphData())
	.catch(console.error)
	.then(() => console.log('Saved GlyphData-smufl.xml to disk'));

await writeFile('dist/Groups-smufl.plist', generatePList())
	.catch(console.error)
	.then(() => console.log('Saved Groups-smufl.plist to disk'));
