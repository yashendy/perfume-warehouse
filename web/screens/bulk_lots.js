import { db, storage } from '../firebase.js';
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { Input, Select, FilePicker, Table } from '../ui/components.js';

export async function bulk_lots(){
  const prods = await getDocs(collection(db,'products'));
  const options = [];
  prods.forEach(d=> options.push({value:d.id, label:d.data().name}));

  const lotsSnap = await getDocs(collection(db,'bulk_lots'));
  const rows = [];
  lotsSnap.forEach(d=>{
    const x = d.data();
    rows.push([x.lot_no, x.product_id, (x.qty_ml_available||0)+' ملل', new Date(x.received_at?.toDate?.()||Date.now()).toLocaleDateString('ar')]);
  });

  return `
    <div class="panel">
      <h3>استلام Bulk</h3>
      ${Select({label:'العطر', id:'prod', options})}
      ${Input({label:'رقم اللوط', id:'lot'})}
      ${Input({label:'الكمية بالمللي', id:'qty', type:'number'})}
      ${Input({label:'تاريخ الاستلام', id:'rcv', type:'date'})}
      ${FilePicker({label:'فاتورة/صورة', id:'inv', multiple:true})}
      <button class="btn primary" id="save">حفظ</button>
    </div>
    <div class="panel">
      <h3>لوطات سابقة</h3>
      ${Table({cols:['لوط','عطر','متاح','تاريخ'], rows})}
    </div>
    <script type="module">
      import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
      import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
      import { db, storage } from '../firebase.js';

      document.getElementById('save').onclick = async ()=>{
        const product_id = document.getElementById('prod').value;
        const lot_no = document.getElementById('lot').value.trim();
        const qty_ml_total = Number(document.getElementById('qty').value);
        const received_at = new Date(document.getElementById('rcv').value || Date.now());
        if(!product_id || !lot_no || !qty_ml_total) return alert('أكمل البيانات');

        const docRef = await addDoc(collection(db,'bulk_lots'), {
          product_id, lot_no, received_at, qty_ml_total, qty_ml_available: qty_ml_total,
          unit_cost_per_ml: null, supplier: null, docs: [], created_at: serverTimestamp()
        });

        const files = document.getElementById('inv').files;
        const docs = [];
        for (let f of files) {
          const p = `bulk_lots/${docRef.id}/invoices/${Date.now()}-${f.name}`;
          const sref = ref(storage, p);
          await uploadBytes(sref, f, { contentType: f.type });
          const url = await getDownloadURL(sref);
          docs.push({ type:'invoice', url, storage_path: p, uploaded_at: new Date().toISOString() });
        }
        if (docs.length) {
          const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
          await updateDoc(doc(db, 'bulk_lots', docRef.id), { docs });
        }
        alert('تم الحفظ');
        location.reload();
      };
    </script>
  `;
}
