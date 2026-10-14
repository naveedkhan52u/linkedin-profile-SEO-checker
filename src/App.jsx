import React, { useMemo, useState } from 'react';
import {
  ArrowRight, ArrowLeft, ArrowUpRight, BadgeCheck, BarChart3, BriefcaseBusiness,
  Check, CheckCircle2, ChevronRight, CircleHelp, ClipboardCheck, Copy, Download,
  FileText, GraduationCap, Lightbulb, Link2, LockKeyhole, Menu, Search, ShieldCheck,
  Sparkles, Tags, Target, UserRound, WandSparkles, X, Zap
} from 'lucide-react';

const initialForm = { headline: '', about: '', experience: '', skills: '', education: '' };
const sample = {
  headline: 'Web Developer | SEO Specialist | AI Enthusiast',
  about: 'I help businesses grow online through web development, search engine optimization, and practical AI tools. I build responsive websites, improve on-page SEO, and focus on clear, measurable outcomes for clients.',
  experience: 'Web Developer and SEO Specialist. Build and maintain websites, improve technical and on-page SEO, research keywords, and optimize content. Collaborate with clients to understand goals and deliver reliable digital solutions.',
  skills: 'Web Development, SEO, WordPress, Technical SEO, Keyword Research, Website Design, AI Automation',
  education: 'Pre-Engineering, Academy of Excellence'
};

function validLinkedInUrl(value) {
  try {
    const url = new URL(value.startsWith('http') ? value : 'https://' + value);
    return /(^|\.)linkedin\.com$/i.test(url.hostname) && /^\/in\/[^/]+\/?$/.test(url.pathname);
  } catch { return false; }
}

function scoreProfile(form) {
  const categories = [
    { name: 'Headline & keywords', weight: 20, text: form.headline, checks: [form.headline.length >= 35, form.headline.includes('|') || form.headline.includes('•'), /seo|developer|design|marketing|engineer|manager|analyst|specialist|consultant/i.test(form.headline)] },
    { name: 'About section', weight: 20, text: form.about, checks: [form.about.length >= 250, /I help|I build|I lead|I specialize|experience/i.test(form.about), /\d|results|improve|deliver|growth|impact/i.test(form.about)] },
    { name: 'Experience', weight: 20, text: form.experience, checks: [form.experience.length >= 180, /built|led|managed|developed|improved|created|increased|reduced/i.test(form.experience), /\d|%|result|impact|achievement/i.test(form.experience)] },
    { name: 'Skills', weight: 15, text: form.skills, checks: [form.skills.split(/[,\n]/).filter(Boolean).length >= 5, form.skills.length >= 45, /seo|development|marketing|design|data|management|automation/i.test(form.skills)] },
    { name: 'Profile completeness', weight: 15, text: [form.headline, form.about, form.experience, form.skills, form.education].filter(Boolean).join(' '), checks: [Boolean(form.headline), Boolean(form.about), Boolean(form.experience) && Boolean(form.skills)] },
    { name: 'Writing clarity', weight: 10, text: [form.headline, form.about, form.experience].join(' '), checks: [form.about.length > 0, form.experience.length > 0, !/\b(very very|good good|best best)\b/i.test(form.about + ' ' + form.experience)] }
  ];
  const assessed = categories.filter(c => c.text.trim().length > 0);
  const scored = categories.map(c => ({ ...c, score: c.text.trim() ? Math.round(c.weight * c.checks.filter(Boolean).length / c.checks.length / c.weight * 100) : null }));
  const availableWeight = scored.filter(c => c.score !== null).reduce((sum, c) => sum + c.weight, 0);
  const total = availableWeight ? Math.round(scored.reduce((sum, c) => sum + (c.score === null ? 0 : c.score * c.weight), 0) / availableWeight) : 0;
  const coverage = Math.round(availableWeight);
  return { categories: scored, total, coverage, assessed: assessed.length };
}

function App() {
  const [screen, setScreen] = useState('home');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copied, setCopied] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const report = useMemo(() => scoreProfile(form), [form]);
  const filledCount = [form.headline, form.about, form.experience, form.skills].filter(v => v.trim()).length;

  function startAnalysis(event) {
    event?.preventDefault();
    setUrlError('');
    if (!validLinkedInUrl(url.trim())) {
      setUrlError('Enter a valid LinkedIn profile URL, such as https://www.linkedin.com/in/your-profile/.');
      return;
    }
    setUrl(url.startsWith('http') ? url : 'https://' + url);
    setNotice('Your URL is saved. Automatic profile retrieval is not connected yet, so add the profile text below to continue.');
    setScreen('fallback');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateField(key, value) { setForm(current => ({ ...current, [key]: value })); }
  function runReport(event) {
    event.preventDefault();
    if (!form.headline.trim() && !form.about.trim() && !form.experience.trim() && !form.skills.trim()) {
      setNotice('Add at least one profile section to generate a useful preliminary report.');
      return;
    }
    setNotice('');
    setScreen('results');
    setActiveTab('Overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() {
    setScreen('home'); setUrl(''); setForm(initialForm); setNotice(''); setUrlError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function copyText(label, text) {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1600); }
    catch { setCopied('Copy unavailable'); }
  }
  function downloadReport() {
    const lines = [
      'LinkedIn Profile SEO Checker Report',
      'Profile URL: ' + (url || 'Not provided'),
      'Preliminary SEO score: ' + report.total + '/100',
      'Profile coverage: ' + report.coverage + '% of weighted categories assessed',
      '',
      ...report.categories.map(c => c.name + ': ' + (c.score === null ? 'Not assessed' : c.score + '/100')),
      '',
      'Headline: ' + (form.headline || 'Not provided'),
      'About: ' + (form.about || 'Not provided'),
      'Experience: ' + (form.experience || 'Not provided'),
      'Skills: ' + (form.skills || 'Not provided'),
      '',
      'This is an advisory rubric, not an official LinkedIn ranking score.'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'linkedin-seo-report.txt'; link.click(); URL.revokeObjectURL(link.href);
  }

  const improvedHeadline = form.headline ? form.headline + (form.headline.toLowerCase().includes('help') ? '' : ' | Helping businesses achieve measurable results') : 'Your target role | Core specialty | Value you deliver';
  const improvedAbout = form.about ? form.about.trim() + (form.about.trim().endsWith('.') ? '' : '.') + ' Focus on the outcomes you create, the problems you solve, and evidence of your impact.' : 'I help [target audience] solve [specific problem] through [your core skills]. My focus is on delivering measurable outcomes, building useful solutions, and continuously improving my craft.';
  const improvedExperience = form.experience ? form.experience.trim() + (form.experience.trim().endsWith('.') ? '' : '.') + ' Where possible, add a specific project, measurable result, or clear example of your contribution.' : 'Describe your responsibilities, the tools you used, and the results of your work. Add accurate metrics or examples where available.';

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); reset(); }}>
          <span className="brand-mark">in</span>
          <span><strong>LinkedIn Profile SEO Checker</strong><small>Optimize your profile. Get discovered. Grow your career.</small></span>
        </a>
        <div className="top-actions">
          {screen === 'results' ? <><button className="btn btn-soft" onClick={downloadReport}><Download size={16}/> Download report</button><button className="btn btn-primary" onClick={reset}><Search size={16}/> New analysis</button></> : <a className="header-link" href="#how-it-works">How it works <ArrowUpRight size={15}/></a>}
        </div>
      </header>

      {screen === 'home' && <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15}/> FREE PROFILE SEO REVIEW</div>
            <h1>Make your LinkedIn profile <span>work harder.</span></h1>
            <p className="hero-lede">Find keyword gaps, strengthen your headline, and get practical recommendations to make your professional profile clearer and more searchable.</p>
            <form className="url-form" onSubmit={startAnalysis}>
              <label htmlFor="profile-url">Your LinkedIn profile URL</label>
              <div className="url-input-row"><Link2 size={19}/><input id="profile-url" value={url} onChange={e => {setUrl(e.target.value); setUrlError('');}} placeholder="https://www.linkedin.com/in/your-profile/" autoComplete="url"/><button className="btn btn-primary" type="submit">Analyze profile <ArrowRight size={17}/></button></div>
              {urlError && <p className="form-error">{urlError}</p>}
              <div className="form-assurance"><ShieldCheck size={15}/> Start with a URL. No account required.</div>
            </form>
            <div className="trust-points"><span><CheckCircle2/> Clear, actionable feedback</span><span><CheckCircle2/> Keyword-focused review</span><span><CheckCircle2/> Copy-ready suggestions</span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of an SEO report dashboard">
            <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
            <div className="floating-tag tag-top"><span className="tag-icon"><Target size={17}/></span><span><b>Keyword relevance</b><small>Spot opportunities</small></span><CheckCircle2 className="green-icon"/></div>
            <div className="preview-card">
              <div className="preview-head"><span className="mini-avatar"><UserRound size={25}/></span><span><b>Profile overview</b><small>SEO analysis preview</small></span><span className="preview-dots">•••</span></div>
              <div className="preview-score-row"><div className="score-ring"><div><b>78</b><small>/100</small></div></div><div><span className="status-pill"><Check size={12}/> Good foundation</span><h3>Room to improve</h3><p>See what to update first.</p></div></div>
              <div className="preview-divider"/>
              <div className="mini-bars"><div><span>Headline & keywords</span><b>88%</b><i><em style={{width:'88%'}}/></i></div><div><span>About section</span><b>76%</b><i><em style={{width:'76%'}}/></i></div><div><span>Experience</span><b>70%</b><i><em className="amber-bar" style={{width:'70%'}}/></i></div></div>
              <div className="preview-bottom"><Sparkles size={16}/><span>Recommendations tailored to your profile</span></div>
            </div>
            <div className="floating-tag tag-bottom"><span className="tag-icon lavender"><WandSparkles size={17}/></span><span><b>AI writing suggestions</b><small>Improve your profile copy</small></span></div>
            <div className="decor decor-one"/><div className="decor decor-two"/>
          </div>
        </section>

        <section className="feature-strip wrap"><div><span className="feature-icon"><BarChart3/></span><span><b>Understand your score</b><small>See strengths and gaps by category.</small></span></div><div><span className="feature-icon"><Tags/></span><span><b>Find relevant keywords</b><small>Make your expertise easier to understand.</small></span></div><div><span className="feature-icon"><WandSparkles/></span><span><b>Improve with a plan</b><small>Get practical edits you can use.</small></span></div></section>

        <section className="how-section" id="how-it-works"><div className="wrap"><div className="section-heading"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>From profile link to a clearer plan</h2><p>Start with your URL. If profile details cannot be retrieved, paste the relevant text and continue.</p></div><div className="steps-grid"><article className="step-card"><span className="step-num">01</span><span className="step-icon"><Link2/></span><h3>Enter your URL</h3><p>Start by sharing your public LinkedIn profile link.</p></article><article className="step-card"><span className="step-num">02</span><span className="step-icon"><FileText/></span><h3>Add profile text if needed</h3><p>Use the fallback form if automatic profile access is unavailable.</p></article><article className="step-card"><span className="step-num">03</span><span className="step-icon"><BarChart3/></span><h3>Review your results</h3><p>Explore the score, keyword ideas, and prioritized improvements.</p></article></div></div></section>
        <section className="cta-section wrap"><div><span className="eyebrow"><Zap size={14}/> YOUR NEXT PROFILE IMPROVEMENT</span><h2>Turn your profile into a clearer professional story.</h2><p>Start with the link. The tool will guide you if more information is needed.</p></div><button className="btn btn-white" onClick={() => {document.getElementById('profile-url')?.focus(); window.scrollTo({top:0,behavior:'smooth'});}}>Check my profile <ArrowRight size={17}/></button></section>
      </main>}

      {screen === 'fallback' && <main className="workspace wrap">
        <div className="steps-progress"><div className="progress-step done"><span><Check size={15}/></span><div><b>Enter profile URL</b><small>Link received</small></div></div><i/><div className="progress-step current"><span>2</span><div><b>Add profile text</b><small>If we can't access your profile</small></div></div><i/><div className="progress-step"><span>3</span><div><b>Analyze & score</b><small>Check your SEO</small></div></div><i/><div className="progress-step"><span>4</span><div><b>View report</b><small>Get recommendations</small></div></div></div>
        <div className="fallback-layout"><aside className="fallback-aside"><div className="illustration-icon"><ClipboardCheck size={42}/><span><PlusIcon/></span></div><h2>Profile text needed</h2><p>We can't retrieve profile details automatically in this version. This may happen because of privacy settings or platform access limits.</p><div className="notice-card"><CircleHelp size={19}/><div><b>No problem.</b><p>Paste the information from your LinkedIn profile below. We'll use the text you provide to create a preliminary SEO review.</p></div></div><h3>Helpful sections to include</h3><ul className="check-list">{['Headline / current title','About section','Work experience','Skills','Education (optional)'].map(x=><li key={x}><CheckCircle2 size={16}/>{x}</li>)}</ul><button className="text-button" onClick={() => {setScreen('home');setNotice('');}}><ArrowLeft size={16}/> Back to URL</button></aside>
          <form className="profile-form" onSubmit={runReport}><div className="form-title"><span className="eyebrow">STEP 2 OF 4</span><h1>Add your profile information</h1><p>Copy and paste the text from your LinkedIn profile. The more you provide, the more complete the review can be.</p></div>
            {notice && <div className="inline-notice"><CircleHelp size={17}/>{notice}</div>}
            <Field icon={<UserRound/>} label="Headline / current title" count={form.headline.length} max={220}><input maxLength={220} value={form.headline} onChange={e=>updateField('headline',e.target.value)} placeholder="e.g. Software Engineer | Web Developer | SEO Specialist"/></Field>
            <Field icon={<FileText/>} label="About section" count={form.about.length} max={2000}><textarea maxLength={2000} value={form.about} onChange={e=>updateField('about',e.target.value)} placeholder="Paste your LinkedIn About section or professional summary..." rows={4}/></Field>
            <Field icon={<BriefcaseBusiness/>} label="Work experience" count={form.experience.length} max={3000}><textarea maxLength={3000} value={form.experience} onChange={e=>updateField('experience',e.target.value)} placeholder="Paste roles, responsibilities, projects, and achievements..." rows={4}/></Field>
            <Field icon={<Tags/>} label="Skills" count={form.skills.length} max={800}><textarea maxLength={800} value={form.skills} onChange={e=>updateField('skills',e.target.value)} placeholder="e.g. SEO, WordPress, Web Development, Digital Marketing" rows={2}/></Field>
            <Field icon={<GraduationCap/>} label="Education (optional)" count={form.education.length} max={500} optional><input maxLength={500} value={form.education} onChange={e=>updateField('education',e.target.value)} placeholder="Degree or qualification, institution"/></Field>
            <div className="form-footer"><button type="button" className="btn btn-outline" onClick={() => {setScreen('home');window.scrollTo({top:0,behavior:'smooth'});}}><ArrowLeft size={16}/> Back</button><button type="submit" className="btn btn-primary">Continue to analysis <ArrowRight size={17}/></button></div><div className="privacy-note"><LockKeyhole size={14}/> Your text is analyzed in this browser and is not sent to a server by this demo.</div>
          </form></div>
        <div className="tip-banner"><Lightbulb size={19}/><span><b>Tip:</b> Keep your text accurate and specific. Metrics and achievements should reflect your real experience.</span></div>
      </main>}

      {screen === 'results' && <main className="results-shell">
        <aside className={'report-sidebar '+(mobileMenu?'open':'')}><div className="sidebar-status"><span className="status-dot"/><div><b>Analysis complete</b><small>Preliminary profile review</small></div></div><div className="sidebar-url">{url}<ArrowUpRight size={13}/></div><nav>{[{name:'Overview',icon:<BarChart3/>},{name:'Detailed Analysis',icon:<ClipboardCheck/>},{name:'Keywords',icon:<Search/>},{name:'AI Suggestions',icon:<Sparkles/>},{name:'Improved Content',icon:<FileText/>}].map(item=><button key={item.name} className={activeTab===item.name?'active':''} onClick={()=>{setActiveTab(item.name);setMobileMenu(false);document.getElementById('report-content')?.scrollIntoView({behavior:'smooth',block:'start'});}}>{item.icon}{item.name}</button>)}</nav><div className="sidebar-tip"><Lightbulb size={18}/><b>Pro tip</b><p>Review your profile regularly and keep your skills and achievements current.</p></div><button className="sidebar-new" onClick={reset}><Search size={16}/> New analysis</button></aside>
        <section className="report-main" id="report-content"><div className="report-mobile-head"><button className="icon-button" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button><b>SEO Report</b><button className="btn btn-soft" onClick={downloadReport}><Download size={15}/> Export</button></div>
          <div className="report-profile"><div className="profile-avatar"><UserRound size={32}/></div><div className="profile-identity"><h1>{form.headline.split(/[|•]/)[0].trim() || 'Your LinkedIn profile'} <span className="linkedin-mini">in</span></h1><p>{form.headline || 'Headline not provided'}</p><div className="skill-chips">{form.skills.split(/[,\n]/).map(s=>s.trim()).filter(Boolean).slice(0,5).map(s=><span key={s}>{s}</span>)}</div></div><div className="profile-url-card"><small>PROFILE URL</small><a href={url} target="_blank" rel="noreferrer">{url || 'Not provided'} <ArrowUpRight size={13}/></a><small>REPORT TYPE</small><b>Text-based preliminary review</b></div></div>
          <div className="coverage-warning"><ShieldCheck size={17}/><span><b>Data coverage: {report.coverage}%</b> · This report only evaluates the profile text you provided. No official LinkedIn ranking data is accessed.</span></div>
          {activeTab==='Overview' && <><div className="score-overview panel"><div className="score-display"><div className="large-ring" style={{'--score':report.total*3.6+'deg'}}><div><b>{report.total}</b><small>/100</small></div></div></div><div className="score-summary"><span className={'status-pill '+(report.total>=80?'good':report.total>=60?'medium':'needs')}><CheckCircle2 size={13}/>{report.total>=80?'Strong foundation':report.total>=60?'Good start':'Needs attention'}</span><h2>Your LinkedIn SEO score</h2><p>This preliminary score is based on the text submitted and the checklist below. It is not an official LinkedIn score or a search-ranking prediction.</p><button className="btn btn-primary" onClick={()=>setActiveTab('Detailed Analysis')}>View detailed analysis <ArrowRight size={16}/></button></div><div className="coverage-box"><div className="coverage-title">Profile coverage <CircleHelp size={14}/></div><div className="coverage-track"><i style={{width:report.coverage+'%'}}/></div><div className="coverage-label"><span>{report.assessed} of 6 categories assessed</span><b>{report.coverage}%</b></div><div className="coverage-stats"><span><CheckCircle2/><b>{report.categories.filter(c=>c.score>=75).length}</b><small>Strong areas</small></span><span><Target/><b>{report.categories.filter(c=>c.score!==null&&c.score<75).length}</b><small>Opportunities</small></span></div></div></div>
          <section className="panel category-panel"><div className="panel-heading"><h2><BarChart3/> Category breakdown</h2><span>Weighted rubric</span></div><div className="category-grid">{report.categories.map(c=><div className="category-card" key={c.name}><div className={'small-ring '+(c.score!==null&&c.score<75?'amber':'')} style={{'--score':(c.score||0)*3.6+'deg'}}><b>{c.score===null?'—':c.score+'%'}</b></div><b>{c.name}</b><small>{c.weight}% weight</small>{c.score===null&&<em>Not assessed</em>}</div>)}</div></section>
          <div className="lower-grid"><section className="panel"><div className="panel-heading"><h2><Search/> Key findings</h2></div><div className="findings-list">{report.categories.map(c=><div className="finding" key={c.name}><span className={'finding-icon '+(c.score!==null&&c.score<75?'amber':'')}>{c.score!==null&&c.score>=75?<CheckCircle2/>:<Target/>}</span><div><b>{c.name}</b><p>{c.score===null?'Not enough information was provided to assess this category.':c.score>=75?'Your supplied text meets several checklist criteria. Look for opportunities to make your value and expertise more specific.':'Add more detail, relevant keywords, and concrete evidence where accurate.'}</p></div><span className={'finding-status '+(c.score!==null&&c.score>=75?'good':'review')}>{c.score===null?'Not assessed':c.score>=75?'Good':'Review'}</span></div>)}</div></section>
          <section className="panel"><div className="panel-heading"><h2><Tags/> Keywords found</h2></div><div className="keyword-cloud">{Array.from(new Set((form.headline+' '+form.about+' '+form.experience+' '+form.skills).toLowerCase().match(/\b[a-z][a-z+#.-]{2,}\b/g)||[])).filter(w=>!['the','and','for','with','you','your','that','this','from','have','has','are','was','were','into','where','when','help','through','focus'].includes(w)).slice(0,18).map(word=><span key={word}>{word}</span>)}</div><div className="keyword-tip"><Lightbulb size={16}/><span>Use relevant terms naturally. Only include keywords that accurately reflect your skills and goals.</span></div></section></div>
          <section className="panel recommendations"><div className="panel-heading"><h2><Target/> Priority recommendations</h2></div>{[
            {title:'Sharpen your headline',desc:'Combine your target role, strongest specialty, and the value you bring.',done:Boolean(form.headline.length>70)},
            {title:'Add measurable achievements',desc:'Include accurate numbers, outcomes, or examples in your experience.',done:/\d|%/.test(form.experience)},
            {title:'Strengthen your About section',desc:'Explain who you help, what you do, and what makes your work useful.',done:form.about.length>250},
            {title:'Use focused, relevant skills',desc:'Prioritize skills aligned with the roles or clients you want to attract.',done:form.skills.split(',').filter(Boolean).length>=5}
          ].map((r,i)=><div className="recommendation" key={r.title}><span className="rec-number">{i+1}</span><div><b>{r.title}</b><p>{r.desc}</p></div><span className={'rec-state '+(r.done?'done':'')}>{r.done?'Looks covered':'Review'}</span><ChevronRight size={17}/></div>)}</section>
          <section className="panel ai-panel"><div className="panel-heading"><h2><Sparkles/> Suggested content improvements</h2><span>Editable examples</span></div><p className="ai-disclaimer">These are drafting prompts based on your supplied text, not verified facts. Review and edit before using.</p><Suggestion title="Headline idea" text={improvedHeadline} onCopy={()=>copyText('headline',improvedHeadline)} copied={copied==='headline'}/><Suggestion title="About section direction" text={improvedAbout} onCopy={()=>copyText('about',improvedAbout)} copied={copied==='about'}/><Suggestion title="Experience improvement" text={improvedExperience} onCopy={()=>copyText('experience',improvedExperience)} copied={copied==='experience'}/></section></>}
          {activeTab==='Detailed Analysis' && <section className="panel detail-tab"><div className="panel-heading"><h2><ClipboardCheck/> Detailed analysis</h2></div>{report.categories.map(c=><div className="detail-row" key={c.name}><div><b>{c.name}</b><p>{c.score===null?'Not assessed because this information was not supplied.':c.checks.map((pass,i)=><span className={pass?'check-pass':'check-fail'} key={i}>{pass?'✓':'•'} {['Section length / presence','Structure and specificity','Relevant evidence or keywords'][i]||'Checklist item'} </span>)}</p></div><strong>{c.score===null?'N/A':c.score+'/100'}</strong></div>)}</section>}
          {activeTab==='Keywords' && <section className="panel detail-tab"><div className="panel-heading"><h2><Tags/> Keyword review</h2></div><p className="muted">These are words detected in your submitted text, not a comparison against live LinkedIn search volume.</p><div className="keyword-cloud large">{Array.from(new Set((form.headline+' '+form.about+' '+form.experience+' '+form.skills).toLowerCase().match(/\b[a-z][a-z+#.-]{2,}\b/g)||[])).slice(0,60).map(w=><span key={w}>{w}</span>)}</div><div className="keyword-tip"><Lightbulb size={16}/><span>Choose terms your target audience uses, then place them naturally in the headline, About, experience, and skills.</span></div></section>}
          {activeTab==='AI Suggestions' && <section className="panel detail-tab"><div className="panel-heading"><h2><Sparkles/> Writing suggestions</h2></div><Suggestion title="Headline idea" text={improvedHeadline} onCopy={()=>copyText('headline',improvedHeadline)} copied={copied==='headline'}/><Suggestion title="About section direction" text={improvedAbout} onCopy={()=>copyText('about',improvedAbout)} copied={copied==='about'}/><Suggestion title="Experience improvement" text={improvedExperience} onCopy={()=>copyText('experience',improvedExperience)} copied={copied==='experience'}/></section>}
          {activeTab==='Improved Content' && <section className="panel detail-tab"><div className="panel-heading"><h2><FileText/> Improved content drafts</h2></div><Suggestion title="Headline draft" text={improvedHeadline} onCopy={()=>copyText('headline',improvedHeadline)} copied={copied==='headline'}/><Suggestion title="About section draft" text={improvedAbout} onCopy={()=>copyText('about',improvedAbout)} copied={copied==='about'}/><Suggestion title="Experience draft" text={improvedExperience} onCopy={()=>copyText('experience',improvedExperience)} copied={copied==='experience'}/></section>}
          <footer className="report-footer">This report is an advisory checklist based on supplied text. LinkedIn does not endorse this tool, and the score does not represent LinkedIn's internal ranking system.</footer>
        </section>
      </main>}
      <footer className="site-footer"><span>© 2026 LinkedIn Profile SEO Checker</span><span><LockKeyhole size={13}/> Built for practical profile improvements</span><span>Not affiliated with LinkedIn</span></footer>
    </div>
  );
}

function PlusIcon(){return <span className="plus-symbol">+</span>}
function Field({icon,label,count,max,optional,children}) { return <div className="field"><label className="field-label"><span>{icon}</span>{label}{optional&&<em>Optional</em>}</label>{children}<div className="field-meta"><span>{count===0?'':count+' characters'}</span><span>{count}/{max}</span></div></div>; }
function Suggestion({title,text,onCopy,copied}) { return <div className="suggestion"><div className="suggestion-head"><b>{title}</b><button className="copy-button" onClick={onCopy}><Copy size={13}/>{copied?'Copied':'Copy'}</button></div><p>{text}</p></div>; }

export default App;