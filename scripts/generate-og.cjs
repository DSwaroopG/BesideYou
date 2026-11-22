// Google Fonts Instrument Sans 400 and 500 TTFs are used only to generate this asset.
// Usage: node scripts/generate-og.cjs <regular.ttf> <medium.ttf>
const { ImageResponse } = require('next/og');
const { createElement: h } = require('react');
const fs = require('node:fs');
async function main() {
 const image = new ImageResponse(h('div',{style:{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:'96px',background:'#F4F2ED',fontFamily:'Instrument Sans'}},
  h('div',{style:{display:'flex',fontSize:104,fontWeight:500,letterSpacing:'-2px'}},h('span',{style:{color:'#0B0C10'}},'Beside'),h('span',{style:{color:'#280137'}},'You')),
  h('div',{style:{fontSize:32,fontWeight:400,color:'#4A463F',marginTop:36,maxWidth:820,lineHeight:1.4}},'Outbound infrastructure for founder-led technical teams')),
  {width:1200,height:630,fonts:[{name:'Instrument Sans',data:fs.readFileSync(process.argv[2]),weight:400,style:'normal'},{name:'Instrument Sans',data:fs.readFileSync(process.argv[3]),weight:500,style:'normal'}]});
 fs.writeFileSync('public/og-image.png',Buffer.from(await image.arrayBuffer()));
 console.log('Created public/og-image.png: 1200 x 630');
}
main().catch(error=>{console.error(error);process.exit(1);});
