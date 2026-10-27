const U=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL
const T=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN
const KEY=process.env.ADMIN_KEY||'123'
const run=async c=>{const r=await fetch(U,{method:'POST',headers:{Authorization:`Bearer ${T}`},body:JSON.stringify(c)});const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw new Error(j.error||'Storage error '+r.status);return j}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(!U||!T)return res.status(500).json({ok:false,error:'Storage not connected (Vercel > Storage > Upstash Redis), then redeploy'})
  try{
    if(req.method==='GET'&&req.query&&req.query.check)return res.status(200).json({ok:true,storage:true,keyFromEnv:!!process.env.ADMIN_KEY})
    if(req.method==='GET'){const j=await run(['GET','resume']);return res.status(200).json(j.result?JSON.parse(j.result):null)}
    if(req.method==='POST'){
      if(req.headers['x-admin-key']!==KEY)return res.status(401).json({ok:false,error:'Wrong admin key'})
      let b=req.body
      if(typeof b==='string')try{b=JSON.parse(b)}catch{b=null}
      else if(b===undefined){try{const c=[];for await(const x of req)c.push(x);b=JSON.parse(Buffer.concat(c).toString())}catch{b=null}}
      if(!b||typeof b!=='object'||!b.basics)return res.status(400).json({ok:false,error:'Invalid data'})
      await run(['SET','resume',JSON.stringify(b)])
      return res.status(200).json({ok:true})
    }
    res.status(405).end()
  }catch(e){return res.status(500).json({ok:false,error:e.message||'Server error'})}
}
