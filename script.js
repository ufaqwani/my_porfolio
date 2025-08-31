const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const yearEl = document.getElementById('year');

if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme persistence (robust across pages without toggle)
const saved = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
if (saved === 'light' || (!saved && prefersLight)) {
  root.classList.add('light');
  if (themeToggle) themeToggle.textContent = '☀';
} else {
  if (themeToggle) themeToggle.textContent = '☾';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    root.classList.toggle('light');
    const isLight = root.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '☀' : '☾';
  });
}

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', id);
      }
    }
  });
});

// AJAX Formspree submit with client-side redirect (free plan)
const contactForm = document.querySelector('form.contact-form[action^="https://formspree.io/"]');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const statusEl = contactForm.querySelector('.form-status');
    const toast = document.getElementById('toast');
    const data = new FormData(contactForm);
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (statusEl) statusEl.textContent = 'Sending…';
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        if (toast) {
          toast.textContent = 'Message sent! Redirecting…';
          toast.hidden = false;
          requestAnimationFrame(() => toast.classList.add('show'));
        }
        setTimeout(() => { window.location.href = 'success.html'; }, 800);
      } else {
        if (statusEl) statusEl.textContent = 'Could not send. Please email me directly.';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Network issue. Please try again or email me.';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
}
