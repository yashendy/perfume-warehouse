import { db } from '../firebase.js';
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Input, Table } from '../ui/components.js';

export async function products(){
  const col = collection(db,'products');
  const snap = await getDocs(col);
  const rows = [];
  snap.forEach(d=> rows.push([d.data().name, d.data().brand||'-', d.data().is_active?'نعم':'لا']));
  return `
    <div class="panel">
      <h3>تعريف عطر جديد</h3>
      ${Input({label:'الاسم', id:'pname'})}
      ${Input({label:'العلامة', id:'pbrand'})}
      <button class="btn primary" id="addP">إضافة</button>
    </div>
    <div class="panel">
      <h3>العطور</h3>
      ${Table({cols:['الاسم','العلامة','نشط'], rows})}
    </div>
    <script>
      document.getElementById('addP').onclick = async ()=>{
        const name = document.getElementById('pname').value.trim();
        const brand = document.getElementById('pbrand').value.trim();
        if(!name) return alert('ادخل الاسم');
        await addDoc(${/* keep ES module refs */''} await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(m=>m.collection)(db,'products'), {name, brand, is_active:true, created_at: serverTimestamp()});
        location.reload();
      };
    </script>
  `;
}
