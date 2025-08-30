import { db } from '../firebase.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { Table } from '../ui/components.js';

export async function items(){
  const snap = await getDocs(collection(db,'items'));
  const rows=[];
  for (const d of snap.docs) {
    const x=d.data();
    rows.push([
      d.id,
      `${x.size_ml} ملل`,
      x.sku_code,
      x.barcode?.image_url ? `<img src="${x.barcode.image_url}" style="height:36px">` : '—'
    ]);
  }
  return `
    <div class="panel">
      <h3>الأصناف (SKU)</h3>
      ${Table({cols:['#','الحجم','الكود','باركود'], rows})}
    </div>
  `;
}
