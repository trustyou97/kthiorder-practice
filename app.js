'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const won = n => n.toLocaleString('ko-KR') + '원';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const imgOf = it => `images/${it.img || it.id}.jpg`;
const narrow = () => matchMedia('(max-width:1100px)').matches;

const store = {
  get(k, d) { try { const v = localStorage.getItem('hiorder_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('hiorder_' + k, JSON.stringify(v)); } catch {} },
};

const S = {
  mode: 'mission', restKey: null, rest: null, cat: null, cart: [], orders: [],
  missionIdx: -1, done: store.get('done2', {}), big: store.get('big', false), voice: store.get('voice', true), guide: store.get('guide', true),
  modal: null, opt: null, table: 7, lastHint: '',
};

/* ── 음성 ───────────────── */
function speak(t) {
  if (!S.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t.replace(/[‘’“”]/g, ''));
  u.lang = 'ko-KR'; u.rate = 0.92;
  speechSynthesis.speak(u);
}
function toast(t, say = true) {
  $$('.toast').forEach(e => e.remove());
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = t;
  document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
  if (say) speak(t);
}

/* ── 홈 ───────────────── */
function renderHome() {
  $('#restGrid').innerHTML = Object.entries(RESTAURANTS).map(([k, r]) => `
    <button class="rest-card" data-rest="${k}">
      <div class="ph" style="background-image:url('images/${r.cover}.jpg')"></div>
      <div class="tx"><b>${r.name}</b><span>${r.desc}</span><br>
      <span class="tag">${r.pay === 'pre' ? '먼저 결제 (선불)' : '식사 후 결제 (후불)'}</span></div>
    </button>`).join('');
  applySettings();
}
function applySettings() {
  document.documentElement.classList.toggle('big', S.big);
  $('#tgBig').setAttribute('aria-pressed', S.big);
  $('#tgVoice').setAttribute('aria-pressed', S.voice);
  $('#tgGuide').setAttribute('aria-pressed', S.guide);
  $('#btnGuide').setAttribute('aria-pressed', S.guide);
  $('#missionBar').classList.toggle('noguide', !S.guide);
}
function toggleGuide() {
  S.guide = !S.guide; store.set('guide', S.guide); applySettings();
  S.lastHint = ''; updateHint();
  if (!S.guide) speak('안내를 껐어요. 미션을 보고 스스로 주문해 보세요.');
}

function startRest(key) {
  S.restKey = key; S.rest = RESTAURANTS[key]; S.cat = S.rest.cats[0].id;
  S.cart = []; S.orders = []; S.missionIdx = -1;
  if (S.mode === 'mission') showMissionList(); else enterOrder();
}
function goHome() {
  closeModal(); S.missionIdx = -1;
  $('#order').classList.add('hidden'); $('#home').classList.remove('hidden');
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function enterOrder() {
  closeModal();
  $('#home').classList.add('hidden'); $('#order').classList.remove('hidden');
  $('#placeName').textContent = S.rest.title;
  const m = mission();
  $('#placeSub').textContent = `테이블 ${S.table}번${m ? ` · ${m.people}명` : ''} · ${S.rest.pay === 'pre' ? '주문 후 바로 결제' : '식사 후 결제'}`;
  $('#missionBar').classList.toggle('hidden', !m);
  if (m) {
    const same = S.rest.missions.filter(x => x.people === m.people);
    $('#missionText').innerHTML = `<span class="pbadge">${PARTY[m.people].icon} ${PARTY[m.people].label}</span> 미션 ${same.indexOf(m) + 1}/${same.length} · ${esc(m.text)}`;
  }
  S.lastHint = '';
  renderCats(); renderGrid(); renderCart();
  if (m) speak(`${PARTY[m.people].long}. ${m.text}`);
}
const mission = () => (S.mode === 'mission' && S.missionIdx >= 0) ? S.rest.missions[S.missionIdx] : null;

/* ── 메뉴 ───────────────── */
function renderCats() {
  $('#cats').innerHTML = S.rest.cats.map(c =>
    `<button class="cat" role="tab" data-cat="${c.id}" aria-selected="${c.id === S.cat}">${c.name}</button>`).join('');
}
function renderGrid() {
  const cat = S.rest.cats.find(c => c.id === S.cat);
  $('#catTitle').textContent = cat.name;
  $('#grid').innerHTML = S.rest.items.filter(i => i.cat === S.cat).map(it => {
    const n = S.cart.filter(l => l.id === it.id).reduce((a, l) => a + l.qty, 0);
    return `<button class="item" data-item="${it.id}">
      <div class="ph" style="background-image:url('${imgOf(it)}')"></div>
      ${it.best ? '<span class="best">인기</span>' : ''}${n ? `<span class="incart">${n}개 담음</span>` : ''}
      <div class="tx"><b>${it.name}</b><span>${won(it.price)}</span></div></button>`;
  }).join('');
  $('.menu').scrollTop = 0;
}

/* ── 메뉴 상세(옵션) ───────────────── */
function openItem(id) {
  const it = S.rest.items.find(i => i.id === id);
  S.opt = { item: it, sel: {}, qty: 1 };
  (it.opts || []).forEach(k => S.opt.sel[k] = []);
  openModal('item', renderItemModal);
}
function optExtra() {
  const { item, sel } = S.opt; let x = 0;
  (item.opts || []).forEach(k => sel[k].forEach(lb => x += OPT[k].choices.find(c => c.label === lb).price));
  return x;
}
function renderItemModal() {
  const { item, sel, qty } = S.opt;
  const unit = item.price + optExtra();
  const missing = (item.opts || []).filter(k => OPT[k].required && !sel[k].length);
  return `<div class="sheet-body">
    <div class="opt-photo" style="background-image:url('${imgOf(item)}')"></div>
    <div class="opt-head"><h3>${item.name}</h3><b>${won(item.price)}</b></div>
    ${(item.opts || []).map(k => { const g = OPT[k]; return `
      <div class="opt-group" data-group="${k}"><div>${g.name}${g.required ? '<small>꼭 고르세요</small>' : '<small style="color:var(--ink-3)">원하면 고르세요</small>'}</div>
      <div class="choices">${g.choices.map(c => `<button class="choice" data-choice="${k}|${esc(c.label)}" aria-pressed="${sel[k].includes(c.label)}">${c.label}<small>${c.price ? '+' + won(c.price) : '추가 금액 없음'}</small></button>`).join('')}</div></div>`; }).join('')}
    <div class="opt-qty"><span>수량</span><div class="qty"><button id="oMinus" aria-label="빼기">−</button><em>${qty}</em><button id="oPlus" aria-label="더하기">＋</button></div></div>
    <div class="summary"><div class="sum"><span>금액</span><b>${won(unit * qty)}</b></div></div>
  </div>
  <div class="sheet-foot"><button class="btn-sub" id="mClose">닫기</button>
    <button class="btn-primary" id="mAdd" ${missing.length ? 'disabled' : ''}>${missing.length ? OPT[missing[0]].name + '을(를) 고르세요' : '장바구니 담기'}</button></div>`;
}
function addFromModal() {
  const { item, sel, qty } = S.opt;
  const opts = (item.opts || []).flatMap(k => sel[k]);
  const key = item.id + '|' + opts.join(',');
  const unit = item.price + optExtra();
  const ex = S.cart.find(l => l.key === key);
  if (ex) ex.qty += qty; else S.cart.push({ key, id: item.id, name: item.name, opts, unit, qty });
  closeModal(); renderCart(); renderGrid0();
  toast(`${item.name} ${qty}개를 장바구니에 담았어요`);
}
const renderGrid0 = () => { const st = $('.menu').scrollTop; renderGrid(); $('.menu').scrollTop = st; updateHint(); };

/* ── 장바구니 ───────────────── */
const cartCount = () => S.cart.reduce((a, l) => a + l.qty, 0);
const cartTotal = () => S.cart.reduce((a, l) => a + l.unit * l.qty, 0);
function cartLinesHTML() {
  if (!S.cart.length) return `<div class="cart-empty">장바구니가 비어 있어요.<br>메뉴 사진을 눌러 담아 보세요.</div>`;
  return S.cart.map(l => `<div class="line">
    <div class="line-top"><div><b>${l.name}</b>${l.opts.length ? `<div class="opts">${l.opts.join(' · ')}</div>` : ''}</div>
      <button class="line-del" data-del="${esc(l.key)}" aria-label="${l.name} 빼기">✕</button></div>
    <div class="line-bot"><div class="qty"><button data-minus="${esc(l.key)}" aria-label="빼기">−</button><em>${l.qty}</em><button data-plus="${esc(l.key)}" aria-label="더하기">＋</button></div>
      <span class="line-price">${won(l.unit * l.qty)}</span></div></div>`).join('');
}
function renderCart() {
  $('#cartList').innerHTML = cartLinesHTML();
  $('#cartTotal').textContent = won(cartTotal());
  $('#bbTotal').textContent = won(cartTotal());
  $('#bbCount').textContent = cartCount();
  $('#btnOrder').disabled = $('#btnOrder2').disabled = !S.cart.length;
  if (S.modal === 'cart') refreshModal();
  updateHint();
}
function changeQty(key, d) {
  const l = S.cart.find(x => x.key === key); if (!l) return;
  l.qty += d;
  if (l.qty <= 0) S.cart = S.cart.filter(x => x !== l);
  renderCart(); renderGrid0();
}
function delLine(key) {
  const l = S.cart.find(x => x.key === key);
  S.cart = S.cart.filter(x => x.key !== key); renderCart(); renderGrid0();
  if (l) toast(`${l.name}을(를) 뺐어요`);
}
function renderCartSheet() {
  return `<div class="sheet-body"><h3>장바구니</h3><div id="sheetList">${cartLinesHTML()}</div>
    <div class="summary"><div class="sum"><span>합계</span><b>${won(cartTotal())}</b></div></div></div>
    <div class="sheet-foot"><button class="btn-sub" id="mClose">메뉴 더 보기</button>
    <button class="btn-primary" id="sOrder" ${S.cart.length ? '' : 'disabled'}>주문하기</button></div>`;
}

/* ── 주문 ───────────────── */
function openConfirm() {
  if (!S.cart.length) return;
  openModal('confirm', () => `<div class="sheet-body"><h3>이대로 주문할까요?</h3>
    <p class="lead">메뉴와 수량이 맞는지 확인하세요.</p>
    <div class="summary">${S.cart.map(l => `<div><span>${l.name}${l.opts.length ? ` (${l.opts.join(', ')})` : ''} × ${l.qty}</span><span>${won(l.unit * l.qty)}</span></div>`).join('')}
    <div class="sum"><span>합계</span><b>${won(cartTotal())}</b></div></div></div>
    <div class="sheet-foot"><button class="btn-sub" id="mClose">취소</button>
    <button class="btn-primary" id="mConfirm">${S.rest.pay === 'pre' ? '결제하고 주문하기' : '주문하기'}</button></div>`);
  speak('이대로 주문할까요? 메뉴와 수량을 확인하세요.');
}
function confirmOrder() {
  if (S.rest.pay === 'pre') startPay(cartTotal(), no => placeOrder(no));
  else placeOrder();
}
function placeOrder(orderNo) {
  const lines = S.cart.map(l => ({ ...l }));
  const total = cartTotal();
  S.orders.push({ time: new Date(), lines, total, paid: !!orderNo });
  S.cart = []; renderCart(); renderGrid0();
  const m = mission();
  if (m) return missionResult(m, lines, orderNo);
  openModal('done', () => doneHTML(orderNo, '주문이 완료되었어요!'));
  speak(orderNo ? `결제와 주문이 완료되었어요. 주문번호는 ${orderNo}번입니다.` : '주문이 완료되었어요. 음식이 곧 나옵니다.');
}
function doneHTML(orderNo, title, extra = '') {
  return `<div class="sheet-body center"><div class="big-icon">${orderNo ? '🧾' : '🍽️'}</div><h3>${title}</h3>
    ${orderNo ? `<p class="lead">주문번호</p><div class="order-no">${orderNo}</div><p class="lead">화면에 번호가 나오면 음식을 받아 가세요.<br>영수증의 번호를 꼭 확인하세요.</p>`
      : `<p class="lead">음식이 준비되면 자리로 가져다 드려요.<br>계산은 식사 후 카운터 또는 ‘주문내역’에서 할 수 있어요.</p>`}${extra}</div>
    <div class="sheet-foot one">${extra ? '' : '<button class="btn-primary" id="mClose">확인</button>'}</div>`;
}

/* ── 미션 ───────────────── */
const optList = n => n.opt == null ? [] : [].concat(n.opt);
const CHECK_LABELS = new Set(Object.values(OPT).filter(g => g.type === 'check').flatMap(g => g.choices.map(c => c.label)));
const matches = (l, n) => l.id === n.id && optList(n).every(o => l.opts.includes(o))
  && (!n.exact || l.opts.filter(o => CHECK_LABELS.has(o)).every(o => optList(n).includes(o)));
const haveQty = n => S.cart.filter(l => matches(l, n)).reduce((a, l) => a + l.qty, 0);
function evalLines(m, lines) {
  const extra = lines.filter(l => !m.need.some(n => matches(l, n)));
  const status = m.need.map(n => ({ n, have: lines.filter(l => matches(l, n)).reduce((a, l) => a + l.qty, 0) }));
  return { extra, status, ok: !extra.length && status.every(s => s.have === s.n.qty) };
}
const needName = n => S.rest.items.find(i => i.id === n.id).name + (optList(n).length ? `(${optList(n).join(', ')})` : '') + (n.exact && !optList(n).some(o => CHECK_LABELS.has(o)) ? '(추가 없이)' : '');
function missionResult(m, lines, orderNo) {
  const r = evalLines(m, lines);
  if (r.ok) {
    (S.done[S.restKey] ||= []); if (!S.done[S.restKey].includes(S.missionIdx)) S.done[S.restKey].push(S.missionIdx);
    store.set('done2', S.done);
    const last = S.missionIdx >= S.rest.missions.length - 1;
    openModal('success', () => `<div class="sheet-body center"><div class="big-icon">🎉</div><h3>참 잘하셨어요!</h3>
      <p class="lead">${PARTY[m.people].label} 주문 미션을 성공했어요.${orderNo ? `<br>주문번호 <b style="color:var(--kt-red)">${orderNo}</b>번` : ''}</p></div>
      <div class="sheet-foot"><button class="btn-sub" id="mList">미션 목록</button>
      <button class="btn-primary" id="${last ? 'mHome' : 'mNext'}">${last ? '다른 식당 연습하기' : '다음 미션 하기'}</button></div>`);
    speak('참 잘하셨어요! 미션을 성공했어요.');
  } else {
    const msgs = [];
    r.status.filter(s => s.have !== s.n.qty).forEach(s => msgs.push(`${needName(s.n)}: ${s.n.qty}개가 필요한데 ${s.have}개 주문했어요`));
    r.extra.forEach(l => msgs.push(`${l.name}${l.opts.length ? `(${l.opts.join(', ')})` : ''}은(는) 미션에 없는 메뉴예요`));
    openModal('fail', () => `<div class="sheet-body"><div class="big-icon">🤔</div><h3 class="center">조금 달라요</h3>
      <p class="lead center">괜찮아요! 다시 한번 해 봐요.</p><div class="summary">${msgs.map(t => `<div><span>• ${t}</span></div>`).join('')}</div></div>
      <div class="sheet-foot one"><button class="btn-primary" id="mRetry">다시 해보기</button></div>`);
    speak('조금 달라요. 괜찮아요, 다시 한번 해 봐요.');
  }
}
function showMissionList() {
  if (S.missionIdx >= 0) S.party = S.rest.missions[S.missionIdx].people;
  S.party ||= 1;
  openModal('missions', () => {
    const done = S.done[S.restKey] || [];
    const list = S.rest.missions.map((m, i) => [m, i]).filter(([m]) => m.people === S.party);
    return `<div class="sheet-body"><h3>${S.rest.name} 미션</h3><p class="lead">먼저 <b>몇 명이 왔는지</b> 고르고, 하고 싶은 미션을 누르세요.</p>
    <div class="party-tabs">${Object.entries(PARTY).map(([k, p]) => {
      const all = S.rest.missions.map((m, i) => [m, i]).filter(([m]) => m.people === +k);
      const ok = all.filter(([, i]) => done.includes(i)).length;
      return `<button data-party="${k}" aria-pressed="${+k === S.party}"><span>${p.icon}</span>${p.label}<small>${ok}/${all.length} 성공</small></button>`; }).join('')}</div>
    <div class="party-head">${PARTY[S.party].icon} ${PARTY[S.party].long} · 테이블에 ${S.party}명</div>
    <div class="mission-list">${list.map(([m, i], n) => `<button data-mission="${i}" class="${done.includes(i) ? 'done' : ''}"><i>${done.includes(i) ? '✔' : n + 1}</i>${m.text}</button>`).join('')}</div></div>
    <div class="sheet-foot"><button class="btn-sub" id="mHome">처음으로</button><button class="btn-primary" id="mFree">미션 없이 자유 연습</button></div>`;
  });
  speak('몇 명이 왔는지 고르고, 미션을 누르세요.');
}
function startMission(i) { S.missionIdx = i; S.party = S.rest.missions[i].people; S.cart = []; S.cat = S.rest.cats[0].id; enterOrder(); }

/* ── 결제 (실습) ───────────────── */
function startPay(amount, onDone) {
  S.payDone = onDone;
  openModal('pay-method', () => `<div class="sheet-body"><h3>결제 방법을 고르세요</h3><p class="lead">결제 금액 <b style="color:var(--kt-red);font-size:1.3rem">${won(amount)}</b><br>※ 연습 화면이라 실제로 돈이 나가지 않아요.</p>
    <div class="paybox"><button id="payCard"><span>💳</span>신용·체크카드</button><button id="payPhone"><span>📱</span>휴대폰 간편결제</button></div></div>
    <div class="sheet-foot one"><button class="btn-sub" id="mClose">취소</button></div>`);
  speak('결제 방법을 고르세요.');
}
function payInsert(kind) {
  const card = kind === 'card';
  openModal('pay-insert', () => `<div class="sheet-body center"><h3>${card ? '카드를 꽂아 주세요' : '휴대폰을 대 주세요'}</h3>
    <p class="lead">${card ? 'IC칩이 있는 쪽을 위로 하여<br>화면 아래 투입구에 끝까지 꽂아 주세요.' : '휴대폰 결제 화면을 켠 뒤<br>단말기 위에 휴대폰 뒷면을 대 주세요.'}</p>
    <div class="cardslot"><div class="ccard" ${card ? '' : 'style="width:4.5rem;height:7rem;left:4.2rem;background:linear-gradient(135deg,#333,#000)"'}></div><div class="slot"></div></div></div>
    <div class="sheet-foot"><button class="btn-sub" id="mClose">취소</button><button class="btn-primary" id="payInsert">${card ? '카드 꽂기 (연습)' : '휴대폰 대기 (연습)'}</button></div>`);
  speak(card ? '카드를 투입구에 꽂아 주세요.' : '휴대폰을 단말기에 대 주세요.');
}
function payProcess() {
  openModal('pay-processing', () => `<div class="sheet-body center"><h3>결제 중이에요</h3><div class="spinner"></div><p class="lead">카드를 빼지 말고 잠시만 기다려 주세요.</p></div>`);
  speak('결제 중입니다. 카드를 빼지 마세요.');
  setTimeout(() => { const f = S.payDone; S.payDone = null; f && f(100 + Math.floor(Math.random() * 900)); }, 1800);
}

/* ── 주문내역 / 직원호출 ───────────────── */
function openHistory() {
  const unpaid = S.orders.filter(o => !o.paid);
  const sum = unpaid.reduce((a, o) => a + o.total, 0);
  openModal('history', () => `<div class="sheet-body"><h3>주문내역</h3><p class="lead">테이블 ${S.table}번에서 주문한 메뉴예요.</p>
    ${S.orders.length ? S.orders.map((o, i) => `<div class="hist"><div class="hh"><span>${i + 1}번째 주문 · ${o.time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span><span>${o.paid ? '결제 완료' : '결제 전'}</span></div>
      ${o.lines.map(l => `<div class="hl"><span>${l.name} × ${l.qty}</span><span>${won(l.unit * l.qty)}</span></div>`).join('')}</div>`).join('')
      : '<div class="cart-empty">아직 주문한 메뉴가 없어요.</div>'}
    ${unpaid.length ? `<div class="summary"><div class="sum"><span>결제할 금액</span><b>${won(sum)}</b></div></div>` : ''}</div>
    <div class="sheet-foot ${unpaid.length ? '' : 'one'}"><button class="btn-sub" id="mClose">닫기</button>${unpaid.length ? '<button class="btn-primary" id="mPayTable">자리에서 결제하기</button>' : ''}</div>`);
}
function payTable() {
  const sum = S.orders.filter(o => !o.paid).reduce((a, o) => a + o.total, 0);
  startPay(sum, () => {
    S.orders.forEach(o => o.paid = true);
    openModal('done', () => `<div class="sheet-body center"><div class="big-icon">✅</div><h3>결제가 끝났어요</h3><p class="lead">맛있게 드셨나요? 카드를 꼭 챙겨 가세요.</p></div>
      <div class="sheet-foot one"><button class="btn-primary" id="mClose">확인</button></div>`);
    speak('결제가 끝났어요. 카드를 꼭 챙겨 가세요.');
  });
}
const CALLS = [['💧', '물'], ['🥢', '수저·젓가락'], ['🍽️', '앞접시'], ['🧻', '물티슈'], ['🥬', '반찬 더 주세요'], ['🙋', '직원만 호출']];
function openCall() {
  S.callSel = [];
  openModal('call', () => `<div class="sheet-body"><h3>직원 호출</h3><p class="lead">필요한 것을 모두 누른 뒤 ‘호출하기’를 누르세요.</p>
    <div class="call-grid">${CALLS.map(([e, t]) => `<button data-call="${t}" aria-pressed="${S.callSel.includes(t)}"><span>${e}</span>${t}</button>`).join('')}</div></div>
    <div class="sheet-foot"><button class="btn-sub" id="mClose">닫기</button><button class="btn-primary" id="mCall" ${S.callSel.length ? '' : 'disabled'}>호출하기</button></div>`);
}

/* ── 사진 출처 ───────────────── */
function openCredits() {
  const c = window.PHOTO_CREDITS || {};
  openModal('credits', () => `<div class="sheet-body"><h3>음식 사진 출처</h3>
    <p class="lead" style="font-size:.95rem">모든 사진은 Wikimedia Commons의 자유 이용 사진(CC0·CC BY·CC BY-SA·퍼블릭 도메인)이며, 작은 크기로 줄여 사용했습니다.</p>
    <ol class="credits">${Object.values(c).map(x => `<li><a href="${esc(x.page)}" target="_blank" rel="noopener">${esc(x.title.replace(/^File:/, ''))}</a> — ${esc(x.artist || '작자 미상')} / ${esc(x.license)}</li>`).join('')}</ol></div>
    <div class="sheet-foot one"><button class="btn-primary" id="mClose">닫기</button></div>`);
}

/* ── 모달 공통 ───────────────── */
let modalRender = null;
function openModal(type, render) {
  S.modal = type; modalRender = render;
  $('#modalRoot').innerHTML = `<div class="dim" id="dim"><div class="sheet" role="dialog" aria-modal="true">${render()}</div></div>`;
  updateHint();
}
function refreshModal() {
  if (!modalRender) return;
  const body = $('#modalRoot .sheet-body'); const st = body ? body.scrollTop : 0;
  $('#modalRoot .sheet').innerHTML = modalRender();
  const nb = $('#modalRoot .sheet-body'); if (nb) nb.scrollTop = st;
  updateHint();
}
function closeModal() { S.modal = null; modalRender = null; $('#modalRoot').innerHTML = ''; updateHint(); }

/* ── 단계별 안내 (미션) ───────────────── */
function computeHint() {
  const m = mission(); if (!m) return null;
  const k = S.modal;
  if (k === 'item') {
    const it = S.opt.item, needs = m.need.filter(n => n.id === it.id);
    if (!needs.length) return { t: `‘${it.name}’은(는) 미션에 없는 메뉴예요. ‘닫기’를 누르세요.`, s: '#mClose' };
    const need = needs.find(n => haveQty(n) < n.qty);
    if (!need) return { t: `‘${it.name}’은(는) 이미 다 담았어요. ‘닫기’를 누르세요.`, s: '#mClose' };
    const wantAll = optList(need);
    for (const key of it.opts || []) {
      const g = OPT[key], sel = S.opt.sel[key];
      const want = wantAll.filter(o => g.choices.some(c => c.label === o));
      const missing = want.find(o => !sel.includes(o));
      if (missing) return { t: `‘${missing}’을(를) 누르세요.`, s: `[data-choice="${key}|${missing}"]` };
      if (g.type === 'check' && need.exact) {
        const extra = sel.find(o => !want.includes(o));
        if (extra) return { t: `‘${extra}’은(는) 필요 없어요. 한 번 더 눌러 풀어 주세요.`, s: `[data-choice="${key}|${extra}"]` };
      }
      if (g.required && !sel.length) return { t: `‘${g.name}’ 중에서 하나를 골라 누르세요.`, s: `[data-group="${key}"] .choice` };
    }
    const left = Math.max(1, need.qty - haveQty(need));
    if (S.opt.qty < left) return { t: `‘＋’를 눌러 수량을 ${left}개로 맞추세요.`, s: '#oPlus' };
    if (S.opt.qty > left) return { t: `‘−’를 눌러 수량을 ${left}개로 맞추세요.`, s: '#oMinus' };
    return { t: '‘장바구니 담기’를 누르세요.', s: '#mAdd' };
  }
  if (k === 'confirm') return { t: `내용을 확인하고 ‘${S.rest.pay === 'pre' ? '결제하고 주문하기' : '주문하기'}’를 누르세요.`, s: '#mConfirm' };
  if (k === 'pay-method') return { t: '‘신용·체크카드’를 누르세요.', s: '#payCard' };
  if (k === 'pay-insert') return { t: '노란 테두리 버튼을 눌러 카드를 꽂아 보세요.', s: '#payInsert' };
  if (k && k !== 'cart') return k === 'pay-processing' || k === 'success' || k === 'fail' || k === 'missions' ? { t: '', s: null } : { t: '‘닫기’를 눌러 주문 화면으로 돌아가세요.', s: '#mClose' };

  const sheet = k === 'cart', scope = sheet ? '#sheetList' : '#cartList';
  const cartVisible = sheet || !narrow();
  const r = evalLines(m, S.cart);
  const fixCart = (t, sel) => cartVisible ? { t, s: `${scope} ${sel}` } : { t: '장바구니를 확인해야 해요. 아래 ‘장바구니 보기’를 누르세요.', s: '#btnCartSheet' };
  if (r.extra.length) { const l = r.extra[0]; return fixCart(`장바구니의 ‘${l.name}’${l.opts.length ? `(${l.opts.join(', ')})` : ''}은(는) 미션에 없어요. ‘✕’를 눌러 빼세요.`, `[data-del="${CSS.escape(l.key)}"]`); }
  const over = r.status.find(s => s.have > s.n.qty);
  if (over) { const l = S.cart.find(x => matches(x, over.n)); return fixCart(`‘${l.name}’이(가) 너무 많아요. ‘−’를 눌러 ${over.n.qty}개로 맞추세요.`, `[data-minus="${CSS.escape(l.key)}"]`); }
  const under = r.status.find(s => s.have < s.n.qty);
  if (under) {
    const l = S.cart.find(x => matches(x, under.n));
    if (l && cartVisible) return { t: `‘${l.name}’ 옆의 ‘＋’를 눌러 ${under.n.qty}개로 맞추세요.`, s: `${scope} [data-plus="${CSS.escape(l.key)}"]` };
    if (sheet) return { t: '‘메뉴 더 보기’를 눌러 메뉴를 더 담으세요.', s: '#mClose' };
    const it = S.rest.items.find(i => i.id === under.n.id), cat = S.rest.cats.find(c => c.id === it.cat);
    if (S.cat !== it.cat) return { t: `${narrow() && matchMedia('(max-width:700px)').matches ? '위쪽' : '왼쪽'}에서 ‘${cat.name}’을(를) 누르세요.`, s: `[data-cat="${it.cat}"]` };
    return { t: `‘${it.name}’ 사진을 누르세요.`, s: `[data-item="${it.id}"]` };
  }
  return { t: '잘하셨어요! 이제 ‘주문하기’를 누르세요.', s: sheet ? '#sOrder' : (narrow() ? '#btnOrder2' : '#btnOrder') };
}
function updateHint() {
  $$('.pulse').forEach(e => e.classList.remove('pulse'));
  if (!S.guide) { if (mission()) $('#hintText').textContent = '안내가 꺼져 있어요. 미션을 보고 스스로 주문해 보세요!'; return; }
  const h = computeHint();
  if (!h) return;
  $('#hintText').textContent = h.t || '';
  if (h.s) $$(h.s).forEach((e, i) => { e.classList.add('pulse'); if (i === 0) e.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); });
  if (h.t && h.t !== S.lastHint) { S.lastHint = h.t; setTimeout(() => { if (S.lastHint === h.t && !$('.toast')) speak(h.t); }, 400); }
}
addEventListener('resize', () => { if (!$('#order').classList.contains('hidden')) updateHint(); });

/* ── 이벤트 ───────────────── */
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) { if (e.target.id === 'dim' && !['pay-processing', 'success', 'fail'].includes(S.modal)) closeModal(); return; }
  const d = t.dataset, id = t.id;
  if (d.mode) { S.mode = d.mode; $$('.mode-card').forEach(b => b.setAttribute('aria-pressed', b === t)); speak(d.mode === 'mission' ? '미션 연습' : '자유 연습'); return; }
  if (d.rest) return startRest(d.rest);
  if (d.cat) { S.cat = d.cat; renderCats(); renderGrid(); updateHint(); return; }
  if (d.item) return openItem(d.item);
  if (d.choice) {
    const [key, label] = d.choice.split('|'); const g = OPT[key], sel = S.opt.sel[key];
    if (g.type === 'radio') S.opt.sel[key] = [label];
    else S.opt.sel[key] = sel.includes(label) ? sel.filter(x => x !== label) : [...sel, label];
    return refreshModal();
  }
  if (d.plus) return changeQty(d.plus, 1);
  if (d.minus) return changeQty(d.minus, -1);
  if (d.del) return delLine(d.del);
  if (d.mission) return startMission(+d.mission);
  if (d.party) { S.party = +d.party; refreshModal(); speak(PARTY[S.party].long); return; }
  if (d.call) { S.callSel = S.callSel.includes(d.call) ? S.callSel.filter(x => x !== d.call) : [...S.callSel, d.call]; return refreshModal(); }
  switch (id) {
    case 'tgBig': S.big = !S.big; store.set('big', S.big); applySettings(); break;
    case 'tgVoice': S.voice = !S.voice; store.set('voice', S.voice); applySettings(); if (S.voice) speak('음성 안내를 켰어요'); else speechSynthesis.cancel(); break;
    case 'tgGuide': case 'btnGuide': toggleGuide(); break;
    case 'btnCredits': openCredits(); break;
    case 'btnHome': goHome(); break;
    case 'btnHistory': openHistory(); break;
    case 'btnCall': openCall(); break;
    case 'btnSpeak': speak(($('#missionText').textContent.split('·')[1] || '') + '. ' + $('#hintText').textContent); break;
    case 'btnClear': if (S.cart.length) { S.cart = []; renderCart(); renderGrid0(); toast('장바구니를 비웠어요'); } break;
    case 'btnCartSheet': openModal('cart', renderCartSheet); break;
    case 'btnOrder': case 'btnOrder2': case 'sOrder': openConfirm(); break;
    case 'oPlus': S.opt.qty = Math.min(20, S.opt.qty + 1); refreshModal(); break;
    case 'oMinus': S.opt.qty = Math.max(1, S.opt.qty - 1); refreshModal(); break;
    case 'mAdd': addFromModal(); break;
    case 'mClose': closeModal(); break;
    case 'mConfirm': confirmOrder(); break;
    case 'payCard': payInsert('card'); break;
    case 'payPhone': payInsert('phone'); break;
    case 'payInsert': payProcess(); break;
    case 'mPayTable': payTable(); break;
    case 'mCall': { const what = S.callSel.join(', '); closeModal(); toast(`직원을 불렀어요 (${what}). 잠시만 기다려 주세요.`); break; }
    case 'mNext': startMission(S.missionIdx + 1); break;
    case 'mList': showMissionList(); break;
    case 'mRetry': closeModal(); break;
    case 'mHome': goHome(); break;
    case 'mFree': S.missionIdx = -1; enterOrder(); break;
  }
});

renderHome();
