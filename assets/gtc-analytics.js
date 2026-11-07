/* Global Tech Career — consent-aware GA4 funnel events */
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
  var pageProduct = products[path] || 'homepage';

  function track(name, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({
      product_name: pageProduct,
      page_path: path
    }, params || {}));
  }

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href], [data-gtc-action]') : null;
    if (!link) return;

    var card = link.closest ? link.closest('.gtc-specialty-card') : null;
    var productId = link.getAttribute('data-gtc-product') ||
      (card && card.querySelector('[data-gtc-product]') && card.querySelector('[data-gtc-product]').getAttribute('data-gtc-product')) ||
      pageProduct;
    var productLabel = card && card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : productId;
    var url;
    try { url = new URL(link.href || '', window.location.href); } catch (error) { url = null; }

    if (link.getAttribute('data-gtc-action') === 'view_product') {
      track('select_product', { product_name: productId, product_label: productLabel, link_url: url ? url.href : '' });
      return;
    }

    if (url && url.hostname === 'pay.hotmart.com') {
      track('click_buy_now', {
        product_name: productId,
        product_label: productLabel,
        link_url: url.origin + url.pathname,
        link_domain: url.hostname,
        currency: 'USD',
        value: 47
      });
    } else if (url && (url.hostname === 'hotmart.com' || url.hostname.endsWith('.hotmart.com')) &&
               /\/club\//i.test(url.pathname)) {
      track('click_free_preview', {
        product_name: productId,
        product_label: productLabel,
        link_url: url.origin + url.pathname
      });
    }
  }, true);
})();
