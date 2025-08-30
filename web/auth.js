import { onAuth, login, logout } from './firebase.js';

const nav = document.getElementById('nav');
function renderNav(user, role){
  nav.innerHTML = !user ? `
    <a href="#/login" class="btn">دخول</a>
  ` : `
    <span class="badge">مرحبا ${user.email} (${role||'—'})</span>
    <a href="#/" class="${isActive('/') }">لوحة</a>
    <a href="#/products" class="${isActive('/products')}">العطور</a>
    <a href="#/bulk" class="${isActive('/bulk')}">استلام Bulk</a>
    <a href="#/decant" class="${isActive('/decant')}">تفريغ</a>
    <a href="#/items" class="${isActive('/items')}">الأصناف</a>
    <a href="#/dispatch" class="${isActive('/dispatch')}">صرف</a>
    <a href="#/settlements" class="${isActive('/settlements')}">تسويات</a>
    <a href="#/monthly" class="${isActive('/monthly')}">جرد شهري</a>
    <button class="btn" id="logoutBtn">خروج</button>
  `;
  const out = document.getElementById('logoutBtn');
  if(out) out.onclick = () => logout();
}
function isActive(path){ return location.hash.replace('#','') === path ? 'active' : '' }

onAuth(async (u)=>{
  const role = u?.getIdTokenResult ? (await u.getIdTokenResult())?.claims?.role : null;
  renderNav(u, role);
  window.dispatchEvent(new CustomEvent('auth-changed', { detail:{ user:u, role } }));
});

window.addEventListener('login-submit', async (e)=>{
  const {email, password} = e.detail;
  try { await login(email, password); location.hash = '#/'; } 
  catch(err){ alert('فشل الدخول: ' + err.message); }
});
