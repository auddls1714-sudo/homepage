/* 공통 글로벌 내비 · 서브 내비 · 푸터 · 모바일 메뉴 · 하단 상담 바
 * 각 페이지 <body data-root="">  (하위 폴더 페이지는 data-root="../")
 */
(function () {
  var ROOT = document.body.getAttribute('data-root') || '';
  // 관리자 > 사이트 설정 값 (assets/js/site-config.js). 없으면 기본값 사용
  var SITE = window.SITE || {};
  function cfg(k, d) { return SITE[k] ? String(SITE[k]) : d; }
  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var TEL = esc(cfg('tel', '1661-3507'));
  var KAKAO = esc(cfg('kakao', 'http://pf.kakao.com/_eWeTn/chat'));
  var BLOG = esc(cfg('blog', 'https://blog.naver.com/flyreadingkorea'));
  var INSTA = esc(cfg('instagram', 'https://www.instagram.com/kw046277'));
  var YT = esc(cfg('youtube', 'https://www.youtube.com/@%EB%82%98%EB%B9%84%EB%8F%85%EC%84%9C%EB%A7%B9%EB%AA%A8%ED%95%9C%EC%9E%90/featured'));
  var COMPANY = esc(cfg('company', '에듀마루'));
  var CEO = esc(cfg('ceo', '권혁천'));
  var BIZNO = esc(cfg('bizno', '301-48-01388'));
  var ADDRESS = esc(cfg('address', '충남 천안시 동남구 청당동 396-12 코르지아 빌딩 512호'));

  // 기본 메뉴 (관리자 > 상단 메뉴에서 바꾸면 site-config.js 의 SITE.menu 가 대신 쓰임)
  var DEFAULT_MENU = [
    { key: 'about', title: '나비독서 소개', items: [
      ['브랜드 소개', 'about/brand.html'],
      ['연혁', 'about/history.html'],
      ['오시는 길', 'about/location.html']
    ]},
    { key: 'program', title: '프로그램', items: [
      ['훈련형 독서란?', 'program/training.html'],
      ['Big5 독서전략', 'program/big5.html'],
      ['단계별 과정', 'program/levels.html'],
      ['수업 시스템', 'program/system.html'],
      ['교재 · 추천도서', 'program/books.html'],
      ['맹모한자', 'program/hanja.html']
    ]},
    { key: 'care', title: '진단 · 관리', items: [
      ['진단평가', 'care/diagnosis.html'],
      ['IT 학습관리 시스템', 'care/it-system.html']
    ]},
    { key: 'news', title: '소식', items: [
      ['공지사항', 'news/notice.html'],
      ['설명회 · 교육 일정', 'news/schedule.html'],
      ['교육후기', 'news/review.html'],
      ['행사갤러리', 'news/gallery.html']
    ]},
    { key: 'franchise', title: '가맹안내', items: [
      ['왜 나비독서인가', 'franchise/flyreading-sub.html'],
      ['운영 형태', 'franchise/model.html'],
      ['본사 지원', 'franchise/support.html'],
      ['개설 절차', 'franchise/process.html'],
      ['가맹 현황', 'franchise/status.html'],
      ['가맹 상담 신청', 'franchise/contact.html']
    ]}
  ];

  var MENU = validMenu(SITE.menu) ? SITE.menu : DEFAULT_MENU;

  function validMenu(m) {
    return Array.isArray(m) && m.length > 0 && m.every(function (c) {
      return c && typeof c.title === 'string' && Array.isArray(c.items) &&
        c.items.every(function (i) { return Array.isArray(i) && typeof i[0] === 'string' && typeof i[1] === 'string'; });
    });
  }
  /** 사이트 안 경로는 현재 페이지 기준으로, 외부 주소·전화는 그대로 */
  function href(p) {
    if (/^\s*javascript:/i.test(p)) return '#';
    return esc(/^(https?:|tel:|mailto:|#)/i.test(p) ? p : ROOT + p);
  }
  function ext(p) { return /^https?:/i.test(p) ? ' target="_blank" rel="noopener"' : ''; }
  // data-g: 메뉴 몇 번째 카테고리의 링크인지 (같은 페이지가 여러 메뉴에 있을 때 들어온 메뉴를 기억)
  function links(items, g) {
    return items.map(function (i) { return '<a href="' + href(i[1]) + '"' + ext(i[1]) + (g === undefined ? '' : ' data-g="' + g + '"') + '>' + esc(i[0]) + '</a>'; }).join('');
  }
  function catHref(m) { return m.items.length ? href(m.items[0][1]) : '#'; }

  // 로고: 관리자 > 로고에서 올린 이미지가 있으면 이미지, 없으면 글자
  var LOGO_SRC = /^assets\/img\/logo\/[\w.-]+\.(png|jpe?g|webp|gif)$/i.test(cfg('logo', '')) ? cfg('logo', '') : '';
  var LOGO_H = Math.max(16, Math.min(40, parseInt(cfg('logo_h', '28'), 10) || 28));
  var LOGO_TEXT = !LOGO_SRC || SITE.logo_text !== '0';
  var logo = '<a class="logo" href="' + ROOT + 'index.html"' + (LOGO_TEXT ? '' : ' aria-label="나비독서 홈"') + '>' +
    (LOGO_SRC ? '<img class="logo-img" src="' + ROOT + esc(LOGO_SRC) + '" alt="' + (LOGO_TEXT ? '' : '나비독서') + '" style="height:' + LOGO_H + 'px">' : '<span class="logo-mark" aria-hidden="true"></span>') +
    (LOGO_TEXT ? '<span class="logo-text">나비독서</span>' : '') + '</a>';

  // 글로벌 내비 (블랙, 44px)
  var header =
    '<header class="site-header"><div class="container">' + logo +
    '<nav class="gnb" aria-label="주 메뉴"><ul>' +
      MENU.map(function (m, g) {
        return '<li><a href="' + catHref(m) + '" data-g="' + g + '">' + esc(m.title) + '</a>' + (m.items.length ? '<div class="sub">' + links(m.items, g) + '</div>' : '') + '</li>';
      }).join('') +
    '</ul></nav>' +
    '<div class="header-cta">' +
      '<a class="btn btn-primary btn-sm" href="' + ROOT + 'franchise/contact.html">상담 신청</a>' +
      '<div class="member-nav" hidden></div>' +
    '</div>' +
    '<button class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false"><span></span></button>' +
    '</div></header>' +
    '<nav class="m-menu" aria-label="모바일 메뉴">' +
      MENU.map(function (m, g) { return '<details><summary>' + esc(m.title) + '</summary>' + links(m.items, g) + '</details>'; }).join('') +
      '<a class="btn btn-primary" href="tel:' + TEL + '">가맹 상담 ' + TEL + '</a>' +
      '<div class="member-nav" hidden></div>' +
    '</nav>';

  // 푸터 (파치먼트, 사이트맵)
  var footer =
    '<footer class="site-footer"><div class="container">' +
      '<div class="footer-cta"><span>전국 가맹 상담<strong>' + TEL + '</strong></span>' +
        '<span><a href="' + KAKAO + '" target="_blank" rel="noopener" style="color:var(--primary)">카카오톡 문의 ›</a></span></div>' +
      '<div class="footer-map">' +
        MENU.map(function (m, g) { return '<div><h4>' + esc(m.title) + '</h4>' + links(m.items, g) + '</div>'; }).join('') +
      '</div>' +
      '<div class="footer-bottom">' +
        '<div class="footer-links">' +
          '<a href="#">개인정보처리방침</a><a href="#">이용약관</a>' +
          '<a href="' + BLOG + '" target="_blank" rel="noopener">블로그</a>' +
          '<a href="' + INSTA + '" target="_blank" rel="noopener">인스타그램</a>' +
          '<a href="' + YT + '" target="_blank" rel="noopener">유튜브</a>' +
        '</div>' +
        '<p class="footer-info"><span>' + COMPANY + '</span><span>대표 ' + CEO + '</span><span>사업자등록번호 ' + BIZNO + '</span></p>' +
        '<p class="footer-info"><span>' + ADDRESS + '</span><span>문의 ' + TEL + '</span></p>' +
        '<p>Copyright © ' + COMPANY + '. All rights reserved.</p>' +
      '</div>' +
    '</div></footer>' +
    // 모바일 하단 상담 바 (프로스트)
    '<div class="float-cta">' +
      '<span class="label">전국 가맹 상담<b>' + TEL + '</b></span>' +
      '<a class="btn kakao" href="' + KAKAO + '" target="_blank" rel="noopener">카카오톡</a>' +
      '<a class="btn btn-primary" href="tel:' + TEL + '">전화 상담</a>' +
    '</div>';

  // 서브페이지 하단 상담 타일 (data-cta="none"이면 생략)
  var ctaBand = '';
  if (ROOT && document.body.getAttribute('data-cta') !== 'none') {
    ctaBand =
      '<section class="cta-band"><div class="container">' +
        '<div><h2><mark>지역 문해력 교육,</mark> 나비독서로 시작하세요.</h2>' +
        '<p>신규 창업 · 기존 학원 과목 추가 모두 상담 가능합니다.</p></div>' +
        '<div class="actions">' +
          '<a class="btn btn-primary" href="' + ROOT + 'franchise/contact.html">상담 신청</a>' +
          '<a class="btn btn-outline" href="tel:' + TEL + '">' + TEL + '</a>' +
        '</div>' +
      '</div></section>';
  }

  document.body.insertAdjacentHTML('afterbegin', '<div class="preview-note">디자인 미리보기 사이트입니다 · 상담 신청 · 회원 · 관리자 기능은 실제 사이트에서 동작합니다</div>' + header);
  document.body.insertAdjacentHTML('beforeend', ctaBand + footer);

  // 서브 내비 (<nav class="lnb" data-group="program|franchise|...">)
  var lnb = document.querySelector('.lnb[data-group]');
  if (lnb) {
    var here = decodeURIComponent(location.pathname.split('/').slice(-2).join('/'));
    // 이 페이지가 들어 있는 카테고리 (관리자에서 옮겼을 수 있음) → 없으면 원래 카테고리
    var owners = MENU.filter(function (m) { return m.items.some(function (i) { return i[1] === here; }); });
    var picked = null;
    try { picked = MENU[+sessionStorage.getItem('nabiGroup')]; } catch (e) {}
    // 여러 메뉴에 들어 있는 페이지면 방금 누른 메뉴의 하위 항목을 보여 줌
    var group = (picked && owners.indexOf(picked) >= 0 ? picked : owners[0]) ||
      MENU.filter(function (m) { return m.key === lnb.getAttribute('data-group'); })[0];
    if (!group) lnb.hidden = true;
    if (group) {
      var isContact = here === 'franchise/contact.html';
      lnb.innerHTML =
        '<div class="container">' +
          '<span class="sub-title">' + esc(group.title) + '</span>' +
          '<div class="sub-links">' + group.items.map(function (i) {
            var active = here === i[1];
            return '<a href="' + href(i[1]) + '"' + ext(i[1]) + ' data-g="' + MENU.indexOf(group) + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' + esc(i[0]) + '</a>';
          }).join('') + '</div>' +
          (isContact
            ? '<a class="btn btn-primary btn-sm" href="tel:' + TEL + '">전화 상담</a>'
            : '<a class="btn btn-primary btn-sm" href="' + ROOT + 'franchise/contact.html">가맹 상담</a>') +
        '</div>';
      var act = lnb.querySelector('.active');
      var row = lnb.querySelector('.sub-links');
      if (act && row.scrollWidth > row.clientWidth) row.scrollLeft = act.offsetLeft - 16;
    }
  }

  // 메뉴 링크를 누르면 어느 카테고리에서 들어왔는지 기억 (탭을 닫으면 사라짐)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-g]');
    if (a) try { sessionStorage.setItem('nabiGroup', a.getAttribute('data-g')); } catch (err) {}
  }, true);

  var toggle = document.querySelector('.menu-toggle');
  var mMenu = document.querySelector('.m-menu');
  toggle.addEventListener('click', function () {
    var open = mMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.classList.toggle('menu-open', open);
  });

  // 회원: 로그인 상태에 따라 머리글에 로그인 · 회원가입 또는 자료실 · 내 정보 · 로그아웃
  // (PHP 가 없는 곳 — 파일을 바로 열었거나 정적 미리보기 — 에서는 표시하지 않음)
  if (window.fetch && location.protocol !== 'file:') {
    fetch(ROOT + 'member/status.php', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok && /json/.test(r.headers.get('content-type') || '') ? r.json() : null; })
      .then(function (st) {
        if (!st) return;
        var M = ROOT + 'member/';
        var html = st.login
          ? '<a href="' + M + 'library.php">자료실</a><a href="' + M + 'mypage.php">' + esc(String(st.name)) + '님</a>' +
            '<form method="post" action="' + M + 'logout.php"><input type="hidden" name="csrf" value="' + esc(String(st.csrf)) + '"><button type="submit">로그아웃</button></form>'
          : '<a href="' + M + 'login.php">로그인</a><a href="' + M + 'join.php">회원가입</a>';
        document.querySelectorAll('.member-nav').forEach(function (n) { n.innerHTML = html; n.hidden = false; });
      })
      .catch(function () {});
  }

  // 스크롤 등장 효과
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 이미지 슬라이드 ----------
   * <div class="slider" data-interval="5" data-ratio="auto|16/9|..." data-arrows="0" data-dots="0">
   *   <div class="slider-track"> <a class="slide" href="..."><img></a> <div class="slide"><img></div> </div>
   * </div>
   * 화살표·점 등 화면 조작 요소는 여기서 만들어 붙임(.slider-ui) — 저장되는 HTML 에는 없음
   */
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sliders = [];

  function setupSlider(el) {
    var track = el.querySelector(':scope > .slider-track');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children).filter(function (n) { return n.classList.contains('slide'); });
    var n = slides.length, idx = 0, timer = null, paused = false;
    var sec = parseFloat(el.getAttribute('data-interval'));
    var interval = isNaN(sec) ? 5 : Math.max(0, Math.min(60, sec));
    var scenes = slides.some(function (s) { return s.classList.contains('scene'); });
    if (scenes) { el.classList.add('slider-scenes'); slides.forEach(prepScene); }
    var runToken = 0, counters = [];

    // 비율: 지정값 또는 첫 이미지 원본 비율 (움직이는 장면은 내용 높이에 맞춤)
    var ratio = el.getAttribute('data-ratio') || 'auto';
    if (scenes) { /* 높이 자동 */ }
    else if (/^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(ratio)) el.style.setProperty('--slider-ratio', ratio.replace('/', ' / '));
    else {
      var first = slides[0] && slides[0].querySelector('img');
      var setR = function () { if (first.naturalWidth) el.style.setProperty('--slider-ratio', first.naturalWidth + ' / ' + first.naturalHeight); };
      if (first) { if (first.complete) setR(); else first.addEventListener('load', setR); }
    }

    el.setAttribute('role', 'region');
    el.setAttribute('aria-roledescription', '슬라이드');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', scenes ? '장면 슬라이드' : '이미지 슬라이드');

    var ui = [];
    var dots = null;
    if (n > 1 && el.getAttribute('data-arrows') !== '0') {
      ['prev', 'next'].forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slider-ui slider-btn slider-' + k;
        b.setAttribute('aria-label', k === 'prev' ? '이전 화면' : '다음 화면');
        b.innerHTML = k === 'prev' ? '&#8249;' : '&#8250;';
        b.addEventListener('click', function () { go(idx + (k === 'prev' ? -1 : 1)); restart(); });
        el.appendChild(b); ui.push(b);
      });
    }
    if (n > 1 && el.getAttribute('data-dots') !== '0') {
      dots = document.createElement('div');
      dots.className = 'slider-ui slider-dots';
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('aria-label', (i + 1) + '번째 화면');
        d.addEventListener('click', function () { go(i); restart(); });
        dots.appendChild(d);
      });
      el.appendChild(dots); ui.push(dots);
    }

    function go(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      slides.forEach(function (s, k) {
        s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
        // 안 보이는 슬라이드의 링크는 탭 이동에서 제외
        if (s.tagName === 'A') { if (k === idx) s.removeAttribute('tabindex'); else s.setAttribute('tabindex', '-1'); }
        s.querySelectorAll('a, button').forEach(function (a) { if (k === idx) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); });
      });
      if (scenes) playScene(slides[idx]);
      if (dots) Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (n > 1 && interval > 0 && !REDUCED) timer = setInterval(function () { if (!paused && !document.hidden) go(idx + 1); }, interval * 1000);
    }
    el.addEventListener('mouseenter', function () { paused = true; });
    el.addEventListener('mouseleave', function () { paused = false; });
    el.addEventListener('focusin', function () { paused = true; });
    el.addEventListener('focusout', function () { paused = false; });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(idx - 1); restart(); }
      if (e.key === 'ArrowRight') { go(idx + 1); restart(); }
    });
    // 손가락으로 밀어 넘기기
    var x0 = null;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    });

    /** 장면 움직임 다시 재생: 클래스를 뗐다 붙이고, 숫자는 0부터 올림 */
    function playScene(cur) {
      stopCounters();
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      if (!cur.classList.contains('scene')) return;
      void cur.offsetWidth;
      cur.classList.add('is-active');
      if (REDUCED) return;
      var token = runToken;
      cur.querySelectorAll('.cnt').forEach(function (c) {
        var fin = c.textContent, to = parseFloat(fin.replace(/,/g, ''));
        if (isNaN(to)) return;
        var comma = fin.indexOf(',') >= 0 || to >= 1000;
        var host = c.closest('li, .bar') || c;
        var delay = (parseFloat(getComputedStyle(host).getPropertyValue('--cd')) || 0.4) * 1000;
        var item = { el: c, fin: fin };
        counters.push(item);
        c.textContent = '0';
        var t0 = null;
        function step(ts) {
          if (token !== runToken) return;
          if (t0 === null) t0 = ts + delay;
          var p = Math.max(0, Math.min(1, (ts - t0) / 1100));
          var v = Math.round(to * (1 - Math.pow(1 - p, 3)));
          c.textContent = p >= 1 ? fin : (comma ? v.toLocaleString('en-US') : String(v));
          if (p < 1) item.raf = requestAnimationFrame(step);
        }
        item.raf = requestAnimationFrame(step);
      });
    }
    function stopCounters() {
      runToken++;
      counters.forEach(function (it) { cancelAnimationFrame(it.raf); it.el.textContent = it.fin; });
      counters = [];
    }

    go(0); restart();
    sliders.push({ el: el, track: track, ui: ui, slides: slides, stop: function () { if (timer) clearInterval(timer); stopCounters(); } });
  }

  /** 장면 준비: 그래프 높이 · 너비를 적힌 숫자에서 계산 (관리자에서 숫자만 고치면 그래프도 맞춰짐) */
  function prepScene(s) {
    var bars = s.querySelectorAll('.sc-bars .bar');
    if (bars.length) {
      var vals = Array.prototype.map.call(bars, function (b) { var c = b.querySelector('.cnt'); return c ? parseFloat(c.textContent.replace(/,/g, '')) || 0 : 0; });
      var max = Math.max.apply(null, vals) || 1;
      Array.prototype.forEach.call(bars, function (b, i) {
        var col = b.querySelector('.bar-col');
        if (col) col.style.setProperty('--h', Math.max(6, Math.round(vals[i] / max * 100)) + '%');
      });
    }
    s.querySelectorAll('.paper-rows li').forEach(function (li) {
      var sc = li.querySelector('.pr-score'), bar = li.querySelector('.pr-bar i');
      var v = sc ? parseFloat(sc.textContent) : NaN;
      if (bar && !isNaN(v)) bar.style.setProperty('--v', Math.max(0, Math.min(100, v)) + '%');
    });
  }
  document.querySelectorAll('.slider').forEach(setupSlider);

  // 관리자 편집기가 슬라이드를 편집할 수 있도록 화면 조작 요소를 걷어내는 함수
  window.NabiSlider = {
    destroyAll: function () {
      sliders.forEach(function (s) {
        s.stop();
        s.ui.forEach(function (u) { u.remove(); });
        s.track.style.transform = '';
        Array.prototype.forEach.call(s.track.children, function (c) {
          c.removeAttribute('aria-hidden'); c.removeAttribute('tabindex'); c.classList.remove('is-active');
          c.querySelectorAll('[tabindex="-1"]').forEach(function (a) { a.removeAttribute('tabindex'); });
        });
        ['role', 'aria-roledescription'].forEach(function (a) { s.el.removeAttribute(a); });
        if (/^(이미지|장면) 슬라이드$/.test(s.el.getAttribute('aria-label') || '')) s.el.removeAttribute('aria-label');
        s.el.style.removeProperty('--slider-ratio');
        if (s.el.getAttribute('style') === '') s.el.removeAttribute('style');
        if (s.track.getAttribute('style') === '') s.track.removeAttribute('style');
      });
      sliders = [];
    },
    setup: setupSlider,
    prepScene: prepScene
  };
})();
