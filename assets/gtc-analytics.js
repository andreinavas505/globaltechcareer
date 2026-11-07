/* Global Tech Career — consent-aware GA4 funnel + Hotmart click attribution */
(function () {
  'use strict';
  var host = window.location.hostname;
  if (host !== 'globaltechcareer.com' && host !== 'www.globaltechcareer.com') return;
  if (window.__gtcFunnelTrackingInstalled) return;
  window.__gtcFunnelTrackingInstalled = true;

  var path = window.location.pathname.replace(/\\/+$/, '') || '/';
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

  function getClientId() {
    var match = document.cookie.match(/(?:^|; )_ga=([^;]+)/);
    if (!match) return '';
    var value = decodeURIComponent(match[1]);
    var parts = value.match(/^GA\\d+\\.\\d+\\.(\\d+\\.\\d+)$/);
    return parts ? parts[1] : '';
  }

  function makeClickId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID().replace(/-/g, '');
    }
    return 'gtc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
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
      var clickId = makeClickId();
      url.searchParams.set('sck', clickId);
      var checkoutUrl = url.href;
      link.href = checkoutUrl;

      track('click_buy_now', {
        product_name: productId,
        product_label: productLabel,
        link_url: url.origin + url.pathname,
        link_domain: url.hostname,
        currency: 'USD',
        value: 47
      });

      event.preventDefault();
      var openNewTab = link.target === '_blank';
      var popup = openNewTab ? window.open('about:blank', '_blank') : null;
      var clientId = getClientId();
      var pageParams = new URLSearchParams(window.location.search);
      var payload = {
        click_id: clickId,
        product: productId,
        client_id: clientId,
        utm_source: url.searchParams.get('utm_source') || pageParams.get('utm_source') || '',
        utm_medium: url.searchParams.get('utm_medium') || pageParams.get('utm_medium') || '',
        utm_campaign: url.searchParams.get('utm_campaign') || pageParams.get('utm_campaign') || '',
        utm_content: url.searchParams.get('utm_content') || pageParams.get('utm_content') || productId,
        landing_page: window.location.pathname + window.location.search,
        referrer: document.referrer || ''
      };

      var save = fetch('/api/checkout-click', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () { return null; });

      Promise.race([
        save,
        new Promise(function (resolve) { window.setTimeout(resolve, 350); })
      ]).then(function () {
        if (openNewTab && popup) popup.location = checkoutUrl;
        else window.location.assign(checkoutUrl);
      });
      return;
    }

    if (url && (url.hostname === 'hotmart.com' || url.hostname.endsWith('.hotmart.com')) &&
        /\\/club\\//i.test(url.pathname)) {
      track('click_free_preview', {
        product_name: productId,
        product_label: productLabel,
        link_url: url.origin + url.pathname
      });
    }
  }, true);
})();
