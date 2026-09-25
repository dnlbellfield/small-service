(() => {
  const doc = document;
  const year = doc.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  doc.querySelectorAll('[data-quote-cta]').forEach(link => {
    link.addEventListener('click', () => window.dataLayer?.push({ event: 'quote_cta_click' }));
  });

  const form = doc.querySelector('[data-quote-form]');
  if (form) {
    let started = false;
    form.addEventListener('focusin', () => {
      if (started) return;
      started = true;
      window.dataLayer?.push({ event: 'quote_form_start' });
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const error = form.querySelector('.form-error');
      if (!form.checkValidity()) {
        error.textContent = 'Please complete the required fields with valid information.';
        form.querySelector(':invalid')?.focus();
        return;
      }
      error.textContent = '';
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const data = new FormData(form);
        data.set('form-name', form.getAttribute('name'));
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
        if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);
        try { sessionStorage.setItem('quote-request-accepted', '1'); } catch { /* Storage may be unavailable. */ }
        window.location.assign(form.action);
      } catch {
        error.textContent = 'Your request could not be sent. Please try again.';
        submit.disabled = false;
      }
    });
  }

  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches || !('IntersectionObserver' in window)) return;
  const reveals = [...doc.querySelectorAll('.section-intro, .cards article, #how > h2, .steps > div, #about > *, #faq > h2, .faq details, .quote > div')];
  reveals.forEach(element => element.setAttribute('data-reveal', ''));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  reveals.forEach(element => observer.observe(element));
  doc.documentElement.classList.add('reveal-ready');
})();
