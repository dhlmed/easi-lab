import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const pubs=JSON.parse(fs.readFileSync('dist/assets/publications.json','utf8'));
const researchSlides=JSON.parse(fs.readFileSync('dist/assets/research-slides.json','utf8'));
const content=JSON.parse(fs.readFileSync('dist/assets/site-content.json','utf8'));
const app=fs.readFileSync('dist/assets/app.js','utf8');
const basePath=content.basePath||'';
const localPath=value=>{assert(value.startsWith(basePath+'/'),`URL outside site path: ${value}`);return value.slice(basePath.length)};
const expectedContact=String.fromCharCode(105,118,121,109,101,100,50,55,64,115,110,117,46,97,99,46,107,114);
for(const name of fs.readdirSync('dist',{recursive:true})){
 if(!/\.(?:html|js|json|txt|svg|css|xml)$/.test(name))continue;
 assert(!fs.readFileSync('dist/'+name,'utf8').includes(expectedContact),`Contact address exposed as text: ${name}`);
}
assert.equal(pubs.length,215);
assert.equal(new Set(pubs.map(p=>p.id)).size,215);
assert(pubs.every((p,i)=>p.id===i+1&&p.year>=2004&&p.year<=2026&&p.title&&p.citation&&p.url));
assert.equal(pubs.find(p=>p.id===209).doi,'10.1111/exd.70218');
assert.equal(pubs.find(p=>p.id===178).doi,'10.1111/all.16121');
assert(pubs.every(p=>/^https:\/\/(doi.org|pubmed.ncbi.nlm.nih.gov|scholar.google.com)\//.test(p.url)));
let assertions=0;
for(const page of Object.keys(content.pages)){
 for(const lang of ['ko','en']){
  const context={window:{LAB_PUBLICATIONS:pubs,LAB_RESEARCH_SLIDES:researchSlides,LAB_SITE_CONTENT:content,__BUILD:true},document:{body:{dataset:{page}}},location:{search:'?lang='+lang},URLSearchParams,URL,FormData:class {constructor(form){this.form=form}entries(){return Object.entries(this.form.data)[Symbol.iterator]()}}};
  vm.createContext(context);vm.runInContext(app,context);
  const html=context.window.LAB.renderPage();
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${page} ${lang}: single primary heading`);
  assert(html.includes('id="main"')&&html.includes('href="#main"'));
  assert(!html.includes('undefined')&&!html.includes('[object Object]'));
  assert(!html.includes(expectedContact)&&!html.includes('mailto:'));
  assert(html.includes('data-contact-email')&&html.includes('#email-policy'));
  if(page==='join'||page==='about'){
   assert(html.includes('assets/contact-address.png')&&html.includes('data-copy-email'));
   assert.equal(context.window.LAB.contactUri(),'mailto:'+expectedContact);
   const draft={subject:'EASI 문의 & research',body:'첫 줄\nSecond line + symbols?'};
   const draftURI=new URL(context.window.LAB.contactUri(draft));
   assert.equal(draftURI.pathname,expectedContact);
   assert.equal(draftURI.searchParams.get('subject'),draft.subject);
   assert.equal(draftURI.searchParams.get('body'),draft.body);
  }
  assert(!/010[- ]\d{4}[- ]\d{4}|생년월일|Date of birth/.test(html));
  assert(html.includes(`data-lang="${lang}" lang="${lang}" hreflang="${lang}" class="active" aria-current="true"`));
  for(const match of html.matchAll(/href="([^"]+)"/g)){
   const href=match[1].replaceAll('&amp;','&');
   if(/^(https?:|mailto:|#)/.test(href))continue;
   const path=href.split(/[?#]/)[0];assert(fs.existsSync('dist'+localPath(path)),`${page} missing local link ${path}`);
  }
  for(const match of html.matchAll(/src="([^"]+)"/g))assert(fs.existsSync('dist'+localPath(match[1])));
  if(page==='members'){
   assert.equal((html.match(/class="member-card"/g)||[]).length,11);
   assert(!html.includes('member-publication')&&!html.includes('Read a publication')&&!html.includes('논문 읽기'));
  }
  if(page==='home'){
   assert.equal((html.match(/class="experiment-slide /g)||[]).length,researchSlides.length);
   assert.equal((html.match(/class="experiment-slide is-active"/g)||[]).length,1);
   assert(!html.includes('class="art-top"'));
   assert.equal(researchSlides[0].id,'ox40-treg-validation');
   assert.equal(researchSlides.filter(s=>s.doi==='https://doi.org/10.1111/all.16121').length,1);
   assert(!html.includes('single-cell-atlas.webp'));
   assert(html.includes('id="approach"')&&html.includes('pySCENIC'));
   assert(researchSlides.every(s=>html.includes(s.file)&&html.includes(s.doi)&&html.includes(s.panel)&&html.includes(s.licenseUrl)));
  }
  if(page==='funding'){
   assert.equal((html.match(/class="funder-card"/g)||[]).length,2);
   assert(html.includes('National Research Foundation of Korea')&&html.includes('Ministry of Health and Welfare'));
   assert(html.includes(lang==='en'?'https://eng.nrf.re.kr/':'https://www.nrf.re.kr/'));
   assert(html.includes(lang==='en'?'https://www.mohw.go.kr/eng/':'https://www.mohw.go.kr/'));
  }
  if(page==='home'||page==='research'){
   assert(html.includes('Medical Devices &amp; EBD')||html.includes('Medical Devices & EBD'));
   assert(html.includes('medical-devices.svg'));
   assert(html.includes('/collaborate.html'));
  }
  if(page==='join'){
   assert(html.includes('value="academic-collaboration"')&&html.includes('value="industry-collaboration"'));
   for(const position of ['masters','academic-collaboration','industry-collaboration']){
    const data={name:'홍길동 & Kim',background:'Research institute',position,start:'2027',interest:'EBD mechanisms\nSkin & AI'};
    const draft=context.window.LAB.emailDraft({data,querySelector:()=>({selectedOptions:[{textContent:position}]})});
    const collab=position.endsWith('collaboration');
    assert.equal(draft.subject.includes('collaboration / 공동연구'),collab);
    assert(draft.body.includes(lang==='ko'?(collab?'공동연구 가능성':'연구실 참여'):(collab?'research collaboration':'joining your research group')));
    assert(draft.body.includes(data.interest));
    const uri=new URL(context.window.LAB.contactUri(draft));assert.equal(uri.searchParams.get('body'),draft.body);
   }
  }
  if(page==='publications'){
   const search=context.window.LAB.filteredPapers;
   const base={search:'',year:'all',topic:'all',scope:'all'};
   assert.equal(search(base).length,215);
   const selected=search({...base,scope:'selected'});
   assert.equal(selected.length,15);
   assert(selected.some(p=>p.id===105),'Original PDF confirms lead role for paper 105');
   for(const id of [177,198,199,201,202])assert(!selected.some(p=>p.id===id),`Non-lead or unresolved paper ${id} must not be selected`);
   assert(selected.every(p=>content.correspondence[p.id]?.authors.some(a=>a.isPI)||content.firstAuthorship[p.id]));
   assert(search({...base,year:'2026'}).every(p=>p.year===2026));
   assert(search({...base,search:'miR-382-5p'}).some(p=>p.id===209));
   assert(search({...base,search:'ALL.16121'}).some(p=>p.id===178));
   assert.equal(search({...base,search:'zz-no-paper-9876'}).length,0);
   const devices=search({...base,topic:'devices'});
   assert(devices.some(p=>p.id===37)&&devices.some(p=>p.id===155)&&!devices.some(p=>p.id===119));
   assert(search({...base,topic:'neuro'}).some(p=>p.id===179));
   context.window.LAB.setFilters({page:18});
   assert(context.window.LAB.renderPage().includes('18 / 18'));
   context.window.LAB.setFilters({search:'zz-no-paper-9876'});
   assert(context.window.LAB.renderPage().includes('data-reset'));
  }
  assertions++;
 }
}
console.log(`PASS: ${assertions} bilingual page renders, internal links, 215 citations, search, filters, pagination, empty state, contact image, no plaintext address/static mailto, and correct student/collaborator email drafts, medical-device filter and funding routes.`);
