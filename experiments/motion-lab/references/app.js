const labels = {visual:'画面',motion:'动效',cursor:'光标互动'};
const key = new URLSearchParams(location.search).has('qa') ? 'sanfen-reference-qa' : 'sanfen-reference-round-01';
let data=[], ratings={};
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try { ratings=JSON.parse(localStorage.getItem(key)||'{}'); if(!ratings||typeof ratings!=='object'||Array.isArray(ratings))ratings={}; } catch { ratings={}; }
function format(){
 const rows=data.flatMap((item,index)=>{
  const r=ratings[item.id]||{};
  if(!Object.keys(labels).some(k=>r[k]!==undefined&&r[k]!=='')&&!r.note?.trim())return [];
  return [`${String(index+1).padStart(2,'0')} ${item.name}\n${Object.entries(labels).map(([key,label])=>`${label}：${r[key]!==undefined&&r[key]!==''?r[key]+'/10':'未评'}`).join(' / ')}${r.note?.trim()?'\n感受：'+r.note.trim():''}`];
 });
 document.querySelector('#progress').textContent=`${data.length} 个参考 · 已评价 ${rows.length} 个`;
 document.querySelector('#feedback-text').value=rows.length?'真实网站参考 · 第 1 批\n\n'+rows.join('\n\n'):'还没有评价。可以只评你有感觉的几项。';
 return rows.length;
}
function save(){
 try{localStorage.setItem(key,JSON.stringify(ratings));document.querySelector('#save-status').textContent='已保存在当前浏览器；还没有发送给任何人。';}
 catch{document.querySelector('#save-status').textContent='浏览器未能保存，请复制下方评价保留。';}
 format();
}
try{
 const response=await fetch('/references/data.json');if(!response.ok)throw new Error('reference data');data=await response.json();
 document.querySelector('#references').innerHTML=data.map((item,index)=>{
 const r=ratings[item.id]||{};
 return `<article class="reference" id="${item.id}" data-id="${item.id}"><a class="preview" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="打开原站 ${escape(item.name)}"><img src="/references/previews/${item.id}.png" alt="${escape(item.name)} 原站截图" loading="lazy"><span class="fallback"><b>${escape(item.name)}</b><span>点开原站，体验实际画面与交互</span></span><span class="open">打开原站 ↗</span></a><div class="card-body"><div class="card-head"><h2><span class="number">${String(index+1).padStart(2,'0')}</span>${escape(item.name)}</h2><span class="kind">${item.kind}</span></div><p class="description">${escape(item.description)}</p><p class="try"><strong>这样体验</strong>${escape(item.try)}</p><a class="source" href="${item.source}" target="_blank" rel="noopener noreferrer">${escape(item.sourceLabel)} ↗</a><div class="scores">${Object.entries(labels).map(([key,label])=>`<label>${label}<select aria-label="${escape(item.name)} ${label}评分" data-score="${key}"><option value="">未评</option>${Array.from({length:11},(_,n)=>`<option value="${n}" ${String(r[key])===String(n)?'selected':''}>${n} / 10</option>`).join('')}</select></label>`).join('')}</div><p class="rating-guide">0 = 完全不喜欢 · 10 = 非常喜欢 · 不适用的项目留空</p><label class="comment-label" for="note-${item.id}">哪里喜欢，哪里不喜欢？</label><textarea class="comment" id="note-${item.id}" placeholder="${escape(item.question)}">${escape(r.note||'')}</textarea></div></article>`;
 }).join('');
 document.querySelectorAll('.preview img').forEach(img=>img.addEventListener('error',()=>{img.nextElementSibling.style.display='grid';img.remove();},{once:true}));
 document.querySelector('#references').addEventListener('input',event=>{
  const card=event.target.closest('[data-id]');if(!card)return;
  const r=ratings[card.dataset.id]??={};
  if(event.target.dataset.score)r[event.target.dataset.score]=event.target.value;
  if(event.target.matches('.comment'))r.note=event.target.value;
  save();
 });
 if(format())document.querySelector('#save-status').textContent='已恢复当前浏览器里的评价。';
}catch{document.querySelector('#progress').textContent='参考未加载成功，请刷新页面。';}
document.querySelector('#show-feedback').addEventListener('click',()=>document.querySelector('#feedback').scrollIntoView());
document.querySelector('#copy-feedback').addEventListener('click',async()=>{
 const textarea=document.querySelector('#feedback-text');
 try{await navigator.clipboard.writeText(textarea.value);document.querySelector('#save-status').textContent='评价已复制，可以粘贴到对话里。';}
 catch{textarea.focus();textarea.select();document.querySelector('#save-status').textContent='请按 ⌘C 或 Ctrl+C 复制选中的评价。';}
});
