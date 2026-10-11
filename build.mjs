import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=file=>JSON.parse(fs.readFileSync(path.join(root,'dist/assets',file+'.json'),'utf8'));
const data=read('publications'),researchSlides=read('research-slides'),content=read('site-content');
const isLeadPaper=id=>Boolean(content.correspondence[id]?.authors.some(a=>a.isPI)||['first','co-first'].includes(content.firstAuthorship?.[id]?.role));
for(const id of new Set([...data.filter(p=>p.selected).map(p=>p.id),...content.stories.map(s=>s.publicationId),208,149,179]))if(!isLeadPaper(id))throw new Error(`Lead-author verification required for featured paper ${id}`);
for(const [file,global,value] of [['publications','LAB_PUBLICATIONS',data],['research-slides','LAB_RESEARCH_SLIDES',researchSlides],['site-content','LAB_SITE_CONTENT',content]])fs.writeFileSync(path.join(root,'dist/assets',file+'.js'),`window.${global} = `+JSON.stringify(value).replaceAll('<','\\u003c')+';\n');
const app=fs.readFileSync(path.join(root,'dist/assets/app.js'),'utf8');
const {origin,pages,basePath=''}=content;
const siteBase=origin+basePath;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serial=data=>JSON.stringify(data).replaceAll('<','\\u003c');
const pagePath=(file,lang)=>`${basePath}/${lang==='en'?'en/':''}${file}`;
const organization={'@type':'Organization','@id':siteBase+'/#lab',name:'EASI Lab',alternateName:['Dong Hun Lee Lab','서울대학교 이동훈 연구실'],url:siteBase+'/index.html',parentOrganization:{'@type':'CollegeOrUniversity',name:'Seoul National University',url:'https://www.snu.ac.kr/'}};
const person={'@type':'Person','@id':siteBase+'/#dong-hun-lee',name:'Dong Hun Lee',alternateName:'이동훈',honorificSuffix:'MD, PhD, MBA',jobTitle:'Professor of Dermatology',url:siteBase+'/en/people.html',image:siteBase+'/assets/dong-hun-lee-2025.jpg',affiliation:[{'@type':'CollegeOrUniversity',name:'Seoul National University'},{'@type':'Organization',name:'Seoul National University Hospital'}],sameAs:['https://www.linkedin.com/in/dong-hun-lee-48194124/','https://snu.elsevierpure.com/en/persons/y-lee-73/']};
const siteSchema={'@context':'https://schema.org','@graph':[organization,person,{'@type':'WebSite','@id':siteBase+'/#website',name:'EASI Lab — Dong Hun Lee',url:siteBase+'/index.html',inLanguage:['ko','en'],publisher:{'@id':organization['@id']}}]};
fs.mkdirSync(path.join(root,'dist/en'),{recursive:true});
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
const sitemap=[];
for(const [key,m] of Object.entries(pages))for(const [i,lang] of ['ko','en'].entries()){
 const context={window:{LAB_PUBLICATIONS:data,LAB_RESEARCH_SLIDES:researchSlides,LAB_SITE_CONTENT:content,__BUILD:true},document:{body:{dataset:{page:key}},documentElement:{lang}},location:{search:'',hash:'',pathname:pagePath(m.file,lang)},URLSearchParams,URL};
 vm.createContext(context);vm.runInContext(app,context);
 const body=context.window.LAB.renderPage();
 const title=m.title[i]+(key==='home'?'':' | EASI Lab — Dong Hun Lee');
 const canonical=origin+pagePath(m.file,lang);const description=m.description[i];
 const pageSchema={'@context':'https://schema.org','@type':key==='pi'?'ProfilePage':'WebPage',url:canonical,inLanguage:lang,name:title,description,isPartOf:{'@id':siteBase+'/#website'},...(key==='pi'?{mainEntity:{'@id':person['@id']}}:{about:{'@id':organization['@id']}})};
 const story=content.stories.find(s=>s.key===key);
 if(story)pageSchema.citation={'@type':'ScholarlyArticle',name:data.find(p=>p.id===story.publicationId).title,url:story.doi};
 const head=`<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#f7f6f2"><link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml"><link rel="canonical" href="${canonical}">${['ko','en'].map(l=>`<link rel="alternate" hreflang="${l}" href="${origin+pagePath(m.file,l)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin+pagePath(m.file,'ko')}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:image" content="${siteBase}/assets/easi-science-hero.webp"><meta property="og:image:alt" content="EASI Lab conceptual scientific illustration"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="EASI Lab — Dong Hun Lee"><meta property="og:locale" content="${lang==='ko'?'ko_KR':'en_US'}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${siteBase}/assets/easi-science-hero.webp">${['site','refined','vivid','experiments','expansion','discovery','typography'].map(x=>`<link rel="stylesheet" href="${basePath}/assets/${x}.css">`).join('')}<script type="application/ld+json">${serial(siteSchema)}</script><script id="page-structured-data" type="application/ld+json">${serial(pageSchema)}</script>${['publications','research-slides','site-content','carousel','app'].map(x=>`<script src="${basePath}/assets/${x}.js" defer></script>`).join('')}</head>`;
 const html=head+`<body data-page="${key}"><div id="app">${body}</div><noscript><div class="nojs">${lang==='ko'?'검색·이메일 초안 기능을 사용하려면 JavaScript를 켜 주세요.':'Enable JavaScript for publication filters and email draft tools.'} <img class="contact-address-image" src="${basePath}/assets/contact-address.png" width="867" height="102" alt="${lang==='ko'?'연구실 이메일 주소':'Lab email address'}"></div></noscript></body></html>\n`;
 fs.writeFileSync(path.join(root,'dist',lang==='en'?'en':'',m.file),html);
 if(lang==='en')fs.writeFileSync(path.join(root,'qa',key+'-en.html'),html);
 sitemap.push(canonical);
}
// Retired story routes preserve incoming links without promoting the former AI feature.
for(const lang of ['ko','en']){
 const target=pagePath('methods.html',lang)+'#digital-imaging';
 const label=lang==='ko'?'피부영상·데이터 분석 공동연구 보기':'Explore skin-imaging and data-analysis collaborations';
 const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${origin+pagePath('methods.html',lang)}"><title>Methods &amp; Expertise | EASI Lab</title></head><body><main><p><a href="${target}">${label}</a></p></main></body></html>\n`;
 fs.writeFileSync(path.join(root,'dist',lang==='en'?'en':'','story-multimodal-imaging-ai.html'),html);
}
fs.writeFileSync(path.join(root,'dist/robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+siteBase+'/sitemap.xml\n');
fs.writeFileSync(path.join(root,'dist/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+sitemap.map(u=>'<url><loc>'+u+'</loc><lastmod>2026-10-11</lastmod></url>').join('')+'</urlset>\n');
console.log(`Rendered ${sitemap.length} static Korean / English pages; ${data.length} publication entries.`);
