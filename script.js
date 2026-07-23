// THEME
const themeButtons = document.querySelectorAll('[data-theme-toggle]');
const savedTheme = localStorage.getItem('gwfilms-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

function setTheme(theme){
  const dark = theme === 'dark';
  document.body.classList.toggle('theme-dark',dark);
  themeButtons.forEach(button=>{
    button.setAttribute('aria-pressed',String(dark));
    const label = button.querySelector('.theme-toggle-text');
    if(label)label.textContent = dark ? 'Tema claro' : 'Tema escuro';
  });
  localStorage.setItem('gwfilms-theme',theme);
}

setTheme(initialTheme);
themeButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
  });
});
// CURSOR (desktop)
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cur.style.left=mx+'px';cur.style.top=my+'px';
});
(function loop(){
  rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  ring.style.left=rx+'px';ring.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.work-card,.svc-row').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.classList.add('hov');ring.classList.add('hov');});
  el.addEventListener('mouseleave',()=>{cur.classList.remove('hov');ring.classList.remove('hov');});
});

// NAV scroll
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60);
});

// HAMBURGER MENU
function toggleMenu(){
  const menu=document.getElementById('mobileMenu');
  const burger=document.getElementById('hamburger');
  const open=menu.classList.toggle('open');
  burger.classList.toggle('open',open);
  document.body.style.overflow=open?'hidden':'';
}
function closeMMenu(){
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow='';
}

// REVEAL
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// STREET SECTION — scroll-driven atmosphere contained to this section
const streetSection=document.querySelector('[data-street-section]');
if(streetSection){
  let streetFrame=0;
  const updateStreetScene=()=>{
    streetFrame=0;
    const rect=streetSection.getBoundingClientRect();
    const travel=window.innerHeight+rect.height;
    const progress=Math.min(1,Math.max(0,(window.innerHeight-rect.top)/travel));
    streetSection.style.setProperty('--street-progress',progress.toFixed(4));
  };
  const requestStreetUpdate=()=>{
    if(streetFrame)return;
    streetFrame=requestAnimationFrame(updateStreetScene);
  };
  updateStreetScene();
  window.addEventListener('scroll',requestStreetUpdate,{passive:true});
  window.addEventListener('resize',requestStreetUpdate);
}

// VIDEO PERFORMANCE — load near the viewport, play only while visible
const isMobileVideo=window.matchMedia('(max-width:768px)').matches;
const prepareVideo=video=>{
  if(video.dataset.loaded==='true')return;
  const source=video.querySelector('source');
  if(!source)return;
  const src=isMobileVideo
    ? (source.dataset.srcMobile || source.dataset.src)
    : (source.dataset.srcDesktop || source.dataset.src);
  if(!src)return;
  source.src=src;
  video.dataset.loaded='true';
  video.load();
};

const videoPreloadObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    prepareVideo(entry.target);
    videoPreloadObserver.unobserve(entry.target);
  });
},{rootMargin:'500px 0px'});

const videoPlaybackObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting){
      prepareVideo(video);
      video.play().catch(()=>{});
    }else{
      video.pause();
    }
  });
},{threshold:.15});

document.querySelectorAll('[data-feature-video]').forEach(wrap=>{
  const video=wrap.querySelector('video');
  if(!video)return;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.addEventListener('loadeddata',()=>wrap.classList.remove('video-missing'),{once:true});
  video.addEventListener('playing',()=>wrap.classList.add('video-playing'));
  video.addEventListener('error',()=>wrap.classList.add('video-missing'));
  videoPreloadObserver.observe(video);
  videoPlaybackObserver.observe(video);
});

document.querySelectorAll('.work-teaser-video').forEach(video=>{
  const duration=Number(video.dataset.teaserDuration || 8);
  video.addEventListener('timeupdate',()=>{
    if(video.currentTime>=duration)video.currentTime=0;
  });
  video.addEventListener('ended',()=>{video.currentTime=0;});
  videoPreloadObserver.observe(video);
  videoPlaybackObserver.observe(video);
});

const videoModal=document.getElementById('videoModal');
const videoModalPlayer=document.getElementById('videoModalPlayer');
let videoTrigger=null;

function openVideoModal(src,trigger){
  if(!videoModal || !videoModalPlayer)return;
  videoTrigger=trigger;
  videoModalPlayer.src=src;
  videoModal.classList.add('open');
  videoModal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  videoModalPlayer.currentTime=0;
  videoModalPlayer.play().catch(()=>{});
  videoModal.querySelector('.video-modal-close')?.focus();
}

function closeVideoModal(){
  if(!videoModal || !videoModalPlayer || !videoModal.classList.contains('open'))return;
  videoModal.classList.remove('open');
  videoModal.setAttribute('aria-hidden','true');
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute('src');
  videoModalPlayer.load();
  document.body.style.overflow='';
  videoTrigger?.focus();
  videoTrigger=null;
}

document.querySelectorAll('[data-video-open]').forEach(card=>{
  card.addEventListener('click',()=>openVideoModal(card.dataset.videoOpen,card));
});
document.querySelectorAll('[data-video-close]').forEach(el=>{
  el.addEventListener('click',closeVideoModal);
});

// WORK PHOTO GALLERY
const photoModal=document.getElementById('photoModal');
const photoModalImage=document.getElementById('photoModalImage');
const photoModalCount=document.getElementById('photoModalCount');
const photoThumbs=[...document.querySelectorAll('[data-gallery-thumb]')];
let activePhoto=0;
let galleryTrigger=null;

function showGalleryPhoto(index){
  if(!photoModalImage || !photoThumbs.length)return;
  activePhoto=(index+photoThumbs.length)%photoThumbs.length;
  const thumb=photoThumbs[activePhoto];
  photoModalImage.src=thumb.dataset.src;
  photoModalImage.alt=thumb.dataset.alt;
  if(photoModalCount)photoModalCount.textContent=`${activePhoto+1} / ${photoThumbs.length}`;
  photoThumbs.forEach((item,itemIndex)=>{
    const active=itemIndex===activePhoto;
    item.classList.toggle('active',active);
    item.setAttribute('aria-current',active ? 'true' : 'false');
  });
}

function openPhotoGallery(trigger){
  if(!photoModal)return;
  galleryTrigger=trigger;
  showGalleryPhoto(0);
  photoModal.classList.add('open');
  photoModal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  photoModal.querySelector('.photo-modal-close')?.focus();
}

function closePhotoGallery(){
  if(!photoModal || !photoModal.classList.contains('open'))return;
  photoModal.classList.remove('open');
  photoModal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  galleryTrigger?.focus();
}

document.querySelectorAll('[data-gallery-open]').forEach(card=>{
  card.addEventListener('click',()=>openPhotoGallery(card));
});
document.querySelectorAll('[data-gallery-close]').forEach(el=>{
  el.addEventListener('click',closePhotoGallery);
});
document.querySelector('[data-gallery-prev]')?.addEventListener('click',()=>showGalleryPhoto(activePhoto-1));
document.querySelector('[data-gallery-next]')?.addEventListener('click',()=>showGalleryPhoto(activePhoto+1));
photoThumbs.forEach((thumb,index)=>thumb.addEventListener('click',()=>showGalleryPhoto(index)));

function keepFocusInside(modal,event){
  if(event.key!=='Tab')return;
  const focusable=[...modal.querySelectorAll(
    'a[href],button:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])'
  )].filter(element=>element.getClientRects().length);
  if(!focusable.length)return;
  const first=focusable[0];
  const last=focusable[focusable.length-1];
  if(event.shiftKey && document.activeElement===first){
    event.preventDefault();
    last.focus();
  }else if(!event.shiftKey && document.activeElement===last){
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown',e=>{
  const photoOpen=photoModal?.classList.contains('open');
  const videoOpen=videoModal?.classList.contains('open');
  const activeModal=photoOpen ? photoModal : (videoOpen ? videoModal : null);
  if(!activeModal)return;
  keepFocusInside(activeModal,e);
  if(e.key==='Escape'){
    photoOpen ? closePhotoGallery() : closeVideoModal();
  }
  if(photoOpen && e.key==='ArrowLeft')showGalleryPhoto(activePhoto-1);
  if(photoOpen && e.key==='ArrowRight')showGalleryPhoto(activePhoto+1);
});

// MAGNETIC (desktop only)
if(window.matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.28}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });
  // Hero parallax
  document.addEventListener('mousemove',e=>{
    const t=document.querySelector('.hero-title');
    if(t)t.style.transform=`translate(${(e.clientX/window.innerWidth-.5)*4}px,${(e.clientY/window.innerHeight-.5)*2}px)`;
  });
}
