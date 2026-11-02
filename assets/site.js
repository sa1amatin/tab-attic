(function () {
  var cfg = window.TA_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var lang = document.documentElement.lang === 'ru' ? 'ru' : 'en';
  var rootPrefix = document.documentElement.dataset.root || '';

  // Russian-speaking visitors landing on the English home page go to /ru/, once.
  try {
    if (document.body.dataset.page === 'home' && lang === 'en' && !localStorage.getItem('ta-lang') &&
        /^ru\b/i.test(navigator.language || '') && !/[?&]lang=en/.test(location.search)) {
      localStorage.setItem('ta-lang', 'ru');
      location.replace(rootPrefix + 'ru/');
      return;
    }
  } catch (e) { /* storage blocked */ }
  document.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('ta-lang', a.dataset.setlang); } catch (e) { /* ignore */ }
    });
  });

  // Cookie-free page view counting (Cloudflare Web Analytics).
  if (cfg.cfToken) {
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: cfg.cfToken }));
    document.head.appendChild(s);
  }

  document.querySelectorAll('a[data-store]').forEach(function (a) {
    if (cfg.storeUrl) a.href = cfg.storeUrl;
  });

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var from = form.querySelector('input[name=from]');
    if (from) from.value = params.get('from') || document.referrer.split('/')[2] || 'direct';
    var ver = form.querySelector('input[name=version]');
    if (ver) ver.value = params.get('v') || '';
    var status = form.querySelector('[data-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      if (!cfg.formEndpoint) {
        status.textContent = status.dataset.notConnected;
        return;
      }
      btn.disabled = true;
      status.textContent = '';
      fetch(cfg.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          location.href = form.dataset.next;
        })
        .catch(function () {
          btn.disabled = false;
          status.textContent = status.dataset.failed;
        });
    });
  });

  // "Other" reason reveals its text field.
  document.querySelectorAll('input[data-reveal]').forEach(function (inp) {
    var target = document.getElementById(inp.dataset.reveal);
    var group = document.querySelectorAll('input[name="' + inp.name + '"]');
    group.forEach(function (g) {
      g.addEventListener('change', function () { target.hidden = !inp.checked; });
    });
  });
})();
