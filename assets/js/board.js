/* 소식 게시판 (공지사항 · 설명회 일정 · 교육후기 · 행사갤러리)
 * <div class="board" data-board="notice|schedule|review|gallery"></div> 안에 글 목록을 그림
 * 글은 관리자 > 소식 관리에서 쓰고, assets/data/<게시판>.json 으로 저장됨
 * 상세 보기는 같은 페이지 주소 뒤에 ?id=글번호
 */
(function () {
  'use strict';
  var ROOT = document.body.getAttribute('data-root') || '';
  var PER = { notice: 10, review: 9, gallery: 12, schedule: 1000 };
  var WEEK = ['일', '월', '화', '수', '목', '금', '토'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function img(src, alt) {
    var i = document.createElement('img');
    // 관리자에서 올린 사진만 표시 (다른 주소는 무시)
    if (!/^assets\/img\/uploads\/[\w.-]+\.(jpe?g|png|webp|gif)$/i.test(src || '')) return null;
    i.src = ROOT + src; i.alt = alt || ''; i.loading = 'lazy';
    return i;
  }
  function fmt(d) { return (d || '').replace(/-/g, '.'); }
  function parse(d) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  function today() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function bodyText(text) {
    var box = el('div', 'bd-body');
    (text || '').split(/\n{2,}/).forEach(function (para) {
      if (!para.trim()) return;
      var p = el('p');
      para.split('\n').forEach(function (line, i) { if (i) p.appendChild(document.createElement('br')); p.appendChild(document.createTextNode(line)); });
      box.appendChild(p);
    });
    return box;
  }
  function param(k) { var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; }
  function link(id) { return location.pathname.split('/').pop() + (id ? '?id=' + encodeURIComponent(id) : ''); }
  function sortByDate(items) { return items.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.created || '').localeCompare(a.created || ''); }); }

  function pager(total, per, page, go) {
    var pages = Math.ceil(total / per);
    if (pages < 2) return null;
    var nav = el('nav', 'bd-pager'); nav.setAttribute('aria-label', '페이지');
    for (var i = 1; i <= pages; i++) {
      (function (n) {
        var b = el('button', n === page ? 'on' : '', String(n));
        b.type = 'button';
        if (n === page) b.setAttribute('aria-current', 'page');
        b.addEventListener('click', function () { go(n); });
        nav.appendChild(b);
      })(i);
    }
    return nav;
  }

  /* ---------- 상세 ---------- */
  function renderDetail(box, board, it) {
    var art = el('article', 'bd-view');
    var meta = el('p', 'bd-meta');
    if (it.cat) meta.appendChild(el('span', 'bd-badge', it.cat));
    meta.appendChild(el('time', '', fmt(it.date)));
    if (it.author) meta.appendChild(el('span', 'bd-author', it.author));
    art.appendChild(meta);
    art.appendChild(el('h2', 'bd-title', it.title));
    if (board === 'schedule') {
      var info = el('dl', 'bd-info');
      [['일시', fmt(it.date) + weekday(it.date) + (it.time ? ' ' + it.time : '')], ['장소', it.place]].forEach(function (r) {
        if (!r[1]) return; info.appendChild(el('dt', '', r[0])); info.appendChild(el('dd', '', r[1]));
      });
      art.appendChild(info);
    }
    (it.images || []).forEach(function (s) { var i = img(s, it.title); if (i) { var f = el('figure', 'bd-img'); f.appendChild(i); art.appendChild(f); } });
    if (it.body) art.appendChild(bodyText(it.body));
    var act = el('p', 'bd-actions');
    if (it.link && /^(https?:\/\/|\.\.\/|[a-z0-9])/i.test(it.link) && !/^javascript:/i.test(it.link)) {
      var a = el('a', 'btn btn-primary', '신청 · 자세히 보기'); a.href = it.link;
      if (/^https?:/i.test(it.link)) { a.target = '_blank'; a.rel = 'noopener'; }
      act.appendChild(a);
    }
    var back = el('a', 'btn btn-outline', '목록으로'); back.href = link('');
    act.appendChild(back);
    art.appendChild(act);
    box.appendChild(art);
    document.title = it.title + ' | ' + document.title.replace(/^.*?\|\s*/, '');
  }
  function weekday(d) { var x = parse(d); return x ? ' (' + WEEK[x.getDay()] + ')' : ''; }

  /* ---------- 목록 ---------- */
  function renderNotice(box, items, page) {
    var pinned = items.filter(function (i) { return i.pinned; });
    var rest = sortByDate(items.filter(function (i) { return !i.pinned; }));
    var per = PER.notice, slice = rest.slice((page - 1) * per, page * per);
    var ul = el('ul', 'board-list');
    (page === 1 ? sortByDate(pinned) : []).concat(slice).forEach(function (it) {
      var li = el('li', it.pinned ? 'is-pinned' : '');
      li.appendChild(el('span', 'badge', it.pinned ? '공지' : (it.cat || '소식')));
      var a = el('a', 't', it.title); a.href = link(it.id);
      li.appendChild(a);
      li.appendChild(el('time', '', fmt(it.date)));
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return rest.length;
  }

  function renderSchedule(box, items) {
    var t = today();
    var up = items.filter(function (i) { var d = parse(i.date); return d && d >= t; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var past = sortByDate(items.filter(function (i) { var d = parse(i.date); return !d || d < t; }));
    function list(arr, isPast) {
      var byMonth = {};
      arr.forEach(function (i) { var k = (i.date || '').slice(0, 7); (byMonth[k] = byMonth[k] || []).push(i); });
      Object.keys(byMonth).sort(function (a, b) { return isPast ? b.localeCompare(a) : a.localeCompare(b); }).forEach(function (k) {
        var h = el('h3', 'bd-month', k ? k.slice(0, 4) + '년 ' + (+k.slice(5)) + '월' : '날짜 미정');
        box.appendChild(h);
        var ul = el('ul', 'board-list sched' + (isPast ? ' is-past' : ''));
        byMonth[k].forEach(function (it) {
          var li = el('li');
          var d = parse(it.date);
          var day = el('span', 'sc-day');
          day.appendChild(el('b', '', d ? String(d.getDate()) : '-'));
          day.appendChild(el('small', '', d ? WEEK[d.getDay()] + '요일' : ''));
          li.appendChild(day);
          var mid = el('div', 'sc-main');
          var top = el('p', 'sc-top');
          top.appendChild(el('span', 'badge' + (it.cat === '설명회' ? '' : ' edu') + (isPast ? ' past' : ''), isPast ? '종료' : (it.cat || '일정')));
          var a = el('a', 't', it.title); a.href = link(it.id);
          top.appendChild(a);
          mid.appendChild(top);
          var sub = [it.time, it.place].filter(Boolean).join(' · ');
          if (sub) mid.appendChild(el('p', 'sc-sub', sub));
          li.appendChild(mid);
          ul.appendChild(li);
        });
        box.appendChild(ul);
      });
    }
    if (up.length) list(up, false);
    else box.appendChild(el('p', 'bd-empty', '예정된 일정이 없습니다. 새 일정은 곧 안내해 드리겠습니다.'));
    if (past.length) {
      var det = el('details', 'bd-past');
      det.appendChild(el('summary', '', '지난 일정 보기 (' + past.length + ')'));
      var inner = el('div');
      det.appendChild(inner);
      box.appendChild(det);
      var keep = box; box = inner; list(past.slice(0, 60), true); box = keep;
    }
    box.appendChild(calendar(items, up[0]));
    return 0;
  }

  /* ---------- 일정 달력 (목록 아래) ----------
   * 처음에는 가장 가까운 예정 일정이 있는 달(없으면 이번 달)을 보여 주고 ‹ › 로 달을 넘김
   * 날짜를 누르면 그날 일정이 달력 아래에 목록으로 나옴 (휴대폰에서는 달력 칸에 점만 표시)
   */
  function calendar(items, next) {
    var wrap = el('section', 'bd-cal');
    wrap.setAttribute('aria-label', '일정 달력');
    var head = el('div', 'bd-cal-head');
    head.appendChild(el('h3', 'bd-cal-title', '달력으로 보기'));
    var nav = el('div', 'bd-cal-nav');
    var prev = el('button', '', '‹'); prev.type = 'button'; prev.setAttribute('aria-label', '이전 달');
    var label = el('strong', 'bd-cal-month');
    label.setAttribute('aria-live', 'polite');
    var nextBtn = el('button', '', '›'); nextBtn.type = 'button'; nextBtn.setAttribute('aria-label', '다음 달');
    var todayBtn = el('button', 'bd-cal-today', '오늘'); todayBtn.type = 'button';
    nav.appendChild(prev); nav.appendChild(label); nav.appendChild(nextBtn); nav.appendChild(todayBtn);
    head.appendChild(nav);
    wrap.appendChild(head);
    var grid = el('div', 'bd-cal-grid');
    wrap.appendChild(grid);
    var dayList = el('div', 'bd-cal-day');
    dayList.setAttribute('aria-live', 'polite');
    wrap.appendChild(dayList);

    var byDate = {};
    items.forEach(function (i) { if (parse(i.date)) (byDate[i.date] = byDate[i.date] || []).push(i); });
    var t = today();
    var start = next ? parse(next.date) : t;
    var y = start.getFullYear(), m = start.getMonth(), picked = null;
    function key(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

    function showDay(k) {
      picked = k;
      dayList.innerHTML = '';
      grid.querySelectorAll('.on').forEach(function (n) { n.classList.remove('on'); });
      var cell = grid.querySelector('[data-day="' + k + '"]');
      if (cell) cell.classList.add('on');
      var evs = byDate[k] || [];
      var d = parse(k);
      dayList.appendChild(el('p', 'bd-cal-day-title', (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WEEK[d.getDay()] + ')'));
      if (!evs.length) { dayList.appendChild(el('p', 'bd-cal-none', '이날은 일정이 없습니다.')); return; }
      var ul = el('ul', 'board-list');
      evs.forEach(function (it) {
        var li = el('li');
        li.appendChild(el('span', 'badge' + (it.cat === '설명회' ? '' : ' edu') + (d < t ? ' past' : ''), d < t ? '종료' : (it.cat || '일정')));
        var a = el('a', 't', it.title); a.href = link(it.id);
        li.appendChild(a);
        var sub = [it.time, it.place].filter(Boolean).join(' · ');
        if (sub) li.appendChild(el('time', '', sub));
        ul.appendChild(li);
      });
      dayList.appendChild(ul);
    }

    function draw() {
      label.textContent = y + '년 ' + (m + 1) + '월';
      grid.innerHTML = '';
      WEEK.forEach(function (w, i) { grid.appendChild(el('span', 'bd-cal-wd' + (i === 0 ? ' sun' : i === 6 ? ' sat' : ''), w)); });
      var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
      for (var b = 0; b < first.getDay(); b++) grid.appendChild(el('span', 'bd-cal-cell is-blank'));
      for (var day = 1; day <= days; day++) {
        var d = new Date(y, m, day), k = key(d), evs = byDate[k] || [];
        var cell = el('div', 'bd-cal-cell' + (d.getDay() === 0 ? ' sun' : d.getDay() === 6 ? ' sat' : '') + (+d === +t ? ' is-today' : '') + (evs.length ? ' has-ev' : '') + (d < t ? ' is-past' : ''));
        cell.setAttribute('data-day', k);
        var num = el('button', 'bd-cal-num', String(day));
        num.type = 'button';
        num.setAttribute('aria-label', (m + 1) + '월 ' + day + '일' + (evs.length ? ', 일정 ' + evs.length + '개' : ''));
        // 칸 어디를 눌러도 그날 일정 보기 (일정 제목 링크는 바로 상세로)
        cell.addEventListener('click', (function (kk) { return function (e) { if (!e.target.closest('a')) showDay(kk); }; })(k));
        cell.appendChild(num);
        if (evs.length) {
          var ul = el('ul', 'bd-cal-evs');
          evs.forEach(function (it) {
            var li = el('li', it.cat === '설명회' ? 'ev-a' : 'ev-b');
            var a = el('a', '', it.title.replace(/^\s*(MDR\s*)?나비독서\s*/, '') || it.title); a.href = link(it.id); a.title = it.title + (it.time ? ' · ' + it.time : '');
            li.appendChild(a);
            ul.appendChild(li);
          });
          cell.appendChild(ul);
          var dots = el('span', 'bd-cal-dots');
          evs.slice(0, 3).forEach(function (it) { dots.appendChild(el('i', it.cat === '설명회' ? 'ev-a' : 'ev-b')); });
          cell.appendChild(dots);
        }
        grid.appendChild(cell);
      }
      var count = Object.keys(byDate).filter(function (k) { return k.slice(0, 7) === y + '-' + ('0' + (m + 1)).slice(-2); }).reduce(function (n, k) { return n + byDate[k].length; }, 0);
      dayList.innerHTML = '';
      if (picked && picked.slice(0, 7) === y + '-' + ('0' + (m + 1)).slice(-2)) showDay(picked);
      else dayList.appendChild(el('p', 'bd-cal-none', count ? '날짜를 누르면 그날 일정을 볼 수 있습니다. (이달 일정 ' + count + '개)' : '이달에는 등록된 일정이 없습니다.'));
    }
    prev.addEventListener('click', function () { m--; if (m < 0) { m = 11; y--; } draw(); });
    nextBtn.addEventListener('click', function () { m++; if (m > 11) { m = 0; y++; } draw(); });
    todayBtn.addEventListener('click', function () { y = t.getFullYear(); m = t.getMonth(); draw(); });
    var legend = el('p', 'bd-cal-legend');
    legend.appendChild(el('span', 'ev-a', '설명회'));
    legend.appendChild(el('span', 'ev-b', '교육 · 기타'));
    wrap.appendChild(legend);
    draw();
    return wrap;
  }

  function renderReview(box, items, page) {
    var all = sortByDate(items), per = PER.review;
    var grid = el('div', 'bd-cards');
    all.slice((page - 1) * per, page * per).forEach(function (it) {
      var a = el('a', 'bd-card'); a.href = link(it.id);
      var cover = it.images && it.images[0] && img(it.images[0], '');
      if (cover) { var f = el('span', 'bd-cover'); f.appendChild(cover); a.appendChild(f); }
      var inner = el('span', 'bd-card-body');
      if (it.cat) inner.appendChild(el('span', 'bd-badge', it.cat));
      inner.appendChild(el('strong', '', it.title));
      if (it.body) inner.appendChild(el('span', 'bd-excerpt', it.body.replace(/\s+/g, ' ').slice(0, 90) + (it.body.length > 90 ? '…' : '')));
      inner.appendChild(el('span', 'bd-date', [it.author, fmt(it.date)].filter(Boolean).join(' · ')));
      a.appendChild(inner);
      grid.appendChild(a);
    });
    box.appendChild(grid);
    return all.length;
  }

  function renderGallery(box, items, page) {
    var all = sortByDate(items), per = PER.gallery;
    var grid = el('div', 'gallery bd-gallery');
    all.slice((page - 1) * per, page * per).forEach(function (it) {
      var a = el('a', 'bd-album'); a.href = link(it.id);
      var cover = it.images && it.images[0] && img(it.images[0], it.title);
      var ph = el('span', 'ph' + (cover ? ' has-photo' : ''));
      if (cover) ph.appendChild(cover); else ph.textContent = '📷';
      if (it.images && it.images.length > 1) ph.appendChild(el('span', 'bd-count', '+' + (it.images.length - 1)));
      a.appendChild(ph);
      var cap = el('span', 'bd-cap', it.title);
      cap.appendChild(el('time', '', fmt(it.date)));
      a.appendChild(cap);
      grid.appendChild(a);
    });
    box.appendChild(grid);
    return all.length;
  }

  var RENDER = { notice: renderNotice, schedule: renderSchedule, review: renderReview, gallery: renderGallery };

  function start() {
    var boxes = document.querySelectorAll('.board[data-board]');
    if (!boxes.length) return;
    boxes.forEach(function (box) {
      var board = box.getAttribute('data-board');
      if (!/^[a-z0-9-]{1,60}$/.test(board || '')) return;
      // 관리자 페이지 편집 화면에서는 목록을 그리지 않음 (저장되는 본문에 섞이지 않게)
      if (window.EDITOR) { box.innerHTML = ''; box.appendChild(el('p', 'placeholder-box', '이 자리의 글 목록은 관리자 첫 화면 > 소식 관리에서 편집합니다.')); return; }
      fetch(ROOT + 'assets/data/' + board + '.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
          var items = (data && data.items) || [];
          // 표시 방식: 새로 추가한 게시판은 관리자에서 고른 방식, 기본 4개는 게시판 이름 그대로
          var type = (data && RENDER[data.type]) ? data.type : (RENDER[board] ? board : 'notice');
          var id = param('id');
          var hide = document.querySelectorAll('[data-board-list-only]');
          box.innerHTML = '';
          if (id) {
            var it = items.filter(function (i) { return i.id === id; })[0];
            if (it) { hide.forEach(function (n) { n.hidden = true; }); renderDetail(box, type, it); box.scrollIntoView({ block: 'start' }); return; }
          }
          if (!items.length) { box.appendChild(el('p', 'bd-empty', '아직 등록된 글이 없습니다.')); return; }
          (function draw(page) {
            box.innerHTML = '';
            var total = RENDER[type](box, items, page);
            var p = pager(total, PER[type], page, function (n) { draw(n); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
            if (p) box.appendChild(p);
          })(1);
        })
        .catch(function () { box.innerHTML = ''; box.appendChild(el('p', 'bd-empty', '글 목록을 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요.')); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
