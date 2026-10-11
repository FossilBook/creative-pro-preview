'use strict';
const isSpanish=document.documentElement.lang==='es';
const t=text=>isSpanish?(window.CPR_TRANSLATIONS[text]||text):text;
const format=(text,values)=>Object.entries(values).reduce((result,[key,value])=>result.replaceAll('{'+key+'}',String(value)),t(text));
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const menu = $('.menu-toggle'), nav = $('#main-nav');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
$$('a, button', nav).forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));

let expandedGallery = false;
function filterGallery(category) {
  const cards = $$('.project'); let shown = 0;
  $('#project-grid').classList.toggle('is-filtered',category !== 'all');
  cards.forEach((card, i) => { const visible = category === 'all' ? (expandedGallery || i < 3) : card.dataset.category === category; card.hidden = !visible;card.classList.remove('filter-enter');if(visible){void card.offsetWidth;card.classList.add('filter-enter');shown++;} });
  $$('[data-filter]').forEach(button => { const active = button.dataset.filter === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
  $('#gallery-count').textContent = category === 'all' ? format('Showing {count} of 6 portfolio highlights',{count:shown}) : format(shown===1?'1 highlight in this category':'{count} highlights in this category',{count:shown});
  $('#show-all').hidden = category !== 'all';
  $('#show-all').innerHTML = `${t(expandedGallery?'Show selected highlights':'View all highlights')} <span aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${expandedGallery?'M12 19V5m-6 6 6-6 6 6':'M5 12h14m-6-6 6 6-6 6'}"></path></svg></span>`;
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => filterGallery(button.dataset.filter)));
$('#show-all').addEventListener('click', () => { expandedGallery = !expandedGallery; filterGallery('all'); });

const projects = {
 kitchen:{title:'A fresh take on everyday',category:'KITCHENS',image:'kitchen-05.webp',alt:'Two-tone kitchen cabinets with white surfaces and a stainless-steel range',description:'A restrained palette lets practical details stand out: contrasting cabinets, a clean countertop, and an integrated cooking area.',points:['Contrasting upper and lower cabinetry','Light countertop and backsplash','Stainless-steel cooking area'],service:'Kitchen remodeling'},
 bathroom:{title:'A moment of calm',category:'BATHROOMS',image:'bathroom-photo-01.webp',alt:'Tiled walk-in shower with glass enclosure and pebble shower floor',description:'A study in texture and detail, with large-format wall tile, a recessed niche, and a glass enclosure that keeps the space feeling open.',points:['Large-format wall tile','Recessed shower niche','Pebble-style floor and glass enclosure'],service:'Bathroom remodeling'},
 interior:{title:'More room to live',category:'INTERIORS',image:'interiors-01.webp',alt:'Lower-level interior with wood-look flooring and recessed lighting',description:'Warm flooring and simple lighting give this lower-level interior a welcoming foundation for everyday living.',points:['Wood-look flooring','Recessed ceiling lighting','A flexible open interior'],service:'Interiors & basements'},
 classic:{title:'The heart of the home',category:'KITCHENS',image:'kitchen-02.webp',alt:'Traditional kitchen with white cabinetry, island and geometric pendant lights',description:'A kitchen portfolio detail featuring generous work surfaces and a central island, with pendant lighting bringing focus to the gathering space.',points:['Central kitchen island','Light cabinetry and dark counters','Geometric pendant lights'],service:'Kitchen remodeling'},
 exterior:{title:'Beyond the back door',category:'EXTERIOR · WORK IN PROGRESS',image:'exterior-01.webp',alt:'Timber construction in an outdoor setting',description:'An in-progress view from the company’s exterior portfolio. Discuss how an addition or outdoor structure could fit the way you use your home.',points:['Exterior portfolio image','Timber construction in progress','Specific scope to be confirmed with the team'],service:'Additions & outdoor living'},
 design:{title:'Imagine it before you build',category:'3D DESIGN CONCEPT',image:'bathroom-design-04.webp',alt:'3D rendering of a double vanity and tiled bathroom with glass shower',description:'This is a design visualization, not a photograph of a completed remodel. Renderings help explore the relationship between layout, surfaces, lighting, and fixtures.',points:['Double-vanity layout','Tile and material visualization','Lighting and fixture concepts'],service:'3D design & rendering'}
};
let activeProject; const dialogOpeners=new WeakMap();
function openDialog(dialog) { clearTimeout(slideTimer); dialogOpeners.set(dialog,document.activeElement); dialog.showModal(); document.body.classList.add('modal-open'); }
$$('dialog').forEach(dialog => {
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if(event.target === dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} });
  dialog.addEventListener('close', () => { if(!$('dialog[open]')){document.body.classList.remove('modal-open');const opener=dialogOpeners.get(dialog);if(opener?.isConnected)opener.focus();} });
});
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  activeProject=projects[button.dataset.project];
  $('#project-title').textContent=t(activeProject.title); $('#project-detail-category').textContent=t(activeProject.category);
  $('#project-detail-image').src=$('img',button).src; $('#project-detail-image').alt=t(activeProject.alt);
  $('#project-detail-description').textContent=t(activeProject.description);
  $('#project-detail-points').replaceChildren(...activeProject.points.map(text=>{const item=document.createElement('li');item.textContent=t(text);return item;}));
  openDialog($('#project-dialog'));
}));

const planner=$('#planner'), form=$('#planner-form');
let currentStep=1;
function setStep(step){
  currentStep=step; $$('[data-step]').forEach(part=>part.hidden=Number(part.dataset.step)!==step);
  $$('.progress span').forEach((el,i)=>{const active=i===step-1;el.classList.toggle('current',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $$('input,select,textarea', $('[data-step="2"]')).forEach(input=>input.disabled=step!==2);
  planner.scrollTop=0;
  if(step===2){$('.selected-service').textContent=t($('input[name="service"]:checked')?.value||'');setTimeout(()=>form.elements.name.focus(),50);}
  if(step===3)setTimeout(()=>$('.draft-ready h3').focus({preventScroll:true}),50);
}
function openPlanner(service){
  if(service){const choice=$$('input[name="service"]').find(input=>input.value===service);if(choice)choice.checked=true;}
  $('#service-error').textContent=''; setStep(1); openDialog(planner);
}
$$('[data-plan]').forEach(button=>button.addEventListener('click',()=>openPlanner()));
$$('[data-service]').forEach(button=>button.addEventListener('click',()=>openPlanner(button.dataset.service)));
$('#project-plan').addEventListener('click',()=>{const service=activeProject.service;$('#project-dialog').close();openPlanner(service);});
$('#planner-next').addEventListener('click',()=>{if(!$('input[name="service"]:checked')){$('#service-error').textContent=t('Choose a space to continue.');return;}$('#service-error').textContent='';setStep(2);});
$('#planner-back').addEventListener('click',()=>setStep(1));
$('#edit-draft').addEventListener('click',()=>setStep(2));
function updateEmailLink(){const text=$('#inquiry-draft').value;$('#email-draft').href=`mailto:creativeproremodel@gmail.com?subject=${encodeURIComponent(t('Remodeling project inquiry'))}&body=${encodeURIComponent(text)}`;}
let draftEdited=false;
function validateDetails(){
  const fields=form.elements;
  ['name','city','email','phone'].forEach(key=>{fields[key].setCustomValidity('');fields[key].value=fields[key].value.trim();});
  if(!fields.name.value)fields.name.setCustomValidity(t('Enter your name.'));
  if(!fields.city.value)fields.city.setCustomValidity(t('Enter your city or town.'));
  if(!fields.email.value||fields.email.validity.typeMismatch)fields.email.setCustomValidity(t('Enter a valid email address.'));
  if(fields.preference.value==='Phone'&&!fields.phone.value)fields.phone.setCustomValidity(t('Add a phone number or choose email as your preferred contact.'));
  return form.reportValidity();
}
['name','city','email','phone'].forEach(key=>form.elements[key].addEventListener('input',()=>form.elements[key].setCustomValidity('')));
form.elements.preference.addEventListener('change',()=>form.elements.phone.setCustomValidity(''));
function generateDraft(){
  const fields=form.elements;
  const read=name=>fields[name].value.trim();
  const service=t($('input[name="service"]:checked')?.value||'Multiple rooms / still exploring');
  const lang=read('communicationLanguage')==='either'?t('Either language'):read('communicationLanguage')==='es'?'Español':'English';
  const lines=isSpanish?[
    'Hola, equipo de Creative Pro Remodeling:','',`Me gustaría conversar sobre un proyecto de ${service.toLocaleLowerCase('es')} en ${read('city')}.`,'',
    `Nombre: ${read('name')}`,`Correo electrónico: ${read('email')}`,`Teléfono: ${read('phone')||'No proporcionado'}`,`Medio de contacto preferido: ${t(read('preference'))}`,`Idioma preferido: ${lang}`,`Plazo deseado: ${t(read('timeline'))}`,'','Ideas para el proyecto:',read('details')||'Me gustaría explorar opciones para mi hogar.','','Por favor, indíquenme cómo programar una consulta.','¡Gracias!'
  ]:[
    'Hello Creative Pro Remodeling,','',`I’d like to discuss ${service.toLowerCase()} in ${read('city')}.`,'',
    `Name: ${read('name')}`,`Email: ${read('email')}`,`Phone: ${read('phone')||'Not provided'}`,`Preferred contact: ${t(read('preference'))}`,`Preferred language: ${lang}`,`Timeframe: ${t(read('timeline'))}`,'','Project ideas:',read('details')||'I’d like to explore options for my home.','','Please let me know the next step for a consultation.','Thank you!'
  ];
  $('#inquiry-draft').value=lines.join('\n');draftEdited=false;$('#copy-status').textContent='';updateEmailLink();
}
form.addEventListener('submit',event=>{event.preventDefault();if(currentStep!==2||!validateDetails())return;generateDraft();setStep(3);});
$('#inquiry-draft').addEventListener('input',()=>{draftEdited=true;updateEmailLink();});
$('#copy-draft').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#inquiry-draft').value);$('#copy-status').textContent=t('Draft copied. You can paste it into your email app.');}catch{$('#inquiry-draft').focus();$('#inquiry-draft').select();$('#copy-status').textContent=t('Select and copy the draft above using your device’s copy command.');}});
form.elements.communicationLanguage.value=isSpanish?'es':'en';
setStep(1);
window.CPR_APP={
 captureState(){if(!planner.open)return null;return {locale:document.documentElement.lang,step:currentStep,fields:Object.fromEntries(['name','city','email','phone','timeline','preference','communicationLanguage','details'].map(key=>[key,form.elements[key].value])),service:$('input[name="service"]:checked')?.value,draft:$('#inquiry-draft').value,draftEdited};},
 restoreState(data){if(!data||typeof data!=='object')return;for(const [key,value] of Object.entries(data.fields||{})){if(['name','city','email','phone','timeline','preference','communicationLanguage','details'].includes(key)&&typeof value==='string')form.elements[key].value=value.slice(0,key==='details'?3000:150);}openPlanner(data.service);const step=[1,2,3].includes(data.step)?data.step:1;setStep(step);if(step===3){if(data.draftEdited){$('#inquiry-draft').value=String(data.draft||'').slice(0,6000);draftEdited=true;updateEmailLink();}else generateDraft();}}
};

const heroSlides = $$('.hero-slide');
let heroIndex=0,requestedIndex=0,slideTimer,slideRequest=0,slideshowPaused=false,heroVisible=true,heroFocused=false,heroHovered=false;
let slideTransition=Promise.resolve();
const sceneNames=['STONE & TIMBER','MODERN ARCHITECTURE','EVENING EXTERIOR','ARCHITECTURAL ESTATE'];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const hero=$('.hero'),heroControls=$('.hero-controls'),pauseSlides=$('#pause-slides');
function canAutoPlay(){return !slideshowPaused&&!reduceMotion.matches&&!document.hidden&&heroVisible&&!heroFocused&&!heroHovered&&!$('dialog[open]');}
function scheduleSlide(){
 clearTimeout(slideTimer);
 if(canAutoPlay())slideTimer=setTimeout(()=>showHeroSlide((heroIndex+1)%heroSlides.length,true),6000);
}
async function showHeroSlide(index,automatic=false){
 clearTimeout(slideTimer);
 const request=++slideRequest,picture=heroSlides[index],image=picture.querySelector('img');
 requestedIndex=index;
 picture.querySelectorAll('[data-srcset]').forEach(source=>{source.srcset=source.dataset.srcset;source.removeAttribute('data-srcset');});
 if(image.dataset.src){image.src=image.dataset.src;image.removeAttribute('data-src');}
 try{await image.decode();}catch{if(request===slideRequest){requestedIndex=heroIndex;scheduleSlide();}return;}
 // Complete the current fade before honoring the most recent tap.
 await slideTransition;
 if(request!==slideRequest)return;
 if(automatic&&!canAutoPlay()){requestedIndex=heroIndex;return;}
 if(index===heroIndex){scheduleSlide();return;}
 const outgoing=heroSlides[heroIndex];
 outgoing.classList.replace('active','previous');
 picture.classList.add('active');
 heroIndex=index;
 // The outgoing image stays fully opaque underneath, preventing a dark flash.
 slideTransition=new Promise(resolve=>{
  let fallback;
  const finish=()=>{clearTimeout(fallback);picture.removeEventListener('transitionend',onEnd);outgoing.classList.remove('previous');resolve();};
  const onEnd=event=>{if(event.target===picture&&event.propertyName==='opacity')finish();};
  if(reduceMotion.matches){finish();return;}
  picture.addEventListener('transitionend',onEnd);
  fallback=setTimeout(finish,1150);
 });
 $$('[data-slide]').forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
 $('#slide-counter').textContent=String(index+1).padStart(2,'0');$('#hero-scene').textContent=t(sceneNames[index]);scheduleSlide();
}
$$('[data-slide]').forEach(button=>button.addEventListener('click',()=>showHeroSlide(Number(button.dataset.slide))));
$('#next-slide').addEventListener('click',()=>showHeroSlide((requestedIndex+1)%heroSlides.length));
$('#previous-slide').addEventListener('click',()=>showHeroSlide((requestedIndex+heroSlides.length-1)%heroSlides.length));
function updatePause(){pauseSlides.setAttribute('aria-label',t(slideshowPaused?'Play slideshow':'Pause slideshow'));pauseSlides.setAttribute('aria-pressed',String(slideshowPaused));pauseSlides.innerHTML=slideshowPaused?'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg>':'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';scheduleSlide();}
pauseSlides.addEventListener('click',()=>{slideshowPaused=!slideshowPaused;if(!slideshowPaused){heroFocused=false;heroHovered=false;}updatePause();});
hero.addEventListener('focusin',()=>{heroFocused=true;scheduleSlide();});hero.addEventListener('focusout',event=>{heroFocused=hero.contains(event.relatedTarget);scheduleSlide();});
heroControls.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){heroHovered=true;scheduleSlide();}});heroControls.addEventListener('pointerleave',()=>{heroHovered=false;scheduleSlide();});
document.addEventListener('visibilitychange',scheduleSlide);
reduceMotion.addEventListener('change',()=>{slideshowPaused=reduceMotion.matches;updatePause();});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;scheduleSlide();},{threshold:.1}).observe(hero);
let swipeStart;
hero.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'&&!event.target.closest('a,button'))swipeStart={x:event.clientX,y:event.clientY};},{passive:true});
hero.addEventListener('pointerup',event=>{if(!swipeStart)return;const dx=event.clientX-swipeStart.x,dy=event.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)showHeroSlide((requestedIndex+(dx<0?1:heroSlides.length-1))%heroSlides.length);},{passive:true});
hero.addEventListener('pointercancel',()=>swipeStart=null,{passive:true});
$$('dialog').forEach(dialog=>dialog.addEventListener('close',scheduleSlide));
slideshowPaused=reduceMotion.matches;updatePause();

// Escape closes the mobile menu and restores its trigger.
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
const services={
 'Kitchen remodeling':{title:'Kitchens',description:'Create a kitchen that works for daily life, gathering, and cooking.',points:['Quartz and granite countertops','Custom cabinetry and pantry storage','Tile backsplashes, islands, sinks, and lighting']},
 'Bathroom remodeling':{title:'Bathrooms',description:'Plan a more comfortable bathroom with careful attention to finishes and function.',points:['Walk-in showers, glass enclosures, and waterproofing','Vanities, mirrors, soaking tubs, and fixtures','Large-format tile and detailed finishes']},
 'Interiors & basements':{title:'Interiors & basements',description:'Make more of the space you already have.',points:['Basement entertainment rooms and guest spaces','Hardwood, waterproof flooring, and tile','Custom trim, built-ins, fireplace surrounds, and lighting']},
 'Additions & outdoor living':{title:'Additions & outdoor living',description:'Explore new possibilities inside and outside your home.',points:['Room additions and sunrooms','Pergolas, covered porches, and outdoor kitchens','Facade work, stone veneer, and siding']},
 '3D design & rendering':{title:'3D design & rendering',description:'Explore your ideas visually before committing to construction.',points:['Interior design visualizations','Layout, material, and finish comparisons','Dimensioned plans and lighting concepts']}
};
let selectedService;
$$('[data-service-detail]').forEach(button=>button.addEventListener('click',()=>{
 selectedService=button.dataset.serviceDetail;const service=services[selectedService];
 const category={'Kitchen remodeling':'kitchens','Bathroom remodeling':'bathrooms','Interiors & basements':'interiors','Additions & outdoor living':'exterior','3D design & rendering':'rendering'}[selectedService];$('#service-gallery').href=(isSpanish?'./es-portfolio.html':'./portfolio.html')+'?cat='+category;
 $('#service-title').textContent=t(service.title);$('#service-description').textContent=t(service.description);
 $('#service-points').replaceChildren(...service.points.map(point=>{const li=document.createElement('li');li.textContent=t(point);return li;}));openDialog($('#service-dialog'));
}));
$('#service-plan').addEventListener('click',()=>{$('#service-dialog').close();openPlanner(selectedService);});
if('IntersectionObserver' in window){let heroVisible=true,contactVisible=false;const bar=$('.mobile-contact');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target.matches('.hero'))heroVisible=entry.isIntersecting;else contactVisible=entry.isIntersecting;}bar.hidden=heroVisible||contactVisible;},{threshold:0});observer.observe($('.hero'));observer.observe($('#contact'));}
