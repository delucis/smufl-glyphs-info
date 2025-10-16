const FS = require('fs')
const XMLBUILDER = require('xmlbuilder')
const PLIST = require('plist')

const GLYPHNAMES = require('smufl/metadata/glyphnames.json')
const RANGES = require('smufl/metadata/ranges.json')
const GLYPH2RANGEMAP = Object.values(RANGES).reduce((map, range) => {
  range.glyphs.forEach(glyph => { map[glyph] = range.description })
  return map
}, {})

const ATTLIST = [
  { att: 'unicode' },
  { att: 'unicodeLegecy' },
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
  { att: 'accents' }
]

/**
 * Main function generating GlyphData-smufl.xml
 * @return {String} An XML string
 */
function generateGlyphData () {
  let xml = XMLBUILDER.create(
    'glyphData',
    { version: '1.0', encoding: 'UTF-8' }
  )

  let dtd = xml.dtd()
    .ele('glyphData', '(glyph)+')
    .ele('glyph', 'EMPTY')

  ATTLIST.forEach(item => {
    dtd.att('glyph', item.att, 'CDATA', item.req ? '#REQUIRED' : '#IMPLIED')
  })

  for (let name in GLYPHNAMES) {
    let glyph = GLYPHNAMES[name]
    let codepoint = glyph.codepoint.replace('U+', '')
    xml.ele('glyph', {
      name: name,
      sortName: `SMuFL.${name}`,
      description: glyph.description.toUpperCase(),
      category: 'SMuFL',
      subCategory: GLYPH2RANGEMAP[name],
      unicode: codepoint,
      production: `uni${codepoint}`,
      script: 'musical'
    })
  }

  return xml.end({ pretty: true })
}

/**
 * Main function generating Groups-smufl.plist
 * @return {String} An XML string following the PropertyList DTD
 */
function generatePList () {
  let subGroups = Object.keys(RANGES).map(key => {
    let range = RANGES[key]
    return {
      name: range.description,
      coverage: range.glyphs
    }
  })

  let plist = {
    categories: [
      {
        name: 'SMuFL',
        icon: 'MusicTemplate',
        subGroup: subGroups
      }
    ]
  }
  return PLIST.build(plist)
}

FS.writeFile('dist/GlyphData-smufl.xml', generateGlyphData(), err => {
  if (err) {
    console.error(err)
  } else {
    console.log('Saved GlyphData-smufl.xml to disk')
  }
})

FS.writeFile('dist/Groups-smufl.plist', generatePList(), err => {
  if (err) {
    console.error(err)
  } else {
    console.log('Saved Groups-smufl.plist to disk')
  }
})
