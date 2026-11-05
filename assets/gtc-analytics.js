/* Global Tech Career — first-party funnel events for GA4 */
(function () {
  'use strict';
  var host = window.location.hostname;
  if (host !== 'globaltechcareer.com' && host !== 'www.globaltechcareer.com') return;
  if (window.__gtcFunnelTrackingInstalled) return;
  window.__gtcFunnelTrackingInstalled = true;
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var products = {
    '/cloud-devops': 'cloud-devops',
    '/cybersecurity-secops': 'cybersecurity-secops',
    '/ai-mlops': 'ai-mlops',
    '/data-engineering': 'data-engineering',
    '/senior-backend': 'senior-backend',
    '/engineering-leadership': 'engineering-leadership',
    '/sdet-test-automation': 'sdet-test-automation',
    '/platform-engineering': 'platform-engineering',
    '/production-sre': 'production-sre'
  };
  var product = products[path] || 'homepage';
  function track(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({
      product_name: product,
      page_path: path
    }, params || {}));
  }
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (error) { return; }
    if (url.hostname === 'pay.hotmart.com') {
      track('click_buy_now', {
        link_url: url.origin + url.pathname,
        currency: 'USD',
        value: 47
      });
    } else if ((url.hostname === 'hotmart.com' || url.hostname.endsWith('.hotmart.com')) &&
               /\/club\//i.test(url.pathname)) {
      track('click_free_preview', {
        link_url: url.origin + url.pathname
      });
    }
  }, true);
})();