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
    form.addEventListener('submit', event => {
      const error = form.querySelector('.form-error');
      if (!form.checkValidity()) {
        event.preventDefault();
        error.textContent = 'Please complete the required fields with valid information.';
        form.querySelector(':invalid')?.focus();
      } else {
        error.textContent = '';
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
