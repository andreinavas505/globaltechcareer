/* Global Tech Career — Hotmart checkout click tracking
 * Sends one custom GA4 event per genuine pay.hotmart.com link activation.
 * Does not change checkout URLs, block navigation, or emit purchase events.
 */
(function () {
  'use strict';

  if (window.__gtcHotmartTrackingInstalled) return;
  window.__gtcHotmartTrackingInstalled = true;

  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var playbooks = {
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

  var playbook = playbooks[path] || 'homepage';

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a[href]')
      : null;

    if (!link) return;

    var checkoutUrl;
    try {
      checkoutUrl = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    if (checkoutUrl.hostname !== 'pay.hotmart.com') return;

    if (typeof window.gtag !== 'function') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'hotmart_checkout_click',
        playbook: playbook,
        link_url: checkoutUrl.href,
        page_location: window.location.href
      });
      return;
    }

    window.gtag('event', 'hotmart_checkout_click', {
      playbook: playbook,
      link_url: checkoutUrl.href,
      page_location: window.location.href,
      link_domain: checkoutUrl.hostname
    });
  }, true);
})();
