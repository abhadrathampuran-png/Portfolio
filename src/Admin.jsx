import {useEffect,useState,useCallback} from 'react';import {Link} from 'react-router-dom';import {sb,asset} from './supabase';
const slugify=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function upload(folder,file){const ext=file.name.split('.').pop();const path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;
const{error}=await sb.storage.from('portfolio').upload(path,file,{cacheControl:'31536000'});if(error)throw error;return sb.storage.from('portfolio').getPublicUrl(path).data.publicUrl}
function Login(){const[e,setE]=useState('');const[p,setP]=useState('');const[m,setM]=useState('');
return <form className="wrap sec" onSubmit={async ev=>{ev.preventDefault();const{error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)setM(error.message)}}>
<h1 className="big">Admin</h1><label>Email<input type="email" value={e} onChange={x=>setE(x.target.value)}/></label><label>Password<input type="password" value={p} onChange={x=>setP(x.target.value)}/></label>
{m&&<p className="err">{m}</p>}<button className="btn">Sign in</button></form>}
function Editor({p,cats,onDone}){const[f,setF]=useState(p);const[sel,setSel]=useState(new Set((p.project_categories||[]).map(x=>x.category_id)));const[imgs,setImgs]=useState(p.project_images||[]);const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
const set=k=>e=>setF({...f,[k]:e.target.value});
async function save(){setBusy(true);setMsg('');try{const{project_categories,project_images,...row}=f;row.slug=row.slug||slugify(row.title||'');row.year=row.year?+row.year:null;
const{data,error}=row.id?await sb.from('projects').update(row).eq('id',row.id).select().single():await sb.from('projects').insert(row).select().single();if(error)throw error;
await sb.from('project_categories').delete().eq('project_id',data.id);if(sel.size)await sb.from('project_categories').insert([...sel].map(c=>({project_id:data.id,category_id:c})));setF(data);setMsg('Saved ✓')}catch(e){setMsg('Error: '+e.message)}setBusy(false)}
async function cover(e){const file=e.target.files[0];if(!file)return;setMsg('Uploading…');try{setF({...f,cover_url:await upload('thumbnails',file)});setMsg('Cover uploaded — press Save')}catch(x){setMsg('Upload failed: '+x.message)}}
async function gallery(e){if(!f.id)return setMsg('Save the project first, then add gallery images.');setMsg('Uploading…');try{for(const file of e.target.files){const url=await upload('gallery',file);const{data}=await sb.from('project_images').insert({project_id:f.id,url,sort_order:imgs.length}).select().single();setImgs(i=>[...i,data])}setMsg('Gallery updated ✓')}catch(x){setMsg('Upload failed: '+x.message)}}
const T=(k,l,rows)=><label>{l}{rows?<textarea rows={rows} value={f[k]||''} onChange={set(k)}/>:<input value={f[k]||''} onChange={set(k)}/>}</label>;
return <div className="wrap sec admin"><button className="btn ghost" onClick={onDone}>← Back</button><h2 style={{margin:'20px 0'}}>{f.id?'Edit':'New'} project</h2><div style={{display:'grid',gap:16,maxWidth:720}}>
{T('title','Title')}{T('slug','Slug (URL)')}{T('short_description','Short description',2)}{T('full_description','Full description',6)}
<div className="two">{T('year','Year')}{T('role','My role')}</div>{T('credits','Credits',2)}{T('details','Project details',2)}{T('external_url','External link (Behance, site…)')}{T('external_label','Link button label')}{T('embed_url','Embed URL (optional)')}
<fieldset><legend>Categories</legend>{cats.map(c=><label key={c.id} style={{display:'inline-flex',gap:6,marginRight:14,gridAutoFlow:'column'}}><input style={{width:'auto'}} type="checkbox" checked={sel.has(c.id)} onChange={()=>{const n=new Set(sel);n.has(c.id)?n.delete(c.id):n.add(c.id);setSel(n)}}/>{c.name}</label>)}</fieldset>
<label>Cover image{f.cover_url&&<img src={asset(f.cover_url)} style={{height:120}} alt=""/>}<input type="file" accept="image/*" onChange={cover}/></label>
<label>Gallery images<input type="file" accept="image/*" multiple onChange={gallery}/></label>
<div className="thumbs">{imgs.map(i=><div key={i.id}><img src={i.url} alt=""/><button className="chip" onClick={async()=>{await sb.from('project_images').delete().eq('id',i.id);setImgs(imgs.filter(x=>x.id!==i.id))}}>Remove</button></div>)}</div>
<label style={{gridAutoFlow:'column',justifyContent:'start',gap:8}}><input style={{width:'auto'}} type="checkbox" checked={!!f.published} onChange={e=>setF({...f,published:e.target.checked})}/>Published (unchecked = draft)</label>
<div><button className="btn" disabled={busy} onClick={save}>{busy?'Saving…':'Save'}</button>{f.slug&&<Link className="btn ghost" target="_blank" to={`/work/${f.slug}`}>Preview (published only)</Link>}</div>{msg&&<p>{msg}</p>}</div></div>}
function Settings(){const keys=['hero','about','contact'];const[v,setV]=useState({});const[m,setM]=useState('');
useEffect(()=>{sb.from('site_settings').select('*').then(({data})=>setV(Object.fromEntries((data||[]).map(r=>[r.key,JSON.stringify(r.value,null,2)]))))},[]);
return <section style={{marginTop:60}}><h2>Site content</h2><p>Edit as JSON: hero (wordmark, eyebrow, statement), about (intro, philosophy, skills[], tools[], experience[], resume_url), contact (email, instagram, behance, linkedin).</p>
{keys.map(k=><label key={k}>{k}<textarea rows="8" value={v[k]||''} onChange={e=>setV({...v,[k]:e.target.value})}/></label>)}
<button className="btn" onClick={async()=>{try{for(const k of keys){const{error}=await sb.from('site_settings').upsert({key:k,value:JSON.parse(v[k]),updated_at:new Date().toISOString()});if(error)throw error}setM('Saved ✓')}catch(e){setM('Error: '+e.message)}}}>Save content</button> {m}</section>}
function Dash({user}){const[rows,setRows]=useState([]);const[cats,setCats]=useState([]);const[edit,setEdit]=useState(null);const[msgs,setMsgs]=useState([]);
const load=useCallback(async()=>{const[a,b,c]=await Promise.all([sb.from('projects').select('*,project_categories(category_id),project_images(*)').order('sort_order'),sb.from('categories').select('*').order('sort_order'),sb.from('contact_messages').select('*').order('created_at',{ascending:false}).limit(20)]);setRows(a.data||[]);setCats(b.data||[]);setMsgs(c.data||[])},[]);
useEffect(()=>{load()},[load]);
async function move(i,d){const j=i+d;if(j<0||j>=rows.length)return;await Promise.all([sb.from('projects').update({sort_order:rows[j].sort_order}).eq('id',rows[i].id),sb.from('projects').update({sort_order:rows[i].sort_order}).eq('id',rows[j].id)]);load()}
if(edit)return <Editor p={edit} cats={cats} onDone={()=>{setEdit(null);load()}}/>;
return <div className="wrap sec admin"><div className="sechead"><h1>Dashboard</h1><div><button className="btn" onClick={()=>setEdit({published:false,sort_order:rows.length+1,external_label:'View original project'})}>+ New project</button><button className="btn ghost" onClick={()=>sb.auth.signOut()}>Sign out</button></div></div>
<table><thead><tr><th>#</th><th>Title</th><th>Status</th><th/></tr></thead><tbody>{rows.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.title}</td><td>{r.published?'Published':'Draft'}</td><td>
<button className="btn ghost" onClick={()=>move(i,-1)}>↑</button><button className="btn ghost" onClick={()=>move(i,1)}>↓</button>
<button className="btn ghost" onClick={async()=>{await sb.from('projects').update({published:!r.published}).eq('id',r.id);load()}}>{r.published?'Unpublish':'Publish'}</button>
<button className="btn" onClick={()=>setEdit(r)}>Edit</button><button className="btn ghost" onClick={async()=>{if(confirm(`Delete “${r.title}”?`)){await sb.from('projects').delete().eq('id',r.id);load()}}}>Delete</button></td></tr>)}</tbody></table>
<Settings/><section style={{marginTop:60}}><h2>Messages</h2>{msgs.length?msgs.map(m=><p key={m.id} style={{margin:'14px 0'}}><b>{m.name}</b> ({m.email}): {m.message}</p>):<p>No messages yet.</p>}</section></div>}
export default function Admin(){const[u,setU]=useState(undefined);const[ok,setOk]=useState(null);
useEffect(()=>{sb.auth.getSession().then(({data})=>setU(data.session?.user||null));const{data:{subscription}}=sb.auth.onAuthStateChange((_,s)=>setU(s?.user||null));return()=>subscription.unsubscribe()},[]);
useEffect(()=>{if(u)sb.from('admin_users').select('user_id').eq('user_id',u.id).maybeSingle().then(({data})=>setOk(!!data));else setOk(null)},[u]);
if(u===undefined)return <p className="wrap sec">Loading…</p>;if(!u)return <Login/>;if(ok===null)return <p className="wrap sec">Checking access…</p>;
if(!ok)return <div className="wrap sec"><h1>Not authorised</h1><p>This account isn’t an admin. Run this in the Supabase SQL editor:</p><pre>{`insert into public.admin_users (user_id) values ('${u.id}');`}</pre><button className="btn" onClick={()=>sb.auth.signOut()}>Sign out</button></div>;
return <Dash user={u}/>}
