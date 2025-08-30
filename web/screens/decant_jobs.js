import { db } from '../firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Input, Select, Table } from '../ui/components.js';

export async function decant_jobs(){
  const lots = await getDocs(collection(db,'bulk_lots'));
  const lotOpts = []; lots.forEach(d=> lotOpts.push({value:d.id, label: d.data().lot_no}));

  const jobsSnap = await getDocs(collection(db,'decant_jobs'));
  const rows=[]; jobsSnap.forEach(d=>{
    const x=d.data(); rows.push([d.id, x.lot_id, x.status, (x.spillage_ml||0)+' ملل']);
  });

  return `
    <div class="panel">
      <h3>إنشاء أمر تفريغ</h3>
      ${Select({label:'لوط', id:'lot', options:lotOpts})}
      ${Input({label:'الأحجام×الكمية (مثال: 30:1000,10:500)', id:'plan'})}
      <button class="btn primary" id="mk">إنشاء</button>
    </div>

    <div class="panel">
      <h3>أوامر سابقة</h3>
      ${Table({cols:['#','لوط','الحالة','فاقد'], rows})}
    </div>

    <div class="panel">
      <h3>إقفال أمر (تسجيل الناتج الفعلي)</h3>
      ${Input({label:'رقم الأمر', id:'jid'})}
      ${Input({label:'الناتج الفعلي (مثال: 30:980,10:480)', id:'actual'})}
      ${Input({label:'فاقد (ملل)', id:'sp'})}
      <button class="btn warn" id="close">إقفال وتحديث المخزون + توليد باركود</button>
    </div>

    <script type="module">
      import { db } from '../firebase.js';
      import { collection, addDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
      import { httpsCallable, getFunctions } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

      document.getElementById('mk').onclick = async ()=>{
        const lot_id = document.getElementById('lot').value;
        const planStr = document.getElementById('plan').value;
        const planned = planStr.split(',').map(x=>{ const [s,q]=x.split(':'); return {size_ml:Number(s), qty:Number(q)}; });
        const lotDoc = (await (await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")).getDoc((await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")).doc(db,'bulk_lots',lot_id))).data();
        const product_id = lotDoc.product_id;

        await addDoc(collection(db,'decant_jobs'), { product_id, lot_id, planned, actual:[], spillage_ml:0, status:'in_progress', started_at: serverTimestamp() });
        alert('تم إنشاء الأمر');
        location.reload();
      };

      document.getElementById('close').onclick = async ()=>{
        const id = document.getElementById('jid').value.trim();
        const actual = document.getElementById('actual').value.trim().split(',').map(x=>{ const [s,q]=x.split(':'); return {size_ml:Number(s), qty:Number(q)}; });
        const spillage_ml = Number(document.getElementById('sp').value||0);
        const ref = doc(db,'decant_jobs', id);
        await updateDoc(ref, { actual, spillage_ml, status:'closed', finished_at: serverTimestamp() });

        // نطلب من Functions تنفيذ إقفال الإنتاج + توليد باركود + تحديث المخزون
        const fn = httpsCallable(getFunctions(), 'onDecantJobClosedExec');
        await fn({ jobId: id });
        alert('أُقفل الأمر وتم تحديث المخزون والباركود');
      };
    </script>
  `;
}
