import {Component,useState,useEffect,useRef} from 'react'
import {createPortal} from 'react-dom'
import SEED from './seed.json'
import css from './styles.css?inline'
import './styles.css'
import {load,save,fix,clone,LS} from './api'

const tags=s=>(s||'').split(',').map(x=>x.trim()).filter(Boolean)
const usedIn=(D,n)=>D.projects.filter(p=>tags(p.skills).some(t=>t.toLowerCase()===n.toLowerCase()))
function allSkills(D){const m=new Map();D.skills.forEach(s=>s.name&&m.set(s.name.toLowerCase(),{name:s.name,level:s.level}));D.projects.forEach(p=>tags(p.skills).forEach(t=>m.has(t.toLowerCase())||m.set(t.toLowerCase(),{name:t,level:''})));return [...m.values()].map(s=>({...s,n:usedIn(D,s.name).length})).sort((a,b)=>b.n-a.n)}
const download=(txt,name,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
const getRoute=()=>{const h=location.hash,p=location.pathname;return /^#\/?admin/.test(h)||/\/admin\/?$/.test(p)?'admin':/^#\/?resume/.test(h)||/\/resume\/?$/.test(p)?'resume':'site'}

const IC={code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',db:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',branch:'<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 8v8M18 10c0 4-6 3-12 6"/>',layers:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/>',cpu:'<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',layout:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>'}
const kind=n=>{n=(n||'').toLowerCase();return /security|jwt|auth/.test(n)?'lock':/sql|postgres|dbms|database|mongo/.test(n)?'db':/^git|github/.test(n)?'branch':/api|crud|postman/.test(n)?'link':/react|html|css|tailwind/.test(n)?'layout':/java|spring|script|python|node|c\+\+/.test(n)?'code':/operating|^os$|linux/.test(n)?'cpu':/oop|dsa|collection|exception|structure|algorithm/.test(n)?'layers':'spark'}
const Ico=({n})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:IC[kind(n)]}}/>

/* ---------- Resume sheet (screen, PDF, preview, HTML download) ---------- */
export function CV({D}){
  const b=D.basics,sk=allSkills(D);let n=0
  const Row=({t,show,children})=>{if(!show)return null;const i=n;n++;return <div className="row" key={t+i} style={{'--i':i}}><h3>{t}</h3><div>{children}</div></div>}
  const R={
  experience:{show:D.experience.length>0,children:D.experience.map((e,i)=><div className="ci" key={i}><b>{e.role}</b><span>{e.org} · {e.period}</span><p>{e.desc}</p></div>)},
  projects:{show:D.projects.length>0,children:D.projects.map((p,i)=><div className="ci" key={i}><b>{p.name}</b>{p.link&&<span>{p.link}</span>}<p>{p.desc}</p>{p.skills&&<div className="pl s">{tags(p.skills).map(t=><span key={t}>{t}</span>)}</div>}</div>)},
  skills:{show:sk.length>0,children:<div className="pl" style={{margin:0}}>{sk.map(s=><span key={s.name}>{s.name}</span>)}</div>},
  education:{show:D.education.length>0,children:D.education.map((e,i)=><div className="ci" key={i}><b>{e.school}</b><span>{e.year}</span><p className="m">{e.degree}</p></div>)},
  certs:{show:D.certs.length>0,children:D.certs.map((c,i)=><div className="ci" key={i}><b>{c.name}</b><span>{c.year}</span><p className="m">{c.issuer}</p></div>)},
  }
  const cc=[b.email,b.phone,b.location,...b.links.map(l=>(l.url||'').replace(/^https?:\/\//,''))].filter(Boolean)
  return <div className="cv">
    <div className="ch"><div><h1>{b.name}<i>.</i></h1><div className="ct">{b.title}</div><div className="cc">{cc.map((x,i)=><span key={i}>{x}</span>)}</div></div>{b.photo&&<img className="ph" src={b.photo} alt=""/>}</div>
    {Row({t:'Profile',show:!!b.summary,children:<p>{b.summary}</p>})}
    {D.layout.filter(x=>x.on&&R[x.k]).map(x=>Row({t:x.t,show:R[x.k].show,children:R[x.k].children}))}
  </div>
}
const dlResume=D=>download('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+D.basics.name+' — Resume</title><style>'+css+'body{background:#f4f4f6}.paper{max-width:794px;margin:24px auto}</style></head><body><div class="paper">'+(document.getElementById('printcv')||{innerHTML:''}).innerHTML+'</div></body></html>',(D.basics.name||'resume').replace(/\s+/g,'-')+'-Resume.html','text/html')

const Switch=({on,go})=><span className="sw">{[['site','Portfolio','#/'],['resume','Resume','#/resume']].map(([k,l,h])=><a key={k} href={h} className={on===k?'on':''} onClick={e=>{e.preventDefault();go(k)}}>{l}</a>)}</span>

/* ---------- Public site ---------- */
function Typed({list,fb}){
  const [t,setT]=useState(list[0]||fb),key=list.join('|')
  useEffect(()=>{if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const P=list.length?list:[fb];let i=0,j=0,del=false,id,dead=false;setT('')
    const tick=()=>{if(dead)return;const w=P[i%P.length];if(!del){j++;setT(w.slice(0,j));if(j>=w.length){if(P.length<2)return;del=true;id=setTimeout(tick,1700);return}id=setTimeout(tick,55)}else{j--;setT(w.slice(0,j));if(j<=0){del=false;i++;id=setTimeout(tick,300);return}id=setTimeout(tick,28)}}
    tick();return()=>{dead=true;clearTimeout(id)}},[key,fb])
  return <><span>{t}</span><span className="caret"/></>
}
function useReveal(){useEffect(()=>{if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const x=e.target,dl=parseFloat(x.style.transitionDelay)||0;x.classList.add('in');io.unobserve(x);setTimeout(()=>{x.classList.remove('rv-on','in');x.style.transitionDelay=''},1200+dl)}),{threshold:.1,rootMargin:'0px 0px -6% 0px'})
  document.querySelectorAll('.sh,.proj,.ccard,.item,.chip,.shot,section .cta,.sc>.lede,.sc>.sub').forEach(x=>{x.style.transitionDelay=Math.min([...x.parentNode.children].indexOf(x),9)*70+'ms';x.classList.add('rv-on');io.observe(x)})
  return()=>io.disconnect()},[])}
function useSpy(L){const [act,setAct]=useState('');const key=L.map(x=>x.k).join()
  useEffect(()=>{const f=()=>{const h=document.documentElement,p=document.getElementById('prog');if(p)p.style.width=(h.scrollTop/((h.scrollHeight-h.clientHeight)||1)*100)+'%';let c='';L.forEach(x=>{const e=document.getElementById('s-'+x.k);if(e&&e.getBoundingClientRect().top<160)c=x.k});setAct(c)}
    f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[key]);return act}

export function Site({D,go,toggle}){
  const b=D.basics,sk=allSkills(D),[m,setM]=useState(null)
  const has={skills:sk.length,projects:D.projects.length,experience:D.experience.length,education:D.education.length,certs:D.certs.length,contact:1}
  const L=D.layout.filter(x=>x.on&&has[x.k]),act=useSpy(L);useReveal();let n=0
  const to=id=>e=>{e.preventDefault();const el=id==='top'?document.body:document.getElementById(id);el&&el.scrollIntoView({behavior:'smooth'})}
  const S={
    skills:()=><><p className="sub" style={{margin:'-8px 0 16px'}}>Tap a skill to see where I used it.</p><div className="chips">{sk.map(s=><button key={s.name} className="chip" onClick={()=>setM({t:'sk',n:s.name})}><Ico n={s.name}/>{s.name}{s.n>0&&<small>{s.n}</small>}</button>)}</div></>,
    projects:()=>D.projects.map((p,i)=><div className="proj" key={i}><div><h3>{p.name}{p.link&&<> <a href={p.link} target="_blank" rel="noreferrer">↗</a></>}</h3><p>{p.desc}</p>{p.image&&<img className="shot" src={p.image} alt="" loading="lazy"/>}{p.learned&&<div className="learn"><i>What I learned</i>{p.learned}</div>}<div className="chips">{tags(p.skills).map(t=><span className="tag" key={t}>{t}</span>)}</div></div></div>),
    experience:()=>D.experience.map((e,i)=><div className="item" key={i}>{e.image&&<img className="lg" src={e.image} alt="" loading="lazy"/>}<b>{e.role}</b> · {e.org} <span className="sub">{e.period}</span><p>{e.desc}</p></div>),
    education:()=>D.education.map((e,i)=><div className="item" key={i}>{e.image&&<img className="lg" src={e.image} alt="" loading="lazy"/>}<b>{e.school}</b><div className="sub">{e.degree} · {e.year}</div></div>),
    certs:()=><div className="cgrid">{D.certs.map((c,i)=><div className="ccard" key={i} style={c.image?{cursor:'zoom-in'}:null} onClick={c.image?()=>setM({t:'cert',i}):undefined}>{c.image&&<img src={c.image} alt=""/>}<b>{c.name}</b><div className="sub">{c.issuer} · {c.year}{c.link&&<> <a href={c.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>↗</a></>}</div></div>)}</div>,
    contact:()=><><p className="lede" style={{marginBottom:22}}>{b.contactText||'Have an opportunity or a question? Get in touch.'}</p><div className="cta" style={{marginTop:0}}><a className="btn" href={'mailto:'+b.email}>{b.email}</a>{b.phone&&<a className="btn o" href={'tel:'+b.phone.replace(/\s/g,'')}>{b.phone}</a>}{b.links.map((l,i)=><a key={i} className="btn o" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</div></>
  }
  const learn=tags(b.learning)
  return <>
    <div id="prog"/>
    <nav><a className="logo" href="#" onClick={to('top')}>{b.name}<i>.</i></a><span className="nl">{L.map(x=><a key={x.k} href="#" className={act===x.k?'on':''} onClick={to('s-'+x.k)}>{x.t}</a>)}</span><span className="nr"><Switch on="site" go={go}/><button className="tgl" aria-label="Toggle theme" onClick={toggle}>◐</button></span></nav>
    <div className="wrap" id="top">
      <div className="hero">
        {b.photo&&<img className="hph" src={b.photo} alt=""/>}
        <div className="tagrow"><span className="eyebrow">{b.eyebrow||b.location}</span>{b.openText&&<span className="open"><i/>{b.openText}</span>}</div>
        <h1>{b.name}</h1><p className="role"><Typed list={tags(b.typed)} fb={b.title}/></p><p className="lede">{b.summary}</p>
        {learn.length>0&&<div className="learning"><small>Currently learning</small>{learn.map(t=><span className="tag" key={t}>{t}</span>)}</div>}
        <div className="cta"><a className="btn" href="#/resume" onClick={e=>{e.preventDefault();go('resume')}}>View resume</a>{b.links.map((l,i)=><a key={i} className="btn o" href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>)}<a className="btn o" href={'mailto:'+b.email}>Email</a></div>{!b.photo&&<aside className="glance"><dl>{[['Based in',b.location],['Focus',tags(b.typed).slice(1).join(' · ')],['Education',D.education[0]&&[D.education[0].school,D.education[0].degree].filter(Boolean).join(', ')],['Email',b.email&&<a href={'mailto:'+b.email}>{b.email}</a>],['Phone',b.phone&&<a href={'tel:'+b.phone.replace(/\s/g,'')}>{b.phone}</a>]].filter(r=>r[1]).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></aside>}
      </div>
      {L.map(x=><section key={x.k} id={'s-'+x.k}><h2 className="sh">{x.t}</h2><div className="sc">{S[x.k]()}</div></section>)}
      <footer><span>© {new Date().getFullYear()} {b.name}</span><a href={'mailto:'+b.email}>{b.email}</a></footer>
    </div>
    {m&&<div className="modal" onClick={()=>setM(null)}><div className="box" onClick={e=>e.stopPropagation()}>
      {m.t==='sk'?<><h3><Ico n={m.n}/>{m.n}{(allSkills(D).find(x=>x.name===m.n)||{}).level&&<span className="sub"> · {allSkills(D).find(x=>x.name===m.n).level}</span>}</h3>
        {usedIn(D,m.n).length?usedIn(D,m.n).map((p,i)=><div className="item" key={i}><b>{p.name}</b><p>{p.desc}</p>{p.learned&&<div className="learn"><i>What I learned</i>{p.learned}</div>}</div>):<p className="sub">Not used in a project yet.</p>}</>
      :<><img src={D.certs[m.i].image} style={{width:'100%',borderRadius:10}} alt=""/><h3 style={{marginTop:12}}>{D.certs[m.i].name}</h3><p className="sub">{D.certs[m.i].issuer} · {D.certs[m.i].year}</p></>}
      <button className="btn" onClick={()=>setM(null)}>Close</button></div></div>}
  </>
}

export function ResumePage({D,go,toggle}){
  return <div className="rwrap"><div className="rtop"><Switch on="resume" go={go}/><span className="nr"><button className="tgl" aria-label="Toggle theme" onClick={toggle}>◐</button><button className="btn o" onClick={()=>dlResume(D)}>Download HTML</button><button className="btn" onClick={()=>print()}>Download PDF</button></span></div><div className="paper"><CV D={D}/></div></div>
}

/* ---------- Admin ---------- */
function shrink(file,max,cb,square){const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{const c=document.createElement('canvas'),x=c.getContext('2d');if(square){const m=Math.min(img.width,img.height);c.width=c.height=max;x.fillStyle='#fff';x.fillRect(0,0,max,max);x.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,max,max)}else{const sc=Math.min(1,max/Math.max(img.width,img.height));c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height)}URL.revokeObjectURL(u);cb(c.toDataURL('image/jpeg',.82))};img.src=u}
const Field=({l,v,on,area})=><><span className="fl">{l}</span>{area?<textarea rows={area} placeholder={l} value={v||''} onChange={e=>on(e.target.value)}/>:<input placeholder={l} value={v||''} onChange={e=>on(e.target.value)}/>}</>
const ImgField=({l,v,on,square})=><div className="photo">{v&&<img className={'pth'+(square?'':' sq')} src={v} alt=""/>}<label className="btn o">{v?'Change':'Upload'} {l.toLowerCase()}<input type="file" accept="image/*" className="hide" onChange={e=>{const f=e.target.files[0];f&&shrink(f,square?320:900,on,square);e.target.value=''}}/></label><button className="btn o" onClick={()=>{const u=(prompt('Paste image URL (https://…)')||'').trim();if(/^https?:\/\//i.test(u))on(u);else if(u)alert('URL must start with http:// or https://')}}>Use URL</button>{v&&<button className="del" onClick={()=>on('')}>Remove</button>}</div>
function Group({id,title,count,open,setOpen,children}){return <details className="grp" open={open.has(id)} onToggle={e=>{const o=e.currentTarget.open;setOpen(s=>{if(s.has(id)===o)return s;const x=new Set(s);o?x.add(id):x.delete(id);return x})}}><summary>{title}{count!=null&&<small>{count}</small>}</summary>{children}</details>}
function ListGroup({id,title,note,items,fields,onChange,open,setOpen}){
  const up=(i,f,v)=>onChange(items.map((x,j)=>j===i?{...x,[f]:v}:x))
  return <Group id={id} title={title} count={items.length} open={open} setOpen={setOpen}>{note&&<small>{note}</small>}
    {items.map((it,i)=><div className="it" key={i}>{fields.map(([f,l,ty])=>ty==='img'?<ImgField key={f} l={l} v={it[f]} on={v=>up(i,f,v)}/>:<Field key={f} l={l} v={it[f]} area={ty==='a'?3:0} on={v=>up(i,f,v)}/>)}<button className="del" onClick={()=>onChange(items.filter((_,j)=>j!==i))}>Remove</button></div>)}
    <button className="btn o" onClick={()=>onChange([...items,{}])}>+ Add</button></Group>
}
const BASIC=[['name','Name'],['title','Title'],['email','Email'],['phone','Phone'],['location','Location'],['eyebrow','Intro label (small text above name)'],['contactText','Contact message'],['typed','Typing lines under name (comma separated)'],['openText','Open-to-work badge text (empty = hidden)'],['learning','Currently learning (comma separated)']]
const LISTS=[['links','Links',[['label','Label'],['url','URL']]],
['projects','Projects',[['name','Name'],['desc','Description','a'],['learned','What I learned from this project','a'],['link','Link'],['skills','Skills used (comma separated): Java, Spring Boot'],['image','Screenshot','img']]],
['skills','Extra skills',[['name','Skill'],['level','Level']],'Skills from your projects are added automatically. Add only skills not tied to a project.'],
['certs','Certifications',[['name','Name'],['issuer','Issuer'],['year','Year'],['link','Link'],['image','Certificate image','img']]],
['experience','Experience',[['role','Role'],['org','Organization'],['period','Period'],['desc','Details','a'],['image','Logo / image','img']]],
['education','Education',[['school','School'],['degree','Degree'],['year','Year / Score'],['image','Logo / image','img']]]]

export function Admin({D,setD,go}){
  const [key,setKey]=useState(()=>LS.get('k')||''),[ok,setOk]=useState(()=>!!LS.get('k'))
  const [err,setErr]=useState('');
  const [st,setSt]=useState('Saved'),[open,setOpen]=useState(()=>new Set(['basics'])),[pv,setPv]=useState(false),last=useRef(D),file=useRef()
  const upd=fn=>setD(d=>{const n=clone(d);fn(n);n.updated=Date.now();return n})
  const doSave=()=>{setSt('Saving…');save(D,key).then(()=>setSt('Saved ✓ live')).catch(e=>{if(e.code===401){LS.del('k');setKey('');setErr('Wrong admin key');setOk(false)}else setSt('⚠ '+e.message)})}
  useEffect(()=>{if(!ok||D===last.current)return;last.current=D;setSt('Saving…');const t=setTimeout(doSave,900);return()=>clearTimeout(t)},[D,ok])
  useEffect(()=>{const f=e=>{if(/Saving|⚠/.test(st)){e.preventDefault();e.returnValue=''}};addEventListener('beforeunload',f);return()=>removeEventListener('beforeunload',f)},[st])
  useEffect(()=>{document.body.classList.toggle('pvon',pv);return()=>document.body.classList.remove('pvon')},[pv])
  if(!ok)return <div style={{maxWidth:320,margin:'20vh auto',display:'grid',gap:10,padding:20}}><h3>Admin</h3>{err&&<small style={{color:'#d33'}}>{err}</small>}<input type="password" placeholder="Admin key" value={key} onChange={e=>setKey(e.target.value)} onKeyDown={e=>e.key==='Enter'&&key&&(LS.set('k',key),setOk(true))}/><button className="btn" onClick={()=>{if(key){LS.set('k',key);setOk(true)}}}>Enter</button><a href="#/" onClick={e=>{e.preventDefault();go('site')}}>← Back</a></div>
  const cnt={skills:allSkills(D).length,projects:D.projects.length,experience:D.experience.length,education:D.education.length,certs:D.certs.length,contact:1}
  const b=D.basics,setB=(k,v)=>upd(n=>{n.basics[k]=v}),setK=(k,v)=>upd(n=>{k==='links'?n.basics.links=v:n[k]=v})
  const move=(i,d)=>upd(n=>{const j=i+d;if(n.layout[j])[n.layout[i],n.layout[j]]=[n.layout[j],n.layout[i]]})
  const imp=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.basics)throw 0;setD({...fix(x),updated:Date.now()})}catch{alert('Invalid JSON file')}};r.readAsText(f);e.target.value=''}
  return <>
    <div id="bar"><a href="#/" className="btn o" style={{textDecoration:'none'}} onClick={e=>{e.preventDefault();go('site')}}>← View site</a><button className="btn o" id="pv" onClick={()=>setPv(p=>!p)}>{pv?'Edit':'Preview'}</button><button className="btn" onClick={doSave}>Save now</button><button className="btn o" onClick={()=>print()}>PDF</button><button className="btn o" onClick={()=>dlResume(D)}>HTML</button><button className="btn o" onClick={()=>download(JSON.stringify(D,null,2),'resume-backup.json','application/json')}>Export</button><button className="btn o" onClick={()=>file.current.click()}>Import</button><button className="btn o" onClick={()=>{if(confirm('Reset to the original data?'))setD({...fix(clone(SEED)),updated:Date.now()})}}>Reset</button><button className="btn o" onClick={()=>{LS.del('k');setOk(false)}}>Logout</button><span id="st">{st}</span><input ref={file} type="file" accept=".json" className="hide" onChange={imp}/></div>
    <div className="admin"><div className="edit">
      <Group id="basics" title="Basics" open={open} setOpen={setOpen}>
        {BASIC.map(([k,l])=><Field key={k} l={l} v={b[k]} on={v=>setB(k,v)}/>)}
        <Field l="Summary" v={b.summary} area={4} on={v=>setB('summary',v)}/>
        <ImgField l="Photo" square v={b.photo} on={v=>upd(n=>{n.basics.photo=v})}/>
        <div className="photo"><label>Accent colour</label><input type="color" value={b.accent||'#3b4cf0'} onChange={e=>setB('accent',e.target.value)}/><button className="del" onClick={()=>upd(n=>{delete n.basics.accent})}>Reset</button></div>
      </Group>
      <Group id="sections" title="Website sections" open={open} setOpen={setOpen}><small>Order, titles and visibility apply to the website and the resume. A section with no entries stays hidden until you add some.</small>
        {D.layout.map((x,i)=><div className="it lay" key={x.k}><label><input type="checkbox" checked={!!x.on} onChange={e=>upd(n=>{n.layout[i].on=e.target.checked})}/> show</label><input value={x.t} onChange={e=>upd(n=>{n.layout[i].t=e.target.value})}/>{!cnt[x.k]&&<small>empty</small>}<button className="del" disabled={i===0} onClick={()=>move(i,-1)}>↑</button><button className="del" disabled={i===D.layout.length-1} onClick={()=>move(i,1)}>↓</button></div>)}
      </Group>
      {LISTS.map(([k,t,f,note])=><ListGroup key={k} id={k} title={t} note={note} fields={f} items={k==='links'?b.links:D[k]} onChange={v=>setK(k,v)} open={open} setOpen={setOpen}/>)}
    </div><div className="prev"><CV D={D}/></div></div>
  </>
}

/* ---------- App shell ---------- */
export default function App(){
  const [D,setD]=useState(null),[route,setRoute]=useState(getRoute)
  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch{return 'light'}})
  useEffect(()=>{load().then(setD);const f=()=>setRoute(getRoute());addEventListener('hashchange',f);addEventListener('popstate',f);return()=>{removeEventListener('hashchange',f);removeEventListener('popstate',f)}},[])
  useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('theme',theme)}catch{}},[theme])
  const acc=D&&D.basics.accent,name=D&&D.basics.name
  useEffect(()=>{const st=document.documentElement.style;if(acc){st.setProperty('--ac',acc);st.setProperty('--acx',acc)}else{st.removeProperty('--ac');st.removeProperty('--acx')}},[acc])
  useEffect(()=>{document.body.className=route==='resume'?'rv':'';if(name)document.title=route==='admin'?'Admin':name+(route==='resume'?' — Resume':' — Portfolio')},[route,name])
  const go=v=>{try{history.pushState(null,'',(location.pathname.replace(/\/(admin|resume)\/?$/,'/')||'/')+(v==='site'?'':'#/'+v))}catch{try{location.hash=v==='site'?'#/':'#/'+v}catch{}}setRoute(v);scrollTo(0,0)}
  const toggle=()=>setTheme(t=>t==='dark'?'light':'dark')
  if(!D)return <p className="load">Loading…</p>
  return <>
    {route==='admin'?<Admin D={D} setD={setD} go={go}/>:route==='resume'?<ResumePage D={D} go={go} toggle={toggle}/>:<Site D={D} go={go} toggle={toggle}/>}
    {createPortal(<div id="printcv"><CV D={D}/></div>,document.body)}
  </>
}

export class Boundary extends Component{
  state={e:null}
  static getDerivedStateFromError(e){return {e}}
  render(){return this.state.e?<div style={{padding:24,fontFamily:'system-ui'}}><h3>Something went wrong</h3><pre style={{whiteSpace:'pre-wrap',color:'#b00'}}>{String(this.state.e&&this.state.e.stack||this.state.e)}</pre><button onClick={()=>{try{localStorage.clear()}catch{}location.reload()}}>Clear local data and reload</button></div>:this.props.children}
}
