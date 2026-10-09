AD=true;
let T=sessionStorage.t||'',SHA='';
const msg=(t,bad)=>{const m=$('#msg');m.textContent=t;m.style.color=bad?'var(--bad)':'var(--ok)'};
const gh=(p,m='GET',b)=>fetch(API+p+(m=='GET'?'?ref='+B+'&t='+Date.now():''),{method:m,headers:{Authorization:'Bearer '+T,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:b&&JSON.stringify(b)});
async function pull(){
 const r=await gh('data/manifest.json');
 if(r.status==404){M={folders:[],files:[]};SHA='';return}
 const j=await r.json();SHA=j.sha;
 M=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\s/g,'')),c=>c.charCodeAt(0))));
}
async function push(n){
 const b=btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(M))));
 const r=await gh('data/manifest.json','PUT',{message:n,content:b,sha:SHA||undefined,branch:B});
 if(!r.ok){await pull();view();throw Error('ذخیره نشد. فهرست به‌روز شد؛ کار را دوباره انجام دهید.')}
 SHA=(await r.json()).content.sha;
}
async function login(t){
 T=t;
 const r=await fetch(`https://api.github.com/repos/${O}/${R}`,{headers:{Authorization:'Bearer '+T}});
 if(!r.ok){T='';sessionStorage.removeItem('t');alert('توکن نامعتبر است.');return}
 sessionStorage.t=T;$('#login').hidden=true;$('#app').hidden=false;$('#out').hidden=false;
 await pull();view();
}
async function up(fs){
 const dl=$('#dl').checked;let n=0;
 try{for(const f of fs){
  if(f.size>5e7){msg(f.name+' بیش از ۵۰ مگابایت است',1);continue}
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5),e=f.name.includes('.')?ext(f.name):'bin',path=`files/${id}.${e}`;
  msg('در حال آپلود '+f.name+' …');
  const b=await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.readAsDataURL(f)});
  const r=await gh(path,'PUT',{message:'add '+id,content:b,branch:B});
  if(!r.ok)throw Error('آپلود '+f.name+' ناموفق بود (دسترسی توکن را بررسی کنید)');
  M.files.push({id,name:f.name,folder:cur,path,sha:(await r.json()).content.sha,size:f.size,dl,date:new Date().toLocaleDateString('fa-IR')});
  $('#pb').style.width=(++n/fs.length*100)+'%';
 }}catch(er){msg(er.message,1)}
 if(n){try{await push('update');view();if(n==fs.length)msg('ذخیره شد ✓')}catch(er){msg(er.message,1)}}
}
$('#go').onclick=()=>login($('#tk').value.trim());
$('#out').onclick=()=>{sessionStorage.removeItem('t');location.reload()};
$('#nf').onclick=async()=>{const n=prompt('نام پوشه:');if(!n)return;try{M.folders.push({id:'f'+Date.now().toString(36),name:n.trim(),parent:cur});await push('folder');view()}catch(e){msg(e.message,1)}};
$('#pick').onchange=e=>up([...e.target.files]);
const d=$('#drop');
d.ondragover=e=>{e.preventDefault();d.classList.add('on')};
d.ondragleave=()=>d.classList.remove('on');
d.ondrop=e=>{e.preventDefault();d.classList.remove('on');up([...e.dataTransfer.files])};
$('#sn').onclick=()=>{const t=$('#nt').value.trim(),b=$('#nb').value;if(!t||!b)return msg('عنوان و متن را بنویسید',1);up([new File([b],t+'.txt',{type:'text/plain'})]);$('#nt').value=$('#nb').value=''};
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-t],[data-d],[data-df]');if(!b)return;const D=b.dataset;
 try{
  if(D.t){const x=M.files.find(y=>y.id==D.t);x.dl=!x.dl;await push('perm')}
  else if(D.d){if(!confirm('این فایل حذف شود؟'))return;const x=M.files.find(y=>y.id==D.d);await gh(x.path,'DELETE',{message:'del',sha:x.sha,branch:B});M.files=M.files.filter(y=>y!=x);await push('del')}
  else if(D.df){if(M.files.some(y=>y.folder==D.df)||M.folders.some(y=>y.parent==D.df))return msg('فقط پوشهٔ خالی حذف می‌شود',1);if(!confirm('این پوشه حذف شود؟'))return;M.folders=M.folders.filter(y=>y.id!=D.df);await push('del')}
  view();
 }catch(er){msg(er.message,1)}
});
if(T)login(T);
