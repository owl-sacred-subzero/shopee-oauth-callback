/* Public GitHub Pages bridge. No secrets or network requests are made here. */
(() => {
  'use strict';
  const status = document.getElementById('status');
  const fallback = document.getElementById('continue');
  const params = new URLSearchParams(window.location.search);

  // Remove short-lived authorization codes from the visible browser URL.
  // They were still delivered to GitHub Pages as part of the original HTTPS request.
  if (window.location.search) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  const allowed = ['code', 'shop_id', 'main_account_id', 'state', 'error', 'error_description'];
  if (!params.has('code') && !params.has('error')) {
    status.textContent = 'No authorization response found. Start from the local Python script.';
    return;
  }
  if (!params.has('state') || params.getAll('state').length !== 1 || !params.get('state')) {
    status.textContent = 'Missing authorization state. Restart authorization from the local Python script.';
    return;
  }
  for (const key of allowed) {
    if (params.getAll(key).length > 1) {
      status.textContent = 'Duplicate callback parameter. Restart authorization.';
      return;
    }
  }
  if (params.has('code') && !(params.has('shop_id') || params.has('main_account_id'))) {
    status.textContent = 'Missing Shopee shop/account ID. Restart authorization.';
    return;
  }
  const forwarded = new URLSearchParams();
  for (const key of allowed) {
    if (params.has(key)) forwarded.set(key, params.get(key));
  }

  // Localhost only: GitHub Pages never receives your Partner Key or tokens.
  // Change 8765 in this file if SHOPEE_PORT is changed in the Python listener.
  const destination = 'http://127.0.0.1:8765/callback?' + forwarded.toString();
  fallback.href = destination;
  fallback.style.display = 'inline';
  status.textContent = 'Returning to the local Shopee authorization listener…';
  window.location.replace(destination);
})();
