'use strict';
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!('IntersectionObserver' in window))return;
  const targets=[...document.querySelectorAll('.section-heading,.statement>div,.design-copy,.about-copy,.steps article,.faq>div,.service-area>div')];
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-ready');observer.unobserve(entry.target);}}
  },{rootMargin:'0px 0px 30px 0px',threshold:.04});
  if(!reduced.matches)for(const target of targets){if(target.getBoundingClientRect().top>innerHeight){target.classList.add('reveal-pending');observer.observe(target);}}
  function revealAll(){observer.disconnect();targets.forEach(el=>el.classList.remove('reveal-pending'));}
  reduced.addEventListener('change',revealAll);
  document.addEventListener('focusin',event=>{const target=event.target.closest('.reveal-pending');if(target){target.classList.remove('reveal-pending');observer.unobserve(target);}});
})();
