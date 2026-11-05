/* Global Tech Career — production-only GA4 bootstrap */
(function () {
  'use strict';
  var host = window.location.hostname;
  if (host !== 'globaltechcareer.com' && host !== 'www.globaltechcareer.com') return;
  if (window.__gtcGa4Loaded) return;
  window.__gtcGa4Loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-96MRR9EKX4', {
    send_page_view: true,
    cookie_domain: 'globaltechcareer.com'
  });
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-96MRR9EKX4';
  document.head.appendChild(script);
})();