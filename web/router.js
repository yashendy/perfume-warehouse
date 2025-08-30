import * as screens from './screens/index.js';

const routes = {
  '/': screens.dashboard,
  '/login': screens.dashboard, // لنموذج بسيط داخل لوحة
  '/products': screens.products,
  '/bulk': screens.bulk_lots,
  '/decant': screens.decant_jobs,
  '/items': screens.items,
  '/dispatch': screens.dispatch,
  '/settlements': screens.settlements,
  '/monthly': screens.monthly_inventory
};

function render() {
  const path = (location.hash || '#/').replace('#','');
  const screen = routes[path] || screens.dashboard;
  screen().then(html => { document.getElementById('app').innerHTML = html; });
}

window.addEventListener('hashchange', render);
window.addEventListener('auth-changed', render);
export function boot(){ render(); }
