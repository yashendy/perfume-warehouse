import { db, storage } from '../firebase.js';
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { Input, Select, FilePicker, Table } from '../ui/components.js';

export async function dispatch(){
  const reps = await getDocs(collection(db,'users'));
  const repOpts=[]; reps.forEach(d=>{ if(d.data().role==='rep') repOpts.push({value:d.id, label:d.data().name||d.id}); });

  const items = await getDocs(collection(db,'items'));
  const itemOpts=[]; items.forEach(d=> itemOpts.push({value:d.id, label:d.data().sku_code}));

  return `
    <div class="panel">
      <h3>إنشاء طلب صرف</h3>
      ${Select({label:'المندوب', id:'rep', options:repOpts})}
      ${Input({label:'الأصناف×الكمية (ITEM_ID:QTY,...)', id:'lines'})}
      ${FilePicker({label:'مستند تسليم (اختياري)', id:'pod', multiple:true})}
      <button class="btn primary" id="release">صرف</button>
    </div>

    <script type="module">
      import { db, storage } from '../firebase.js';
      import { collection, addDoc, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
      import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
      import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

      document.getElementById('release').onclick = async ()=>{
        const rep_id = document.getElementById('rep').value;
        const lines = document.getElementById('lines').value.split(',').map(x=>{ const [id,q]=x.split(':'); return {item_id:id.trim(), qty_units:Number(q)}; });

        const refOrder = await addDoc(collection(db,'dispatch_orders'), {
          rep_id, lines, status:'released', released_at: serverTimestamp(), created_at: serverTimestamp()
        });

        // ارفع المستندات (اختياري)
        const files = document.getElementById('pod').files;
        const delivery_docs=[];
        for (let f of files) {
          const p = `dispatch_orders/${refOrder.id}/delivery_docs/${Date.now()}-${f.name}`;
          const sref = ref(storage,p); await uploadBytes(sref,f,{contentType:f.type});
          const url = await getDownloadURL(sref);
          delivery_docs.push({url, storage_path:p, uploaded_at:new Date().toISOString()});
        }
        if (delivery_docs.length) await updateDoc(refOrder, { delivery_docs });

        // تحديث مخزون/عهدة
        const fn = httpsCallable(getFunctions(), 'onDispatchReleasedExec');
        await fn({ orderId: refOrder.id });

        alert('تم الصرف وتحديث العهدة');
      };
    </script>
  `;
}
