/* 춘의역탑부동산 FAQ 상담봇
 * - faq-data.js(window.FAQ_DATA, faq.md에서 자동 생성)만으로 동작합니다. 서버·API 키 불필요.
 * - 질문과 FAQ 문항의 글자 조각(2글자 단위)을 비교해 가장 비슷한 답을 보여줍니다.
 */
(function () {
  var PHONE = '032-683-5949', TEL = 'tel:0326835949';
  var AVATAR = 'assets/ceo-avatar-300.jpg';
  var DATA = window.FAQ_DATA || [];
  if (!DATA.length) return;

  // 고객이 자주 쓰는 표현 → FAQ에 쓰인 표현
  var SYN = [
    [/수수료|복비|중개비|중계비|중개료/g, ' 중개보수 '],
    [/부가세/g, ' 부가가치세 '],
    [/어디|찾아가|가는\s*길|오시는\s*길|약도|몇\s*번\s*출구|출구/g, ' 사무소 위치 출구 '],
    [/몇\s*시|영업\s*시간|운영\s*시간|문\s*여|쉬는\s*날|휴무|주말|일요일|토요일/g, ' 영업시간 휴무일 '],
    [/전화번호|연락처|번호/g, ' 전화 '],
    [/지산|아파트형\s*공장/g, ' 지식산업센터 '],
    [/사도\s*되|사려|매수|구입|살\s*수\s*있/g, ' 아무나 '],
    [/깡통|전세\s*사기|떼이|안전한\s*집/g, ' 선순위 채권 위험 확인 '],
    [/보증\s*보험|hug|허그/gi, ' 전세보증보험 '],
    [/갱신/g, ' 계약갱신요구권 '],
    [/내놓|팔고\s*싶|팔려고|매물\s*등록|의뢰/g, ' 집을 내놓으려면 '],
    [/집주인/g, ' 임대인 '],
    [/세입자/g, ' 임차인 '],
    [/이사\s*가야|중간에\s*나가|중도\s*해지/g, ' 만기 전에 이사 중도 해지 '],
    [/돌려\s*(받|줘|주)|반환|안\s*줘/g, ' 만기에 보증금을 못 돌려받으면 '],
    [/최우선/g, ' 소액임차인 최우선변제 '],
    [/등록번호|허가/g, ' 중개사무소 등록 '],
    [/대출/g, ' 대출 '],
    [/취득세|세금/g, ' 취득세 세금 '],
    [/권리금/g, ' 권리금 '],
    [/계약금/g, ' 계약금 '],
    [/잔금/g, ' 잔금일 '],
    [/카드/g, ' 카드 중개보수 '],
    [/현금\s*영수증|세금\s*계산서|영수증/g, ' 현금영수증 세금계산서 '],
    [/경력|이력|누구/g, ' 대표 경력 상담 누가 '],
    [/주차/g, ' 주차 ']
  ];
  var STOP = /(인가요|하나요|있나요|되나요|나요|까요|해요|예요|이에요|주세요|알려|궁금|어떻게|좀)/g;

  function norm(s) { return (s || '').toLowerCase().replace(/[^0-9a-z가-힣]/g, ''); }
  function grams(s) {
    var t = norm(s), set = {};
    for (var i = 0; i < t.length - 1; i++) set[t.substr(i, 2)] = 1;
    if (t.length === 1) set[t] = 1;
    return set;
  }
  var INDEX = DATA.map(function (d) {
    return { d: d, q: grams(d.q), a: grams(d.a), c: grams(d.c) };
  });

  // 동의어로 덧붙일 표현만 따로 돌려줌
  function extras(text) {
    var add = '';
    SYN.forEach(function (p) { p[0].lastIndex = 0; if (p[0].test(text)) add += p[1]; p[0].lastIndex = 0; });
    return add;
  }
  function expand(text) { return text + ' ' + extras(text); }
  function search(text) {
    var nq = norm(text);
    var exact = INDEX.filter(function (it) { return norm(it.d.q) === nq; })[0];
    if (exact) return [{ d: exact.d, s: 99 }].concat(search2(text).filter(function (x) { return x.d !== exact.d; }));
    return search2(text);
  }
  function search2(text) {
    var clean = text.replace(STOP, ' ');
    var g = grams(clean), keys = Object.keys(g);
    var e = grams(extras(text)), ekeys = Object.keys(e).filter(function (k) { return !g[k]; });
    var W = 0.6; // 동의어로 추가된 글자 조각은 가중치를 낮춤
    if (!keys.length && !ekeys.length) return [];
    function pts(it, k) { return (it.q[k] ? 3 : 0) + (it.a[k] ? 1 : 0) + (it.c[k] ? 0.5 : 0); }
    return INDEX.map(function (it) {
      var s = 0;
      keys.forEach(function (k) { s += pts(it, k); });
      ekeys.forEach(function (k) { s += W * pts(it, k); });
      return { d: it.d, s: s / Math.sqrt(keys.length + W * ekeys.length) };
    }).sort(function (x, y) { return y.s - x.s; });
  }

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(ans) {
    var pending = /\[입력:[^\]]*\]/.test(ans);
    var h = esc(ans).replace(/\[입력:[^\]]*\]/g, '<em>(준비 중인 정보)</em>');
    h = h.replace(/032-683-5949/g, '<a href="' + TEL + '">032-683-5949</a>');
    if (pending) h += '<br><small>이 항목은 아직 홈페이지에 등록 전입니다. 전화로 문의해 주세요.</small>';
    return h;
  }

  // ---------- UI ----------
  var launch = document.createElement('button');
  launch.className = 'cb-launch'; launch.type = 'button';
  launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'cb-panel');
  launch.innerHTML = '<img src="' + AVATAR + '" alt=""><span class="cb-dot"></span><span class="cb-label">무엇이든 물어보세요</span><span class="cb-x" aria-hidden="true">×</span>';
  launch.setAttribute('aria-label', '상담봇 열기');

  var panel = document.createElement('section');
  panel.className = 'cb-panel'; panel.id = 'cb-panel';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '춘의역탑부동산 상담봇');
  panel.innerHTML =
    '<div class="cb-head"><img src="' + AVATAR + '" alt=""><div><b>춘의역탑부동산 상담봇</b><small>자주 묻는 질문 100개 기준 자동 안내</small></div><button class="cb-close" type="button" aria-label="닫기">×</button></div>' +
    '<div class="cb-notice">자동 안내이며 법률·세무 자문이 아닙니다. 정확한 내용은 대표 공인중개사에게 확인해 주세요.</div>' +
    '<div class="cb-log" aria-live="polite"></div>' +
    '<form class="cb-form"><input type="text" placeholder="예) 전세 3억 중개보수는?" aria-label="질문 입력" maxlength="200" autocomplete="off"><button type="submit" aria-label="보내기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form>' +
    '<div class="cb-foot"><span>상담봇 답변은 참고용입니다</span><a href="' + TEL + '">☎ ' + PHONE + '</a></div>';

  document.body.appendChild(panel);
  document.body.appendChild(launch);

  var log = panel.querySelector('.cb-log'), form = panel.querySelector('.cb-form'), input = form.querySelector('input');
  var started = false;

  function scroll() { log.scrollTop = log.scrollHeight; }
  function addRow(cls, html) {
    var row = document.createElement('div');
    row.className = 'cb-row ' + cls;
    row.innerHTML = (cls === 'bot' ? '<img class="cb-av" src="' + AVATAR + '" alt="">' : '') + '<div class="cb-bubble">' + html + '</div>';
    log.appendChild(row); scroll(); return row;
  }
  function addChips(list) {
    if (!list.length) return;
    var wrap = document.createElement('div'); wrap.className = 'cb-chips';
    list.forEach(function (label) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cb-chip'; b.textContent = label;
      b.addEventListener('click', function () { ask(label); });
      wrap.appendChild(b);
    });
    log.appendChild(wrap); scroll();
  }
  var TIP = '<span class="cb-meta">정확한 내용은 대표 공인중개사 김영월에게 확인해 주세요. <a href="' + TEL + '">☎ ' + PHONE + '</a></span>';

  function reply(text) {
    var t = text.trim();
    if (/^(안녕|하이|hi|hello|반가)/i.test(t)) {
      addRow('bot', '안녕하세요! 춘의역탑부동산 상담봇입니다. 중개보수, 전세 계약, 위치, 상가·지식산업센터 등 궁금한 점을 입력해 주세요.');
      addChips(['중개보수는 얼마인가요?', '사무소 위치는 어디인가요?', '전세 계약 전에 꼭 확인할 것은 무엇인가요?']);
      return;
    }
    if (/상담원|사람|직접\s*통화|연결|전화\s*번호|연락처|번호\s*(알려|뭐)/.test(t)) {
      addRow('bot', '대표 공인중개사에게 바로 연결해 드릴게요.<br><a class="cb-link" href="' + TEL + '">☎ ' + PHONE + ' 전화하기</a><br><a class="cb-link" href="#booking">상담 예약 남기기</a>');
      return;
    }
    // 거래 종류 없이 "중개보수 얼마?"만 물은 경우: 요약 + 선택지
    var ex = expand(t);
    if (/중개보수/.test(ex) && !/전세|월세|임대|매매|아파트|상가|지식|지산|부가|카드|언제|누가|깎|할인|공동|깨지|해제|영수증|외에|따로/.test(t)) {
      addRow('bot', '<span class="cb-q">중개보수 안내</span>중개보수는 계약이 성사된 경우에만, 경기도 조례의 법정 상한 이내에서 받습니다.<br>· 주택 매매 2억~9억원 미만: 0.4%<br>· 주택 전세 1억~6억원 미만: 0.3%<br>· 상가·지식산업센터: 0.9% 이내 협의<br>거래 종류를 고르시면 자세히 알려 드릴게요.<br><a class="cb-link" href="#fee">중개보수 계산기 열기</a>' + TIP);
      addChips(['아파트 매매 중개보수는 얼마인가요?', '전세 중개보수는 얼마인가요?', '월세 중개보수는 어떻게 계산하나요?', '상가나 지식산업센터 중개보수는 얼마인가요?', '중개보수에 부가세가 붙나요?']);
      return;
    }
    var r = search(t), top = r[0];
    if (!top || top.s < 2.2) {
      addRow('bot', '죄송합니다. 질문에 맞는 답을 찾지 못했습니다. 다른 표현으로 물어보시거나 대표 공인중개사에게 직접 문의해 주세요.<br><a class="cb-link" href="' + TEL + '">☎ ' + PHONE + ' 전화하기</a>');
      addChips(['중개보수는 얼마인가요?', '상가를 얻을 때 가장 먼저 확인할 것은 무엇인가요?', '집을 내놓으려면 무엇이 필요하나요?']);
      return;
    }
    var html = '<span class="cb-q">' + esc(top.d.q) + '</span>' + fmt(top.d.a);
    if (/중개보수|요율/.test(top.d.q) || /계산/.test(t)) html += '<br><a class="cb-link" href="#fee">중개보수 계산기 열기</a>';
    if (/위치|주차|오시는|출구/.test(top.d.q)) html += '<br><a class="cb-link" href="#location">오시는 길 보기</a>';
    addRow('bot', html + TIP);
    var related = r.slice(1, 6).filter(function (x) { return x.s >= top.s * 0.55; }).slice(0, 3).map(function (x) { return x.d.q; });
    if (related.length) {
      var lab = document.createElement('div'); lab.className = 'cb-chips'; lab.style.cssText = 'font-size:12px;color:#94A3B8;padding-left:36px;margin-bottom:-6px'; lab.textContent = '관련 질문';
      log.appendChild(lab); addChips(related);
    }
  }

  function ask(text) {
    if (!text || !text.trim()) return;
    addRow('me', esc(text.trim()));
    var typing = addRow('bot', '<span class="cb-typing"><i></i><i></i><i></i></span>');
    setTimeout(function () { typing.remove(); reply(text); }, 450);
  }

  function open() {
    panel.classList.add('open'); launch.setAttribute('aria-expanded', 'true'); launch.setAttribute('aria-label', '상담봇 닫기');
    if (!started) {
      started = true;
      addRow('bot', '안녕하세요, 춘의역탑부동산입니다. 😊<br>자주 묻는 질문 100개를 바탕으로 바로 답해 드려요. 아래에서 고르시거나 질문을 입력해 주세요.');
      addChips(['중개보수는 얼마인가요?', '사무소 위치·주차', '영업시간은 언제인가요?', '전세 계약 전에 꼭 확인할 것은?', '집을 내놓으려면?', '지식산업센터는 아무나 살 수 있나요?']);
    }
    setTimeout(function () { if (window.innerWidth > 767) input.focus(); }, 200);
  }
  function close() { panel.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-label', '상담봇 열기'); launch.focus(); }

  launch.addEventListener('click', function () { panel.classList.contains('open') ? close() : open(); });
  panel.querySelector('.cb-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  log.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"]'); if (a && window.innerWidth <= 767) close(); });

  window.ChunuiBot = { open: open, close: close, search: search };
})();
