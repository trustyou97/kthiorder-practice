// 메뉴·미션 데이터 (교육용 가상 식당 / 가격은 실습용 예시)
const OPT = {
  spicy:  { name: '맵기', required: true, type: 'radio', choices: [
            { label: '순한맛', price: 0 }, { label: '보통맛', price: 0 }, { label: '매운맛', price: 0 } ] },
  rice:   { name: '추가', type: 'check', choices: [ { label: '공기밥 추가', price: 1000 } ] },
  noodle: { name: '추가', type: 'check', choices: [ { label: '사리 추가', price: 2000 } ] },
  big:    { name: '양 선택', required: true, type: 'radio', choices: [
            { label: '보통', price: 0 }, { label: '곱빼기', price: 1000 } ] },
  temp:   { name: '온도', required: true, type: 'radio', choices: [
            { label: '따뜻하게(HOT)', price: 0 }, { label: '차갑게(ICE)', price: 500 } ] },
  steak:  { name: '굽기', required: true, type: 'radio', choices: [
            { label: '미디엄', price: 0 }, { label: '웰던(완전히 익힘)', price: 0 } ] },
  sauce:  { name: '소스', required: true, type: 'radio', choices: [
            { label: '부어서', price: 0 }, { label: '따로(찍먹)', price: 0 } ] },
  set:    { name: '세트 변경', type: 'check', choices: [ { label: '감자튀김+콜라 세트', price: 3000 } ] },
  pizzaSize: { name: '크기', required: true, type: 'radio', choices: [
            { label: '레귤러(2인)', price: 0 }, { label: '라지(3~4인)', price: 6000 } ] },
  tsSize: { name: '크기', required: true, type: 'radio', choices: [
            { label: '소(2인)', price: 0 }, { label: '중(3~4인)', price: 6000 } ] },
  topping: { name: '토핑 추가', type: 'check', choices: [
            { label: '계란 추가', price: 500 }, { label: '치즈 추가', price: 500 } ] },
};

const DRINKS = [
  { id: 'cola',  name: '콜라',   price: 2000, img: 'cola',  cat: 'drink' },
  { id: 'cider', name: '사이다', price: 2000, img: 'cider', cat: 'drink' },
];

// 인원 구분
const PARTY = { 1: { icon: '👤', label: '혼자', long: '혼자 왔어요' }, 2: { icon: '👥', label: '2인', long: '둘이 왔어요' }, 3: { icon: '👨‍👩‍👧', label: '3인', long: '셋이 왔어요' } };

/* 미션 need 형식
   { id, qty, opt: '옵션' 또는 ['옵션1','옵션2'], exact: true(추가 선택(체크형)은 opt에 적힌 것만 허용) } */
const RESTAURANTS = {
  korean: {
    name: '한식당', title: '정다운 한식당', cover: 'bibimbap', color: '#B5522B', pay: 'post',
    desc: '찌개 · 비빔밥 · 불고기',
    cats: [ { id: 'stew', name: '찌개·탕' }, { id: 'meal', name: '식사' }, { id: 'dish', name: '요리' }, { id: 'drink', name: '음료' } ],
    items: [
      { id: 'kimchi_jjigae', name: '김치찌개', price: 9000, cat: 'stew', opts: ['spicy', 'rice'], best: true },
      { id: 'doenjang_jjigae', name: '된장찌개', price: 9000, cat: 'stew', opts: ['rice'] },
      { id: 'sundubu', name: '순두부찌개', price: 9500, cat: 'stew', opts: ['spicy', 'rice'] },
      { id: 'galbitang', name: '갈비탕', price: 13000, cat: 'stew', opts: ['rice'] },
      { id: 'seolleongtang', name: '설렁탕', price: 11000, cat: 'stew', opts: ['rice'] },
      { id: 'dogani_tang', name: '도가니탕', price: 15000, cat: 'stew', opts: ['rice'] },
      { id: 'sundaeguk', name: '순대국', price: 9000, cat: 'stew', opts: ['spicy', 'rice'], best: true },
      { id: 'samgyetang', name: '삼계탕', price: 16000, cat: 'stew', best: true },
      { id: 'bibimbap', name: '돌솥비빔밥', price: 10000, cat: 'meal', best: true },
      { id: 'naengmyeon', name: '물냉면', price: 10000, cat: 'meal', opts: ['noodle'] },
      { id: 'jeyuk', name: '제육볶음', price: 10000, cat: 'meal', opts: ['spicy', 'rice'] },
      { id: 'bulgogi', name: '불고기', price: 13000, cat: 'dish' },
      { id: 'pajeon', name: '파전', price: 15000, cat: 'dish' },
      { id: 'japchae', name: '잡채', price: 12000, cat: 'dish' },
      { id: 'dotorimuk', name: '도토리묵', price: 12000, cat: 'dish' },
      ...DRINKS,
      { id: 'sikhye', name: '식혜', price: 3000, img: 'sikhye', cat: 'drink' },
    ],
    missions: [
      { people: 1, text: '순대국 1개를 "매운맛"으로 주문해 보세요.', need: [{ id: 'sundaeguk', qty: 1, opt: '매운맛' }] },
      { people: 2, text: '도가니탕 1개와 설렁탕 "공기밥 추가" 1개를 주문해 보세요.', need: [{ id: 'dogani_tang', qty: 1, exact: true }, { id: 'seolleongtang', qty: 1, opt: '공기밥 추가' }] },
      { people: 3, text: '순대국 "보통맛" 2개, 도토리묵 1개, 파전 1개를 주문해 보세요.', need: [{ id: 'sundaeguk', qty: 2, opt: '보통맛' }, { id: 'dotorimuk', qty: 1 }, { id: 'pajeon', qty: 1 }] },
      { people: 1, text: '김치찌개 1개를 주문해 보세요. (맵기는 원하는 대로)', need: [{ id: 'kimchi_jjigae', qty: 1 }] },
      { people: 1, text: '순두부찌개를 "순한맛"으로, "공기밥 추가"해서 1개 주문해 보세요.', need: [{ id: 'sundubu', qty: 1, opt: ['순한맛', '공기밥 추가'] }] },
      { people: 1, text: '물냉면을 "사리 추가"해서 1개, 식혜 1개를 주문해 보세요.', need: [{ id: 'naengmyeon', qty: 1, opt: '사리 추가' }, { id: 'sikhye', qty: 1 }] },
      { people: 2, text: '된장찌개 2개를 주문하는데, 1개만 "공기밥 추가"해 주세요.', need: [{ id: 'doenjang_jjigae', qty: 1, opt: '공기밥 추가' }, { id: 'doenjang_jjigae', qty: 1, exact: true }] },
      { people: 2, text: '김치찌개 "매운맛" 1개, 제육볶음 "보통맛" 1개, 사이다 1개를 주문해 보세요.', need: [{ id: 'kimchi_jjigae', qty: 1, opt: '매운맛' }, { id: 'jeyuk', qty: 1, opt: '보통맛' }, { id: 'cider', qty: 1 }] },
      { people: 2, text: '불고기 1개와 돌솥비빔밥 2개, 콜라 1개를 주문해 보세요.', need: [{ id: 'bulgogi', qty: 1 }, { id: 'bibimbap', qty: 2 }, { id: 'cola', qty: 1 }] },
      { people: 3, text: '삼계탕 3개와 식혜 3개를 주문해 보세요.', need: [{ id: 'samgyetang', qty: 3 }, { id: 'sikhye', qty: 3 }] },
      { people: 3, text: '김치찌개 "순한맛" 1개, 김치찌개 "매운맛" 1개, 갈비탕 "공기밥 추가" 1개를 주문해 보세요.', need: [{ id: 'kimchi_jjigae', qty: 1, opt: '순한맛' }, { id: 'kimchi_jjigae', qty: 1, opt: '매운맛' }, { id: 'galbitang', qty: 1, opt: '공기밥 추가' }] },
      { people: 3, text: '물냉면 3개(1개만 "사리 추가")와 파전 1개를 주문해 보세요.', need: [{ id: 'naengmyeon', qty: 1, opt: '사리 추가' }, { id: 'naengmyeon', qty: 2, exact: true }, { id: 'pajeon', qty: 1 }] },
    ],
  },
  western: {
    name: '양식당', title: '하얀집 경양식', cover: 'donkatsu', color: '#7A4B2A', pay: 'post',
    desc: '돈가스 · 스파게티 · 피자',
    cats: [ { id: 'main', name: '돈가스·스테이크' }, { id: 'pasta', name: '파스타·피자' }, { id: 'meal', name: '식사' }, { id: 'drink', name: '음료' } ],
    items: [
      { id: 'donkatsu', name: '왕돈가스', price: 11000, cat: 'main', opts: ['sauce'], best: true },
      { id: 'hamburg_steak', name: '함박스테이크', price: 13000, cat: 'main' },
      { id: 'steak', name: '소고기 스테이크', price: 25000, cat: 'main', opts: ['steak'] },
      { id: 'tomato_pasta', name: '토마토 스파게티', price: 12000, cat: 'pasta' },
      { id: 'cream_pasta', name: '크림 스파게티', price: 13000, cat: 'pasta', best: true },
      { id: 'pizza', name: '마르게리타 피자', price: 18000, cat: 'pasta', opts: ['pizzaSize'] },
      { id: 'omurice', name: '오므라이스', price: 10000, cat: 'meal' },
      { id: 'burger', name: '수제버거', price: 9000, cat: 'meal', opts: ['set'] },
      ...DRINKS,
      { id: 'americano', name: '아메리카노', price: 3000, img: 'americano', cat: 'drink', opts: ['temp'] },
    ],
    missions: [
      { people: 1, text: '왕돈가스 1개를 소스 "따로(찍먹)"로 주문해 보세요.', need: [{ id: 'donkatsu', qty: 1, opt: '따로(찍먹)' }] },
      { people: 1, text: '수제버거 1개를 "감자튀김+콜라 세트"로 바꿔서 주문해 보세요.', need: [{ id: 'burger', qty: 1, opt: '감자튀김+콜라 세트' }] },
      { people: 1, text: '오므라이스 1개와 아메리카노 "따뜻하게(HOT)" 1잔을 주문해 보세요.', need: [{ id: 'omurice', qty: 1 }, { id: 'americano', qty: 1, opt: '따뜻하게(HOT)' }] },
      { people: 2, text: '크림 스파게티 1개, 토마토 스파게티 1개, 콜라 2개를 주문해 보세요.', need: [{ id: 'cream_pasta', qty: 1 }, { id: 'tomato_pasta', qty: 1 }, { id: 'cola', qty: 2 }] },
      { people: 2, text: '스테이크 2개를 주문하는데, 1개는 "미디엄", 1개는 "웰던"으로 해 주세요.', need: [{ id: 'steak', qty: 1, opt: '미디엄' }, { id: 'steak', qty: 1, opt: '웰던(완전히 익힘)' }] },
      { people: 2, text: '피자 "레귤러(2인)" 1개, 함박스테이크 1개, 사이다 2개를 주문해 보세요.', need: [{ id: 'pizza', qty: 1, opt: '레귤러(2인)' }, { id: 'hamburg_steak', qty: 1 }, { id: 'cider', qty: 2 }] },
      { people: 3, text: '왕돈가스 3개를 주문하는데, 2개는 소스 "부어서", 1개는 "따로(찍먹)"로 해 주세요.', need: [{ id: 'donkatsu', qty: 2, opt: '부어서' }, { id: 'donkatsu', qty: 1, opt: '따로(찍먹)' }] },
      { people: 3, text: '피자 "라지(3~4인)" 1개, 토마토 스파게티 1개, 아메리카노 "차갑게(ICE)" 3잔을 주문해 보세요.', need: [{ id: 'pizza', qty: 1, opt: '라지(3~4인)' }, { id: 'tomato_pasta', qty: 1 }, { id: 'americano', qty: 3, opt: '차갑게(ICE)' }] },
      { people: 3, text: '수제버거 3개(2개만 "감자튀김+콜라 세트")와 사이다 1개를 주문해 보세요.', need: [{ id: 'burger', qty: 2, opt: '감자튀김+콜라 세트' }, { id: 'burger', qty: 1, exact: true }, { id: 'cider', qty: 1 }] },
    ],
  },
  chinese: {
    name: '중식당', title: '만리장성 중화요리', cover: 'jjajangmyeon', color: '#A3202A', pay: 'post',
    desc: '짜장면 · 짬뽕 · 탕수육',
    cats: [ { id: 'noodle', name: '면' }, { id: 'rice', name: '밥' }, { id: 'dish', name: '요리' }, { id: 'drink', name: '음료' } ],
    items: [
      { id: 'jjajangmyeon', name: '짜장면', price: 7000, cat: 'noodle', opts: ['big'], best: true },
      { id: 'jjamppong', name: '짬뽕', price: 9000, cat: 'noodle', opts: ['big', 'spicy'] },
      { id: 'fried_rice', name: '볶음밥', price: 8500, cat: 'rice' },
      { id: 'japchaebap', name: '잡채밥', price: 9500, cat: 'rice' },
      { id: 'mapo_tofu', name: '마파두부밥', price: 9500, cat: 'rice' },
      { id: 'tangsuyuk', name: '탕수육', price: 18000, cat: 'dish', opts: ['tsSize', 'sauce'], best: true },
      { id: 'kkanpunggi', name: '깐풍기', price: 22000, cat: 'dish' },
      { id: 'mandu', name: '군만두', price: 6000, cat: 'dish' },
      ...DRINKS,
    ],
    missions: [
      { people: 1, text: '짜장면 "보통" 1개를 주문해 보세요.', need: [{ id: 'jjajangmyeon', qty: 1, opt: '보통' }] },
      { people: 1, text: '짬뽕 1개를 "곱빼기", "매운맛"으로 주문해 보세요.', need: [{ id: 'jjamppong', qty: 1, opt: ['곱빼기', '매운맛'] }] },
      { people: 1, text: '볶음밥 1개와 군만두 1개를 주문해 보세요.', need: [{ id: 'fried_rice', qty: 1 }, { id: 'mandu', qty: 1 }] },
      { people: 2, text: '짜장면 "곱빼기" 1개, 짬뽕 "보통"·"순한맛" 1개를 주문해 보세요.', need: [{ id: 'jjajangmyeon', qty: 1, opt: '곱빼기' }, { id: 'jjamppong', qty: 1, opt: ['보통', '순한맛'] }] },
      { people: 2, text: '짜장면 "보통" 2개와 탕수육 "소(2인)"를 소스 "따로(찍먹)"로 주문해 보세요.', need: [{ id: 'jjajangmyeon', qty: 2, opt: '보통' }, { id: 'tangsuyuk', qty: 1, opt: ['소(2인)', '따로(찍먹)'] }] },
      { people: 2, text: '잡채밥 1개, 마파두부밥 1개, 콜라 1개를 주문해 보세요.', need: [{ id: 'japchaebap', qty: 1 }, { id: 'mapo_tofu', qty: 1 }, { id: 'cola', qty: 1 }] },
      { people: 3, text: '짜장면 "보통" 2개, 짬뽕 "매운맛" 1개, 탕수육 "중(3~4인)" 소스 "부어서" 1개를 주문해 보세요.', need: [{ id: 'jjajangmyeon', qty: 2, opt: '보통' }, { id: 'jjamppong', qty: 1, opt: '매운맛' }, { id: 'tangsuyuk', qty: 1, opt: ['중(3~4인)', '부어서'] }] },
      { people: 3, text: '깐풍기 1개, 볶음밥 3개, 사이다 2개를 주문해 보세요.', need: [{ id: 'kkanpunggi', qty: 1 }, { id: 'fried_rice', qty: 3 }, { id: 'cider', qty: 2 }] },
      { people: 3, text: '짬뽕 3개를 주문하는데, 1개는 "곱빼기"·"매운맛", 2개는 "보통"·"순한맛"으로 해 주세요.', need: [{ id: 'jjamppong', qty: 1, opt: ['곱빼기', '매운맛'] }, { id: 'jjamppong', qty: 2, opt: ['보통', '순한맛'] }] },
    ],
  },
  restarea: {
    name: '휴게소', title: '행복 고속도로 휴게소', cover: 'udon', color: '#1F6E5A', pay: 'pre',
    desc: '우동 · 호두과자 · 소떡소떡',
    cats: [ { id: 'meal', name: '식사' }, { id: 'snack', name: '간식' }, { id: 'drink', name: '음료' } ],
    items: [
      { id: 'udon', name: '우동', price: 6500, cat: 'meal', opts: ['big'], best: true },
      { id: 'ramyeon', name: '라면', price: 5000, cat: 'meal', opts: ['topping'] },
      { id: 'gimbap', name: '김밥', price: 4000, cat: 'meal' },
      { id: 'donkatsu', name: '돈가스', price: 9500, cat: 'meal', opts: ['sauce'] },
      { id: 'bibimbap', name: '비빔밥', price: 9000, cat: 'meal' },
      { id: 'hodu_gwaja', name: '호두과자', price: 5000, cat: 'snack', best: true },
      { id: 'sotteok', name: '소떡소떡', price: 4000, cat: 'snack', best: true },
      { id: 'hotbar', name: '꼬치어묵', price: 3000, cat: 'snack' },
      { id: 'potato', name: '회오리감자', price: 4500, cat: 'snack' },
      { id: 'sikhye', name: '식혜', price: 3000, cat: 'drink' },
      { id: 'americano', name: '아메리카노', price: 3000, cat: 'drink', opts: ['temp'] },
      ...DRINKS,
    ],
    missions: [
      { people: 1, text: '우동 "보통" 1개를 주문하고 결제해 보세요.', need: [{ id: 'udon', qty: 1, opt: '보통' }] },
      { people: 1, text: '라면에 "계란 추가"해서 1개, 김밥 1개를 주문해 보세요.', need: [{ id: 'ramyeon', qty: 1, opt: '계란 추가', exact: true }, { id: 'gimbap', qty: 1 }] },
      { people: 1, text: '호두과자 1개와 아메리카노 "차갑게(ICE)" 1잔을 주문해 보세요.', need: [{ id: 'hodu_gwaja', qty: 1 }, { id: 'americano', qty: 1, opt: '차갑게(ICE)' }] },
      { people: 2, text: '우동 "곱빼기" 1개와 라면 "치즈 추가" 1개를 주문해 보세요.', need: [{ id: 'udon', qty: 1, opt: '곱빼기' }, { id: 'ramyeon', qty: 1, opt: '치즈 추가', exact: true }] },
      { people: 2, text: '돈가스 소스 "따로(찍먹)" 1개, 비빔밥 1개, 식혜 2개를 주문해 보세요.', need: [{ id: 'donkatsu', qty: 1, opt: '따로(찍먹)' }, { id: 'bibimbap', qty: 1 }, { id: 'sikhye', qty: 2 }] },
      { people: 2, text: '소떡소떡 2개, 꼬치어묵 2개, 아메리카노 "따뜻하게(HOT)" 2잔을 주문해 보세요.', need: [{ id: 'sotteok', qty: 2 }, { id: 'hotbar', qty: 2 }, { id: 'americano', qty: 2, opt: '따뜻하게(HOT)' }] },
      { people: 3, text: '라면 3개(1개만 "계란 추가")와 김밥 2개를 주문해 보세요.', need: [{ id: 'ramyeon', qty: 1, opt: '계란 추가', exact: true }, { id: 'ramyeon', qty: 2, exact: true }, { id: 'gimbap', qty: 2 }] },
      { people: 3, text: '우동 "보통" 2개, 돈가스 소스 "부어서" 1개, 콜라 3개를 주문해 보세요.', need: [{ id: 'udon', qty: 2, opt: '보통' }, { id: 'donkatsu', qty: 1, opt: '부어서' }, { id: 'cola', qty: 3 }] },
      { people: 3, text: '호두과자 2개, 회오리감자 1개, 소떡소떡 3개, 아메리카노 "차갑게(ICE)" 2잔을 주문해 보세요.', need: [{ id: 'hodu_gwaja', qty: 2 }, { id: 'potato', qty: 1 }, { id: 'sotteok', qty: 3 }, { id: 'americano', qty: 2, opt: '차갑게(ICE)' }] },
    ],
  },
};
