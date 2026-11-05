/* GTC consent manager: basic consent mode; analytics script is not loaded until opt-in. */
(function(){
 'use strict';
 var KEY='gtc_cookie_consent_v1';
 function read(){try{return localStorage.getItem(KEY)}catch(e){return null}}
 function save(v){try{localStorage.setItem(KEY,v)}catch(e){}}
 function loadAnalytics(){
  if(window.__gtcAnalyticsLoaded)return;window.__gtcAnalyticsLoaded=true;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  window.gtag('js',new Date());
  window.gtag('config','G-96MRR9EKX4',{send_page_view:true,cookie_domain:'globaltechcareer.com'});
  var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-96MRR9EKX4';document.head.appendChild(s);
 }
 function apply(v){save(v);var banner=document.getElementById('gtc-cookie-banner');if(banner)banner.hidden=true;if(v==='accepted')loadAnalytics();window.dispatchEvent(new CustomEvent('gtc:consent',{detail:{analytics:v==='accepted'}}));}
 function open(){var b=document.getElementById('gtc-cookie-banner');if(b)b.hidden=false;}
 function build(){
  if(document.getElementById('gtc-cookie-banner'))return;
  var style=document.createElement('style');style.textContent='#gtc-cookie-banner{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;background:#071b31;color:#f4f8fc;padding:20px;border:1px solid #31516a;border-radius:14px;box-shadow:0 12px 45px #0005;font:14px/1.5 Inter,system-ui,sans-serif}#gtc-cookie-banner[hidden]{display:none}#gtc-cookie-banner p{margin:0 0 12px;color:#d5e2ed}#gtc-cookie-banner a{color:#75e4d2}#gtc-cookie-banner .gtc-cookie-actions{display:flex;flex-wrap:wrap;gap:9px}#gtc-cookie-banner button{border:1px solid #83a1b5;border-radius:8px;padding:9px 13px;font-weight:700;cursor:pointer;background:transparent;color:white}#gtc-cookie-banner button.primary{background:#39d9bd;color:#06233a;border-color:#39d9bd}#gtc-cookie-banner button:focus-visible{outline:3px solid #fff;outline-offset:2px}';
  document.head.appendChild(style);
  var box=document.createElement('section');box.id='gtc-cookie-banner';box.setAttribute('role','dialog');box.setAttribute('aria-label','Cookie preferences');box.setAttribute('aria-live','polite');box.hidden=true;
  box.innerHTML='<p><strong>Your privacy choices</strong><br>We use essential storage to run this site. With your permission, Google Analytics helps us understand site usage. You can accept or reject optional analytics. Read our <a href="/privacy.html">Privacy Policy</a> and <a href="/cookie-policy.html">Cookie Policy</a>.</p><div class="gtc-cookie-actions"><button type="button" class="primary" data-choice="accepted">Accept analytics</button><button type="button" data-choice="rejected">Reject analytics</button><button type="button" data-choice="custom">Customize</button></div><div id="gtc-cookie-custom" hidden style="margin-top:12px"><label><input type="checkbox" checked disabled> Essential storage (always active)</label><br><label><input id="gtc-analytics-choice" type="checkbox"> Allow Google Analytics</label><br><button type="button" data-choice="save">Save choices</button></div>';
  box.addEventListener('click',function(e){var b=e.target.closest('button[data-choice]');if(!b)return;var c=b.getAttribute('data-choice');if(c==='custom'){box.querySelector('#gtc-cookie-custom').hidden=false;return}if(c==='save'){apply(box.querySelector('#gtc-analytics-choice').checked?'accepted':'rejected');return}apply(c)});
  document.body.appendChild(box);
  if(!document.getElementById('gtc-cookie-settings')){var f=document.querySelector('footer')||document.body;var a=document.createElement('a');a.id='gtc-cookie-settings';a.href='#';a.textContent='Cookie settings';a.style.cssText='display:inline-block;margin:10px;color:inherit;text-decoration:underline;font-size:12px';a.addEventListener('click',function(e){e.preventDefault();open()});f.appendChild(a)}
  if(!read())open();else if(read()==='accepted')loadAnalytics();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
 window.gtcOpenCookieSettings=open;
})();