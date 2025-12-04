// Replace these hashes with new SHA-256 values when updating passwords.
const HASHES = {
  de: '559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd',
  en: 'df7e70e5021544f4834bbee64a9e3789febc4be81470df629cad6ddb03320a5c'
};

const STORAGE_KEY = 'dk_auth';
const BODY = document.body;

const setViewportUnit = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const toHex = buffer => Array.from(new Uint8Array(buffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

async function hashPassword(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

function guardPage(page) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const targetHash = page === 'de' ? HASHES.de : HASHES.en;
  if (!stored || stored !== targetHash) {
    clearAuth();
    window.location.replace('index.html');
  }
}

function handleLinkButtons() {
  document.querySelectorAll('[data-href]').forEach(btn => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('data-href');
      if (href && href !== '#') {
        window.open(href, '_blank', 'noopener');
      }
    });
  });
}

function handleLanguageSwitch() {
  document.querySelectorAll('[data-switch-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-switch-lang');
      if (lang === 'de') {
        window.location.href = 'de.html';
      } else if (lang === 'en') {
        window.location.href = 'en.html';
      }
    });
  });
}

function bindLogout() {
  const logoutBtn = document.querySelector('[data-logout]');
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', () => {
    clearAuth();
    window.location.replace('index.html');
  });
}

function togglePasswordVisibility(input, button) {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  button.setAttribute('aria-label', isPassword ? 'Passwort ausblenden' : 'Passwort anzeigen');
  button.innerHTML = isPassword
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4 20 20"/><path d="M4 20 20 4"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></svg>`;
}

function renderErrors(lines, box) {
  box.innerHTML = '';
  lines.forEach((line, index) => {
    const p = document.createElement('div');
    p.className = 'error-line';
    p.textContent = line;
    setTimeout(() => box.appendChild(p), index * 320);
  });
}

function loginFlow() {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;
  const passwordInput = document.querySelector('#password');
  const toggleButton = document.querySelector('[data-toggle-visibility]');
  const errorBox = document.querySelector('[data-error-box]');

  toggleButton?.addEventListener('click', () => togglePasswordVisibility(passwordInput, toggleButton));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.innerHTML = '';
    const value = passwordInput.value;
    if (!value) return;

    const hash = await hashPassword(value);

    if (hash === HASHES.de) {
      localStorage.setItem(STORAGE_KEY, HASHES.de);
      window.location.href = 'de.html';
      return;
    }

    if (hash === HASHES.en) {
      localStorage.setItem(STORAGE_KEY, HASHES.en);
      window.location.href = 'en.html';
      return;
    }

    renderErrors([
      'ACCESS DENIED',
      'Ah ah ah! You didn’t say the magic word!',
      'Ah ah ah! You didn’t say the magic word!',
      'Ah ah ah! You didn’t say the magic word!'
    ], errorBox);
  });
}

function init() {
  setViewportUnit();
  window.addEventListener('resize', setViewportUnit);

  const page = BODY.dataset.page;
  if (page === 'login') {
    loginFlow();
  } else if (page === 'de' || page === 'en') {
    guardPage(page);
    handleLinkButtons();
    handleLanguageSwitch();
    bindLogout();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
