import SEED from './seed.json'
export const LS={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}},del:k=>{try{localStorage.removeItem(k)}catch{}}}
export const clone=o=>JSON.parse(JSON.stringify(o))
export const LAY=[{k:'skills',t:'Skills',on:true},{k:'projects',t:'Projects',on:true},{k:'experience',t:'Experience',on:true},{k:'education',t:'Education',on:true},{k:'certs',t:'Certifications',on:true},{k:'contact',t:'Contact',on:true}]
export const fix=d=>{d=d||clone(SEED);if(!d.layout)d.layout=clone(LAY);LAY.forEach(x=>{if(!d.layout.some(y=>y.k===x.k))d.layout.push(clone(x))});return d}
const KEY='portfolio-cv-react'
export async function load(){
  let local=null;try{local=JSON.parse(localStorage.getItem(KEY))}catch{}
  if(location.protocol!=='file:')try{const r=await fetch('/api/resume',{cache:'no-store'});if(r.ok){const d=await r.json();if(d&&d.basics)return fix(local&&(local.updated||0)>(d.updated||0)?local:d)}}catch{}
  return fix(local&&local.basics?local:clone(SEED))
}
export async function save(D,key){
  try{localStorage.setItem(KEY,JSON.stringify(D))}catch{}
  if(location.protocol==='file:')throw new Error('Local mode: saved on this device only')
  const body=JSON.stringify(D)
  if(body.length>4e6)throw new Error('Too much image data (limit ~4 MB). Remove or shrink images.')
  const r=await fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json','x-admin-key':key},body})
  const t=await r.text().catch(()=>'');let j={};try{j=JSON.parse(t)}catch{}
  if(!r.ok||!j.ok){const m=j.error||(r.status===404?'API not found (404). Use the deployed site or `vercel dev`, not `npm run dev`.':r.status===413?'Too much data (413). Remove or shrink images.':'Save failed ('+r.status+'): '+t.replace(/<[^>]*>/g,' ').trim().slice(0,120));const e=new Error(m);e.code=r.status;throw e}
  const g=await fetch('/api/resume',{cache:'no-store'}).then(x=>x.json()).catch(()=>null)
  if(!g||(g.updated||0)!==(D.updated||0))throw new Error('Saved, but could not confirm it is live. Press Save now.')
}
