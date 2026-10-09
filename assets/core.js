const CFG={owner:'',repo:'',branch:'main'};
const O=CFG.owner||location.hostname.split('.')[0],R=CFG.repo||location.pathname.split('/')[1],B=CFG.branch;
const API=`https://api.github.com/repos/${O}/${R}/contents/`;
const $=s=>document.querySelector(s);
const IC={pdf:'📄',image:'🖼️',video:'🎬',text:'📝',other:'📎'};
const ext=n=>n.split('.').pop().toLowerCase();
const kind=n=>{const e=ext(n);return e=='pdf'?'pdf':/^(jpe?g|png|gif|webp|svg)$/.test(e)?'image':/^(mp4|webm|mov)$/.test(e)?'video':/^(txt|md|csv)$/.test(e)?'text':'other'};
const size=b=>b>1e6?(b/1e6).toFixed(1)+' MB':Math.ceil(b/1e3)+' KB';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let M={folders:[],files:[]},cur='',q='',AD=false;
async function loadUser(){try{M=await(await fetch('data/manifest.json?t='+Date.now())).json()}catch(e){}view()}
function view(){
 let c=[],p=cur;while(p){const x=M.folders.find(y=>y.id==p);if(!x)break;c.unshift(x);p=x.parent}
 $('#crumbs').innerHTML='<span data-f="">🏠 خانه</span>'+c.map(x=>` ‹ <span data-f="${x.id}">${esc(x.name)}</span>`).join('');
 const s=q.trim().toLowerCase();
 const fo=s?[]:M.folders.filter(x=>x.parent==cur);
 const fi=M.files.filter(x=>s?x.name.toLowerCase().includes(s):x.folder==cur);
 $('#list').innerHTML=fo.map(x=>`<div class="card fold" data-f="${x.id}"><div class="ico">📁</div><div class="name">${esc(x.name)}</div><div class="meta">${M.files.filter(y=>y.folder==x.id).length} فایل</div>${AD?`<div class="row"><button class="bad" data-df="${x.id}">حذف</button></div>`:''}</div>`).join('')
 +fi.map(x=>`<div class="card file"><div class="ico">${IC[kind(x.name)]}</div><div class="name">${esc(x.name)}</div><div class="meta">${size(x.size)} – ${x.date}</div><span class="tag ${x.dl?'y':'n'}">${x.dl?'قابل دانلود':'فقط مشاهده'}</span><div class="row"><button class="ghost" data-v="${x.id}">پیش‌نمایش</button>${x.dl?`<a class="btn" href="${x.path}" download="${esc(x.name)}">دانلود</a>`:''}${AD?`<button class="ghost" data-t="${x.id}">تغییر دسترسی</button><button class="bad" data-d="${x.id}">حذف</button>`:''}</div></div>`).join('')
 ||'<div class="empty">اینجا هنوز چیزی نیست</div>';
}
async function pv(id){
 const x=M.files.find(y=>y.id==id),k=kind(x.name);let h;
 if(k=='pdf')h=`<iframe src="${x.path}${x.dl?'':'#toolbar=0'}"></iframe>`;
 else if(k=='image')h=`<img src="${x.path}" alt="${esc(x.name)}">`;
 else if(k=='video')h=`<video src="${x.path}" controls ${x.dl?'':'controlsList="nodownload" oncontextmenu="return false"'}></video>`;
 else if(k=='text')h=`<pre>${esc(await(await fetch(x.path)).text())}</pre>`;
 else h='<p class="empty">این فرمت پیش‌نمایش ندارد.</p>';
 $('#dlg').innerHTML=`<div class="row" style="margin-bottom:10px"><b style="flex:1">${esc(x.name)}</b>${x.dl?`<a class="btn" href="${x.path}" download="${esc(x.name)}">دانلود</a>`:''}<button class="ghost" onclick="$('#dlg').close()">بستن</button></div>`+h;
 $('#dlg').showModal();
}
document.addEventListener('click',e=>{
 const v=e.target.closest('[data-v]');if(v)return pv(v.dataset.v);
 if(e.target.closest('button,a'))return;
 const f=e.target.closest('[data-f]');if(f){cur=f.dataset.f;view()}
});
