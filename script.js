// ===== Theme handling =====
(function initTheme(){
  const stored = null; // no localStorage reliance beyond this session fallback
  const root = document.documentElement;
  let theme;
  try{
    theme = window.localStorage.getItem('mounesh-theme');
  }catch(e){ theme = null; }
  if(theme === 'light' || theme === 'dark'){
    root.setAttribute('data-theme', theme);
  }
})();

document.addEventListener('DOMContentLoaded', function(){

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function currentTheme(){
    const attr = root.getAttribute('data-theme');
    if(attr) return attr;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  themeToggle.addEventListener('click', function(){
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ window.localStorage.setItem('mounesh-theme', next); }catch(e){}
  });

  // ===== Mobile nav =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function(){
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== Nav scroll state + active section =====
  const nav = document.getElementById('nav');
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sections = Array.from(navAnchors).map(function(a){
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);

  function onScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 10);

    const scrollTopBtn = document.getElementById('scrollTop');
    scrollTopBtn.classList.toggle('visible', window.scrollY > 600);

    let currentIndex = -1;
    sections.forEach(function(sec, i){
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 120) currentIndex = i;
    });
    navAnchors.forEach(function(a, i){
      a.classList.toggle('active', i === currentIndex);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('scrollTop').addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== Scroll reveal =====
  const revealTargets = document.querySelectorAll(
    '.section-head, .about-copy, .stack-diagram, .dsa-note, .timeline-item, .project-card, .cert-list, .contact-grid, .activity-text'
  );
  revealTargets.forEach(function(el){ el.classList.add('reveal'); });

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function(el){ io.observe(el); });
  }else{
    revealTargets.forEach(function(el){ el.classList.add('in'); });
  }

  // ===== Animated counters =====
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el){
    const target = parseFloat(el.getAttribute('data-count'));
    const isFloat = el.getAttribute('data-count').indexOf('.') !== -1;
    const duration = 1100;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isFloat ? value.toFixed(2) : Math.round(value);
      if(progress < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(2) : target;
    }
    requestAnimationFrame(tick);
  }
  if(statNums.length){
    if('IntersectionObserver' in window){
      const statIo = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statNums.forEach(function(el){ statIo.observe(el); });
    }else{
      statNums.forEach(animateCount);
    }
  }

  // ===== Terminal boot sequence (hero) =====
  const termBody = document.getElementById('terminalBody');
  const lines = [
    { prompt: '$ ', text: 'whoami', type: 'cmd' },
    { text: 'Mounesh — Backend & Applied ML Engineer', type: 'out' },
    { prompt: '$ ', text: 'status --internship', type: 'cmd' },
    { text: 'open for Dec 2026, Mysuru / remote', type: 'accent' }
  ];

  function typeLine(lineObj, container, onDone){
    const lineEl = document.createElement('div');
    container.appendChild(lineEl);
    let i = 0;
    const full = (lineObj.prompt || '') + lineObj.text;
    const speed = lineObj.type === 'cmd' ? 32 : 14;

    function step(){
      i++;
      const slice = full.slice(0, i);
      if(lineObj.prompt && slice.length <= lineObj.prompt.length){
        lineEl.innerHTML = '<span class="prompt">' + slice + '</span>';
      }else if(lineObj.prompt){
        lineEl.innerHTML = '<span class="prompt">' + lineObj.prompt + '</span>' +
          '<span class="' + (lineObj.type === 'cmd' ? '' : lineObj.type) + '">' +
          slice.slice(lineObj.prompt.length) + '</span>';
      }else{
        lineEl.innerHTML = '<span class="' + lineObj.type + '">' + slice + '</span>';
      }
      if(i < full.length){
        setTimeout(step, speed);
      }else{
        onDone();
      }
    }
    step();
  }

  function runSequence(idx){
    if(!termBody) return;
    if(idx >= lines.length){
      const cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      termBody.appendChild(cursor);
      return;
    }
    typeLine(lines[idx], termBody, function(){
      setTimeout(function(){ runSequence(idx + 1); }, idx % 2 === 1 ? 260 : 80);
    });
  }

  // ===== Loader → kick off hero terminal =====
  const loader = document.getElementById('loader');
  let loadFinished = false;
  function finishLoad(){
    if(loadFinished) return;
    loadFinished = true;
    loader.classList.add('hidden');
    setTimeout(function(){ runSequence(0); }, 150);
  }
  if(document.readyState === 'complete'){
    setTimeout(finishLoad, 500);
  }else{
    window.addEventListener('load', function(){ setTimeout(finishLoad, 500); });
  }
  // Fallback in case 'load' is delayed unusually long
  setTimeout(finishLoad, 2200);

});
