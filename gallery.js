'use strict';
const isSpanish=document.documentElement.lang==='es';
const t=text=>isSpanish?(window.CPR_TRANSLATIONS[text]||text):text;
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus();}});
const cards=[...document.querySelectorAll('.media-card')],filters=[...document.querySelectorAll('[data-collection-filter]')];
function filterCollection(category,updateURL=false){
 if(!filters.some(button=>button.dataset.collectionFilter===category))category='all';
 let count=0;cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;card.classList.remove('filter-enter');if(!card.hidden){count++;if(updateURL){void card.offsetWidth;card.classList.add('filter-enter');}}});
 filters.forEach(button=>{const active=button.dataset.collectionFilter===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 document.querySelector('#collection-count').textContent=isSpanish?`${count} elementos en esta selección`:`${count} items in this selection`;
 if(updateURL){const url=new URL(location.href);if(category==='all')url.searchParams.delete('cat');else url.searchParams.set('cat',category);history.pushState(null,'',url);}
 document.querySelectorAll('[data-language]').forEach(link=>{const url=new URL(link.href);if(category==='all')url.searchParams.delete('cat');else url.searchParams.set('cat',category);link.href=url.href;});
}
filters.forEach(button=>button.addEventListener('click',()=>filterCollection(button.dataset.collectionFilter,true)));
window.addEventListener('popstate',()=>filterCollection(new URL(location.href).searchParams.get('cat')||'all'));
filterCollection(new URL(location.href).searchParams.get('cat')||'all');
const dialog=document.querySelector('#media-dialog'),video=document.querySelector('#portfolio-video'),photo=document.querySelector('#portfolio-photo'),status=document.querySelector('#media-status');let opener,currentCard;
function showMedia(card){
 const media=window.CPR_GALLERY[Number(card.dataset.mediaIndex)];currentCard=card;video.pause();video.removeAttribute('src');video.load();photo.removeAttribute('src');
 document.querySelector('#media-title').textContent=card.querySelector('.media-title').textContent;document.querySelector('#media-original').href=media.media;
 video.hidden=media.type!=='video';photo.hidden=media.type==='video';status.textContent='';
 if(media.type==='video'){video.poster=card.querySelector('img').src;video.src=media.displayMedia;video.load();status.textContent=t('Press play to watch this walkthrough.');}
 else{photo.src=media.displayMedia;photo.alt=card.querySelector('img').alt;}
 const visible=cards.filter(item=>!item.hidden);document.querySelector('#media-position').textContent=t('{current} of {total}').replace('{current}',visible.indexOf(card)+1).replace('{total}',visible.length);
}
cards.forEach(card=>card.addEventListener('click',()=>{opener=card;showMedia(card);dialog.showModal();document.body.classList.add('modal-open');}));
function moveMedia(direction){const visible=cards.filter(card=>!card.hidden);const index=visible.indexOf(currentCard);showMedia(visible[(index+direction+visible.length)%visible.length]);}
document.querySelector('#media-previous').addEventListener('click',()=>moveMedia(-1));document.querySelector('#media-next').addEventListener('click',()=>moveMedia(1));
dialog.addEventListener('keydown',event=>{if(event.target===video)return;if(event.key==='ArrowRight'){event.preventDefault();moveMedia(1);}if(event.key==='ArrowLeft'){event.preventDefault();moveMedia(-1);}});
video.addEventListener('loadeddata',()=>{if(dialog.open&&!video.hidden)status.textContent=t('Use the player controls to watch this walkthrough.');});
video.addEventListener('error',()=>{if(video.getAttribute('src'))status.textContent=t('This video could not be loaded here. You can open the original media below.');});
document.querySelector('#media-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();photo.removeAttribute('src');document.body.classList.remove('modal-open');opener?.focus();});
