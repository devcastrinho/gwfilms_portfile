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

// FEATURED VIDEO FALLBACK
document.querySelectorAll('[data-feature-video]').forEach(wrap=>{
  const video=wrap.querySelector('video');
  const fallback=wrap.querySelector('.video-fallback');
  const showGif=()=>wrap.classList.add('video-gif');
  const showPoster=()=>wrap.classList.add('video-missing');

  if(fallback){
    if(fallback.complete && fallback.naturalWidth>0)showGif();
    if(fallback.complete && fallback.naturalWidth===0)showPoster();
    fallback.addEventListener('load',showGif,{once:true});
    fallback.addEventListener('error',showPoster,{once:true});
  }

  if(video){
    const playVideo=()=>{
      video.muted=true;
      video.defaultMuted=true;
      video.volume=0;
      video.playsInline=true;
      video.play().catch(()=>{});
    };
    const ready=()=>{
      wrap.classList.remove('video-gif','video-missing');
      playVideo();
    };
    video.addEventListener('loadeddata',ready,{once:true});
    video.addEventListener('canplay',playVideo);
    video.addEventListener('playing',()=>wrap.classList.add('video-playing'));
    video.addEventListener('error',()=>setTimeout(()=>{
      if(!wrap.classList.contains('video-gif'))showPoster();
    },250));
    wrap.addEventListener('click',playVideo);
    playVideo();
    const keepPreviewRunning=setInterval(()=>{
      if(!document.body.contains(video)){
        clearInterval(keepPreviewRunning);
        return;
      }
      if(video.readyState>=2 && video.paused)playVideo();
    },1600);
    setTimeout(()=>{
      if(video.readyState<2 && !wrap.classList.contains('video-gif'))showPoster();
    },1500);
  }
});

// WORK VIDEO TEASERS
document.querySelectorAll('.work-teaser-video').forEach(video=>{
  const duration=Number(video.dataset.teaserDuration || 8);
  const playTeaser=()=>{
    video.muted=true;
    video.playsInline=true;
    video.play().catch(()=>{});
  };

  video.addEventListener('loadedmetadata',()=>{
    video.currentTime=0;
    playTeaser();
  });
  video.addEventListener('timeupdate',()=>{
    if(video.currentTime>=duration)video.currentTime=0;
  });
  video.addEventListener('ended',()=>{video.currentTime=0;playTeaser();});
  playTeaser();
});

const videoModal=document.getElementById('videoModal');
const videoModalPlayer=document.getElementById('videoModalPlayer');

function openVideoModal(src){
  if(!videoModal || !videoModalPlayer)return;
  videoModalPlayer.src=src;
  videoModal.classList.add('open');
  videoModal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  videoModalPlayer.currentTime=0;
  videoModalPlayer.play().catch(()=>{});
}

function closeVideoModal(){
  if(!videoModal || !videoModalPlayer)return;
  videoModal.classList.remove('open');
  videoModal.setAttribute('aria-hidden','true');
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute('src');
  videoModalPlayer.load();
  document.body.style.overflow='';
}

document.querySelectorAll('[data-video-open]').forEach(card=>{
  card.addEventListener('click',()=>openVideoModal(card.dataset.videoOpen));
});
document.querySelectorAll('[data-video-close]').forEach(el=>{
  el.addEventListener('click',closeVideoModal);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeVideoModal();
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

