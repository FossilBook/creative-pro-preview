'use strict';
(() => {
 const locale=document.documentElement.lang==='es'?'es':'en';
 const url=new URL(location.href);const explicit=url.searchParams.get('lang');
 try{
  if(explicit==='en'||explicit==='es')localStorage.setItem('cpr-language',explicit);
  else if(locale==='en'&&localStorage.getItem('cpr-language')==='es'){
   const page=url.pathname.split('/').pop()||'index.html';
   const spanish={'index.html':'es-index.html','portfolio.html':'es-portfolio.html','pitch.html':'es-pitch.html'}[page];
   if(spanish){const target=new URL(spanish,url);target.search=url.search;target.hash=url.hash;location.replace(target.href);return;}
  }
 }catch{/* Preference storage is optional. */}
 document.querySelectorAll('[data-language]').forEach(link=>link.addEventListener('click',()=>{
  try{
   localStorage.setItem('cpr-language',link.dataset.language);
   const state=window.CPR_APP?.captureState();
   if(state)sessionStorage.setItem('cpr-inquiry-switch',JSON.stringify(state));
  }catch{/* Links still work when browser storage is unavailable. */}
  if(location.hash&&!link.href.includes('#'))link.hash=location.hash;
  const category=new URL(location.href).searchParams.get('cat');if(category){const target=new URL(link.href);target.searchParams.set('cat',category);link.href=target.href;}
 }));
 try{
  const saved=sessionStorage.getItem('cpr-inquiry-switch');
  if(saved&&window.CPR_APP){sessionStorage.removeItem('cpr-inquiry-switch');window.CPR_APP.restoreState(JSON.parse(saved));}
 }catch{/* Ignore unavailable storage or invalid previous tab state. */}
})();
