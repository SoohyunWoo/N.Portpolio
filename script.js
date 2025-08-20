// ===== 유틸 =====
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

// ===== 년도 =====
$('#year').textContent = new Date().getFullYear();

// ===== Lucide =====
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
});

// ===== 테마(시스템 ↔ 라이트 ↔ 다크) =====
const theme = (() => {
  const KEY = 'theme';
  const getStored = () => localStorage.getItem(KEY);
  const setStored = (v) => localStorage.setItem(KEY, v);

  const apply = (mode) => {
    const root = document.documentElement;
    let resolved = mode;

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      resolved = mq.matches ? 'dark' : 'light';
    }
    root.classList.toggle('dark', resolved === 'dark');
    updateIcons(resolved);
  };

  const updateIcons = (resolved) => {
    const icon = resolved === 'dark' ? 'moon' : 'sun';
    $$('#themeBtn i,[id="themeBtnSm"] i').forEach((n) => {
      n.setAttribute('data-lucide', icon);
    });
    if (window.lucide) window.lucide.createIcons();
  };

  const init = () => {
    const stored = getStored() || 'system';
    apply(stored);

    // 시스템 변경 시 반영(시스템 모드일 때)
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => {
      const cur = getStored() || 'system';
      if (cur === 'system') apply('system');
    });

    const cycle = () => {
      const cur = getStored() || 'system';
      const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
      setStored(next);
      apply(next);
    };
    $('#themeBtn').addEventListener('click', cycle);
    $('#themeBtnSm').addEventListener('click', cycle);
  };

  return { init };
})();
theme.init();

// ===== 메인 공개 & 스크롤 =====
let revealed = false;
const headerH = () => $('header').offsetHeight || 64;

const revealMain = () => {
  if (revealed) return;
  revealed = true;
  const main = $('#main');
  main.classList.remove('opacity-0', 'pointer-events-none');
};

const smoothScrollTo = (id) => {
  const sec = document.getElementById(id);
  if (!sec) return;
  const anchor = sec.querySelector('h2, h1, h3') || sec;
  const rectTop = anchor.getBoundingClientRect().top + window.scrollY;
  const target = Math.max(0, rectTop - (headerH() + 28));
  window.scrollTo({ top: target, behavior: 'smooth' });
};

// 상단 이름 클릭 → 맨 위로
$('#brand-home').addEventListener('click', (e) => {
  e.preventDefault();
  revealed = false;
  $('#main').classList.add('opacity-0', 'pointer-events-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Get Started
$('#btnGetStarted').addEventListener('click', (e) => {
  e.preventDefault();
  revealMain();
  setTimeout(() => smoothScrollTo('profile'), 0);
});

// 네비/퀵링크
$$('.nav-link, .quick-link').forEach((a) => {
  a.classList.add('text-slate-700','dark:text-slate-200','hover:bg-slate-100/60','dark:hover:bg-slate-800/50','cursor-pointer');
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('data-target');
    revealMain();
    setTimeout(() => smoothScrollTo(id), 0);
  });
});

// ===== 페이드 인/아웃 =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      const el = en.target;
      const ratio = en.intersectionRatio;
      const showRatio = parseFloat(el.dataset.showRatio || '0.25');
      if (ratio < showRatio) el.classList.add('fade-hidden');
      else el.classList.remove('fade-hidden');
    });
  },
  { rootMargin: '0px', threshold: [...Array(11)].map((_, i) => i / 10) }
);

// Profile은 페이드 아웃 제외 → 나머지에만 적용
$$('section.fade-section').forEach((sec) => {
  if (sec.id !== 'profile') {
    sec.dataset.showRatio = '0.25';
    sec.classList.add('fade-hidden');
    io.observe(sec);
  }
});

// ===== PDF 모달 =====
const modal = $('#pdfModal');
const frame = $('#pdfFrame');
const title = $('#pdfTitle');
const closeBtn = $('#pdfClose');

const openPdf = (src, ttl) => {
  // 상대 경로 + viewer에 전달
  const url = `pdf-viewer.html?file=${encodeURIComponent(src)}`;
  frame.src = url;
  title.textContent = ttl || '문서';
  modal.classList.remove('hidden');
};
const closePdf = () => {
  modal.classList.add('hidden');
  frame.src = 'about:blank';
};

closeBtn.addEventListener('click', closePdf);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closePdf();
});

// Projects 카드 클릭 처리
$$('#projects a').forEach((card) => {
  card.addEventListener('click', (e) => {
    const embed = card.getAttribute('data-embed') === '1';
    if (embed) {
      e.preventDefault();
      const href = card.getAttribute('href');
      const name = card.querySelector('h3')?.textContent?.trim() || '문서';
      openPdf(href, name);
    }
  });
});

// ===== 폼 알림 =====
$('#contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  alert(`감사합니다, ${data.get('name')}님!\n(${data.get('email')})\n\n${data.get('message')}`);
});
