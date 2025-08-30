import { auth, db } from '../firebase.js';
import { collection, getCountFromServer, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { CardKPI } from '../ui/components.js';

export async function dashboard(){
  const u = auth.currentUser;
  if(!u) return loginForm();

  // إحصائيات بسيطة
  const bulkQ = query(collection(db,'bulk_lots'));
  const itemsQ = query(collection(db,'items'));
  const dispOpenQ = query(collection(db,'dispatch_orders'), where('status','==','released'));
  const [bulkCnt, itemsCnt, dispCnt] = await Promise.all([
    getCountFromServer(bulkQ), getCountFromServer(itemsQ), getCountFromServer(dispOpenQ)
  ]);

  return `
    <div class="panel">
      <div class="kpi">
        ${CardKPI({title:'لوطات Bulk', value: bulkCnt.data().count})}
        ${CardKPI({title:'أصناف (SKU)', value: itemsCnt.data().count})}
        ${CardKPI({title:'طلبات صرف مفتوحة', value: dispCnt.data().count})}
      </div>
    </div>
    <div class="panel">
      <h3 class="section-title">اختصارات سريعة</h3>
      <div class="grid cols-3">
        <a class="btn" href="#/bulk">استلام Bulk</a>
        <a class="btn" href="#/decant">أمر تفريغ</a>
        <a class="btn" href="#/dispatch">صرف للمندوب</a>
      </div>
    </div>
  `;
}

function loginForm(){
  return `
    <div class="panel">
      <h3>تسجيل الدخول</h3>
      <label>البريد</label><input id="email" class="input" type="email">
      <label>كلمة المرور</label><input id="pass" class="input" type="password">
      <button class="btn primary" id="doLogin">دخول</button>
    </div>
    <script>
      document.getElementById('doLogin').onclick = ()=>{
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;
        window.dispatchEvent(new CustomEvent('login-submit', {detail:{email,password}}));
      };
    </script>
  `;
}
