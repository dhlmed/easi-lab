import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class Element {
  constructor(dataset={}) { this.dataset=dataset; this.listeners=new Map(); this.attrs={}; this.classes=new Set(); this.classList={toggle:(name,value)=>value?this.classes.add(name):this.classes.delete(name)}; }
  addEventListener(name,fn) { if(!this.listeners.has(name))this.listeners.set(name,new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name,fn) { this.listeners.get(name)?.delete(fn); }
  emit(name,extra={}) { for(const fn of this.listeners.get(name)||[])fn({target:this,...extra}); }
  setAttribute(name,value) { this.attrs[name]=value; }
  matches() { return false; }
}
function setup({reduce=false,preferences={}}={}) {
  const document=new Element(); document.hidden=false;
  const reduced=new Element(); reduced.matches=reduce;
  const root=new Element(); const stage=new Element(), count=new Element(), icon=new Element(), label=new Element();
  const toggle=new Element({playLabel:'Start rotation',pauseLabel:'Pause rotation',playText:'Play',pauseText:'Pause'});
  const slides=Array.from({length:7},()=>new Element());
  const dots=slides.map((_,i)=>new Element({slideTo:String(i)}));
  const arrows=[new Element({slideStep:'-1'}),new Element({slideStep:'1'})];
  toggle.querySelector=s=>s==='[data-play-label]'?label:icon;
  root.querySelector=s=>({'[data-autoplay]':toggle,'[data-slide-count]':count,'[data-slide-stage]':stage})[s];
  root.querySelectorAll=s=>({'[data-slide]':slides,'[data-slide-to]':dots,'[data-slide-step]':arrows})[s];
  let serial=0,disconnected=false,observe;
  const timers=new Map();
  const window={matchMedia:()=>reduced,setTimeout:(fn,delay)=>{assert.equal(delay,7000);timers.set(++serial,fn);return serial},clearTimeout:id=>timers.delete(id),IntersectionObserver:class{constructor(fn){observe=fn}observe(){}disconnect(){disconnected=true}}};
  const context={window,document}; vm.createContext(context);vm.runInContext(fs.readFileSync('dist/assets/carousel.js','utf8'),context);
  const cleanup=window.EASI_CAROUSEL.mount(root,preferences);
  function tick(){assert.equal(timers.size,1);const [id,fn]=[...timers][0];timers.delete(id);fn();}
  return {root,document,reduced,stage,count,toggle,slides,dots,arrows,timers,cleanup,tick,preferences,visibility:value=>observe([{isIntersecting:value}]),disconnected:()=>disconnected};
}
const c=setup();
assert.equal(c.count.textContent,'01 / 07');c.tick();assert.equal(c.count.textContent,'02 / 07');
assert.equal(c.slides.filter(s=>s.classes.has('is-active')).length,1);
assert(c.slides[0].inert);assert(!c.slides[1].inert);
c.root.emit('mouseenter');assert.equal(c.timers.size,0);c.root.emit('mouseleave');assert.equal(c.timers.size,1);
c.document.hidden=true;c.document.emit('visibilitychange');assert.equal(c.timers.size,0);
c.document.hidden=false;c.document.emit('visibilitychange');assert.equal(c.timers.size,1);
c.visibility(false);assert.equal(c.timers.size,0);c.visibility(true);assert.equal(c.timers.size,1);
c.toggle.emit('click');assert.equal(c.timers.size,0);assert.equal(c.stage.attrs['aria-live'],'polite');
c.toggle.emit('click');c.dots[6].emit('click');assert.equal(c.count.textContent,'07 / 07');assert.equal(c.timers.size,0);
c.arrows[1].emit('click');assert.equal(c.count.textContent,'01 / 07');
c.arrows[0].emit('click');assert.equal(c.count.textContent,'07 / 07');
c.toggle.emit('click');c.root.emit('focusin',{target:{matches:()=>true}});assert.equal(c.timers.size,0);
c.toggle.emit('click');c.reduced.matches=true;c.reduced.emit('change');assert.equal(c.timers.size,0);
c.cleanup();assert.equal(c.timers.size,0);assert(c.disconnected());assert.equal(c.document.listeners.get('visibilitychange').size,0);
const reduce=setup({reduce:true});assert.equal(reduce.timers.size,0);reduce.toggle.emit('click');assert.equal(reduce.timers.size,1);reduce.cleanup();
const languageRerender=setup({preferences:c.preferences});assert.equal(languageRerender.timers.size,0);languageRerender.cleanup();
console.log('PASS: 7-second rotation, accessible active slide, manual navigation, pause/resume, hover, keyboard focus, hidden/offscreen page, reduced motion and language-rerender cleanup.');
