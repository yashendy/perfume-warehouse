export function Input({label, id, type='text', value='', attrs=''}) {
  return `<label for="${id}">${label}</label><input id="${id}" class="input" type="${type}" value="${value}" ${attrs}/>`;
}
export function Select({label,id,options=[],value=''}) {
  const opts = options.map(o=>`<option value="${o.value}" ${o.value==value?'selected':''}>${o.label}</option>`).join('');
  return `<label for="${id}">${label}</label><select id="${id}" class="select">${opts}</select>`;
}
export function FilePicker({label,id,accept="image/*",multiple=false}) {
  return `<label for="${id}">${label}</label><input id="${id}" class="file" type="file" accept="${accept}" ${multiple?'multiple':''}/>`;
}
export function Table({cols=[],rows=[]}) {
  return `<table class="table"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')
  }</tbody></table>`;
}
export function CardKPI({title,value,sub}) {
  return `<div class="card"><div class="light">${title}</div><div style="font-size:22px;font-weight:700">${value}</div><div class="muted">${sub||''}</div></div>`;
}
