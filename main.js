(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var small = window.matchMedia('(max-width: 760px)');
  var nav = document.getElementById('nav');
  var video = document.getElementById('heroVideo');
  var layers = [].slice.call(document.querySelectorAll('[data-depth]'));
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  var current = 0, target = 0, raf = 0;

  // Reveal on scroll
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Hero video: respect reduced motion / data saver, pause when off-screen
  function setupVideo() {
    if (!video) return;
    var saver = navigator.connection && navigator.connection.saveData;
    if (reduce.matches || saver) {
      video.removeAttribute('autoplay');
      video.pause();
      return;
    }
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  setupVideo();
  if (reduce.addEventListener) reduce.addEventListener('change', setupVideo);
  if ('IntersectionObserver' in window && video) {
    new IntersectionObserver(function (en) {
      if (reduce.matches) return;
      if (en[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }).observe(video);
  }

  // Transform-only parallax, eased with lerp. Depth > 0 trails the scroll, < 0 leads it.
  function frame() {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.1) current = target;
    var k = small.matches ? 0.55 : 1;
    layers.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth')) * k;
      var rect = el.parentElement.getBoundingClientRect();
      var base = el.classList.contains('hero-media') || el.classList.contains('dust') || el.classList.contains('hero-copy') ? current : (rect.top + rect.height / 2 - window.innerHeight / 2) * -1;
      if (el.classList.contains('hero-media') || el.classList.contains('dust') || el.classList.contains('hero-copy')) {
        if (current > window.innerHeight * 1.2) return;
      } else if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      el.style.transform = 'translate3d(0,' + (base * d).toFixed(1) + 'px,0)';
    });
    raf = current === target ? 0 : requestAnimationFrame(frame);
  }
  function onScroll() {
    target = window.scrollY || 0;
    nav.classList.toggle('solid', target > 40);
    if (reduce.matches) return;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
