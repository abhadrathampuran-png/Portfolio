import {useEffect,useRef,useState} from 'react';
import {HashRouter,Routes,Route,NavLink,Link,useParams,useLocation} from 'react-router-dom';
import {sb,asset} from './supabase';import Admin from './Admin';
const cats=p=>(p.project_categories||[]).map(x=>x.categories).filter(Boolean);
function useProjects(){const[s,set]=useState({loading:true,error:null,data:[]});
useEffect(()=>{sb.from('projects').select('*,project_categories(categories(name,slug))').eq('published',true).order('sort_order').then(({data,error})=>set({loading:false,error:error?.message,data:data||[]}))},[]);return s}
function useSetting(key){const[v,set]=useState({});useEffect(()=>{sb.from('site_settings').select('value').eq('key',key).maybeSingle().then(({data})=>set(data?.value||{}))},[key]);return v}
function Reveal({children}){const r=useRef();useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){r.current.classList.add('in');o.disconnect()}},{threshold:.12});o.observe(r.current);return()=>o.disconnect()},[]);return <div ref={r} className="rv">{children}</div>}
function Status({s}){if(s.loading)return <p className="wrap">Loading…</p>;if(s.error)return <p className="wrap err">Couldn’t load projects: {s.error}</p>;if(!s.data.length)return <p className="wrap">No projects published yet.</p>;return null}
function Card({p,i}){const c=cats(p);return <Link to={`/work/${p.slug}`} className="card"><div className="thumb">
{p.cover_url?<img src={asset(p.cover_url)} alt={p.title} loading="lazy"/>:<div className="ph">Cover image to be uploaded<br/>in the admin dashboard</div>}
<div className="over">{p.short_description||'View project →'}</div></div>
<div className="meta"><span>{String(i+1).padStart(2,'0')}</span><h3>{p.title}</h3><em>{c.map(x=>x.name).join(' · ')}{p.year?` · ${p.year}`:''}</em></div></Link>}
async function share(){const u=location.origin+location.pathname;try{if(navigator.share){await navigator.share({title:document.title,url:u});return}}catch(e){if(e.name==='AbortError')return}try{await navigator.clipboard.writeText(u);alert('Link copied')}catch{prompt('Copy this link:',u)}}
function Layout({children}){const[open,setOpen]=useState(false);const{pathname}=useLocation();const hero=useSetting('hero');const ct=useSetting('contact');
useEffect(()=>{setOpen(false);window.scrollTo(0,0)},[pathname]);const name=hero.wordmark||'Amba Bhadra Thampuran';
return <><div className="wrap"><nav><Link to="/" className="logo"><small>Hi I’m</small><span>{name}</span></Link>
<button className="burger" onClick={()=>setOpen(!open)} aria-expanded={open}>{open?'Close':'Menu'}</button>
<div className={'links'+(open?' open':'')}>{[['/','Home'],['/work','Work'],['/about','About'],['/contact','Contact']].map(([t,l])=><NavLink key={t} to={t} end={t==='/'}>{l}</NavLink>)}
<button className="chip" onClick={share}>Share ↗</button><Link to="/contact" className="avail"><i/>Open to collaborate</Link></div></nav></div>
<main className="page" key={pathname}>{children}</main>
<footer><div className="wrap"><div className="row"><div><Link to="/" className="logo"><small>Hi I’m</small><span>{name}</span></Link><p>Visual Communication Designer</p></div>
<div>{[['Instagram',ct.instagram],['Behance',ct.behance],['LinkedIn',ct.linkedin]].filter(x=>x[1]).map(([l,u])=><a key={l} href={u} target="_blank" rel="noreferrer">{l}</a>)}
<button className="chip" style={{color:'var(--cream)',borderColor:'var(--cream)'}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Back to top ↑</button></div></div>
<p style={{marginTop:30,opacity:.7,fontSize:'.85rem'}}>© {new Date().getFullYear()} {name}. All work belongs to its creator.</p></div></footer></>}
function Home(){const s=useProjects();const h=useSetting('hero');const a=useSetting('about')
return <><div className="wrap"><section className="hero"><div><p className="eyebrow">{h.eyebrow||'Visual Communication Designer'}</p>
<h1>Between <em>brand,</em><br/>film &amp; <em>story.</em></h1><p>{h.statement||'Exploring the space between branding, advertising, filmmaking and visual storytelling.'}</p>
<Link className="btn" to="/work">Explore my work →</Link></div><div className="blob" aria-hidden="true"/></section></div>
<section className="sec"><div className="wrap"><div className="sechead"><h2>Selected <em>work</em></h2><span className="eyebrow">{s.data.length} projects</span></div>
<Status s={s}/><div className="grid">{s.data.map((p,i)=><Reveal key={p.id}><Card p={p} i={i}/></Reveal>)}</div></div></section>
<section className="sec dough"><div className="wrap"><Reveal><p className="eyebrow">About</p><h2 className="big">A curious designer who <em>plays</em> across disciplines.</h2>
{a.intro&&<p className="prose">{a.intro.slice(0,320)}</p>}<Link className="btn ghost" to="/about">More about me</Link></Reveal></div></section>
<section className="sec"><div className="wrap"><Reveal><p className="eyebrow">Contact</p><h2 className="big">Let’s make something <em>together.</em></h2><Link className="btn" to="/contact">Say hello</Link></Reveal></div></section></>}
function Work(){const s=useProjects();const[f,setF]=useState('all');const all=[...new Map(s.data.flatMap(cats).map(c=>[c.slug,c])).values()];
const list=s.data.filter(p=>f==='all'||cats(p).some(c=>c.slug===f));
return <div className="wrap sec"><h1 className="big">All <em>work</em></h1><div className="filters"><button className={'chip'+(f==='all'?' on':'')} onClick={()=>setF('all')}>All</button>
{all.map(c=><button key={c.slug} className={'chip'+(f===c.slug?' on':'')} onClick={()=>setF(c.slug)}>{c.name}</button>)}</div>
<Status s={s}/><div className="grid">{list.map((p,i)=><Card key={p.id} p={p} i={i}/>)}</div></div>}
function Project(){const{slug}=useParams();const[st,set]=useState({loading:true});
useEffect(()=>{sb.from('projects').select('*,project_categories(categories(name,slug)),project_images(*)').eq('slug',slug).eq('published',true).maybeSingle().then(({data,error})=>set({loading:false,p:data,error:error?.message}))},[slug]);
useEffect(()=>{if(st.p)document.title=`${st.p.title} — Amba Bhadra Thampuran`},[st.p]);
if(st.loading)return <p className="wrap sec">Loading…</p>;if(!st.p)return <div className="wrap sec"><h1 className="big">Project not found</h1><Link className="btn" to="/work">Back to work</Link></div>;
const p=st.p;const imgs=(p.project_images||[]).sort((a,b)=>a.sort_order-b.sort_order);const rows=[['Role',p.role],['Credits',p.credits],['Year',p.year],['Details',p.details]].filter(r=>r[1]);
return <article className="wrap sec"><p className="eyebrow">{cats(p).map(c=>c.name).join(' · ')}</p><h1 className="big">{p.title}</h1>
{p.cover_url?<img src={asset(p.cover_url)} alt={p.title} style={{borderRadius:6,width:'100%'}}/>:<div className="ph">Cover image to be uploaded in the admin dashboard</div>}
{p.short_description&&<p style={{fontSize:'1.3rem',maxWidth:680,marginTop:30}} className="it">{p.short_description}</p>}
{rows.length>0&&<dl>{rows.map(([k,v])=><div key={k} style={{display:'contents'}}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
{p.full_description&&<p className="prose">{p.full_description}</p>}
{p.embed_url&&<iframe title={p.title} src={p.embed_url} style={{width:'100%',height:600,border:0,marginTop:30,borderRadius:6}}/>}
{imgs.length>0&&<div className="gal">{imgs.map(i=><img key={i.id} src={i.url} alt={i.caption||p.title} loading="lazy"/>)}</div>}
{p.external_url&&<a className="btn" href={p.external_url} target="_blank" rel="noreferrer">{p.external_label||'View original project'} ↗</a>}</article>}
function About(){const a=useSetting('about');const ct=useSetting('contact');const L=(t,arr)=>arr?.length>0&&<><h3 style={{marginTop:36}}>{t}</h3><p>{arr.join(' · ')}</p></>
return <div className="wrap sec"><h1 className="big">About <em>me</em></h1><div className="prose">{a.intro||'Introduction coming soon — editable in the admin dashboard.'}</div>
{a.philosophy&&<><h3 style={{marginTop:36}}>Creative philosophy</h3><p className="prose">{a.philosophy}</p></>}{L('Disciplines',a.skills)}{L('Tools',a.tools)}{L('Experience',a.experience)}
{a.resume_url&&<a className="btn" href={a.resume_url} target="_blank" rel="noreferrer">Resume ↗</a>}</div>}
function Contact(){const ct=useSetting('contact');const[f,setF]=useState({name:'',email:'',message:''});const[st,setSt]=useState('idle');const[err,setErr]=useState('');
async function send(e){e.preventDefault();setErr('');if(!f.name.trim()||!/^\S+@\S+\.\S+$/.test(f.email)||!f.message.trim())return setErr('Please fill in your name, a valid email and a message.');
setSt('sending');const{error}=await sb.from('contact_messages').insert(f);if(error){setSt('idle');setErr('Something went wrong. Please try again.')}else setSt('done')}
return <div className="wrap sec"><h1 className="big">Let’s <em>talk</em></h1>
<p style={{marginBottom:24}}>{ct.email&&<a href={`mailto:${ct.email}`}>{ct.email}</a>}{ct.phone&&<a style={{marginLeft:16}} href={`tel:${ct.phone.replace(/\s/g,'')}`}>{ct.phone}</a>} {[['Instagram',ct.instagram],['Behance',ct.behance],['LinkedIn',ct.linkedin]].filter(x=>x[1]).map(([l,u])=><a key={l} style={{marginLeft:16}} href={u} target="_blank" rel="noreferrer">{l}</a>)}</p>
{st==='done'?<p className="ok">Thank you — your message has landed. I’ll get back to you soon.</p>:
<form onSubmit={send} noValidate>{['name','email'].map(k=><label key={k}>{k[0].toUpperCase()+k.slice(1)}<input type={k==='email'?'email':'text'} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></label>)}
<label>Message<textarea rows="6" value={f.message} onChange={e=>setF({...f,message:e.target.value})}/></label>{err&&<p className="err" role="alert">{err}</p>}
<button className="btn" disabled={st==='sending'}>{st==='sending'?'Sending…':'Send message'}</button></form>}</div>}
export default function App(){return <HashRouter><Routes><Route path="/admin/*" element={<Admin/>}/>
<Route path="*" element={<Layout><Routes><Route path="/" element={<Home/>}/><Route path="/work" element={<Work/>}/><Route path="/work/:slug" element={<Project/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<div className="wrap sec"><h1 className="big">Lost?</h1><Link className="btn" to="/">Home</Link></div>}/></Routes></Layout>}/></Routes></HashRouter>}
