import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { advisorySchema, stages, revenues, helpAreas, type AdvisoryInput } from '../../shared/advisory';
import { useAdvisorySubmit } from '../queries/advisory';
import { SectionDoodle } from '../components/section-doodle';
import { softEase } from '../components/site-motion';

type Draft = Omit<AdvisoryInput, 'stage' | 'revenue'> & { stage: AdvisoryInput['stage'] | ''; revenue: AdvisoryInput['revenue'] | '' };
const titles = ['What are you building?', 'Where are you today?', 'What’s your current monthly revenue?', 'Where do you want help?', 'What’s the main thing you’re trying to solve?', 'About you'];
const notes = ['One sentence is plenty.', 'Pick the stage that feels closest.', 'A rough range is all we need. In USD.', 'Select all that apply. We’ll start there.', 'Give us the short version.', 'And finally, who’s behind the project?'];
const labels = ['The idea', 'Your stage', 'Revenue', 'Your focus', 'The challenge', 'About you'];
const emptyDraft = (): Draft => ({ submissionId: crypto.randomUUID(), building: '', stage: '', revenue: '', areas: [], challenge: '', name: '', email: '', company: '', website: '', companyFax: '' });

export default function AdvisoryForm() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [received, setReceived] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const submit = useAdvisorySubmit();
  useEffect(() => {
    const previous = document.title;
    document.title = 'Work with us — Swell Apps';
    return () => { document.title = previous; };
  }, []);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step, received]);

  const update = (key: keyof Draft, value: string) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: '' }));
    if (submit.isError) submit.reset();
  };
  const go = (next: number) => { setDirection(next > step ? 1 : -1); setErrors({}); setStep(next); };
  const advance = () => {
    const field = step === 0 ? 'building' : step === 4 ? 'challenge' : null;
    if (field) {
      const result = advisorySchema.shape[field].safeParse(draft[field]);
      if (!result.success) { setErrors({ [field]: result.error.issues[0].message }); return; }
    }
    if (step === 1 && !draft.stage) return;
    if (step === 2 && !draft.revenue) return;
    if (step === 3 && !draft.areas.length) return;
    go(step + 1);
  };
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (submit.isPending) return;
    if (step < 5) { advance(); return; }
    const result = advisorySchema.safeParse(draft);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { nextErrors[String(issue.path[0])] = issue.message; });
      setErrors(nextErrors); return;
    }
    try {
      await submit.mutateAsync(result.data);
      setReceived(true);
    } catch { /* Mutation state renders the error and keeps all answers for retry. */ }
  };
  const toggleArea = (area: AdvisoryInput['areas'][number]) => {
    const selected = draft.areas.includes(area);
    const areas = selected ? draft.areas.filter(value => value !== area) : [...draft.areas, area];
    setDraft(previous => ({ ...previous, areas }));
  };
  const field = (key: 'name' | 'email' | 'company' | 'website', label: string, placeholder: string, optional = false) => <div className="contact-field">
    <label htmlFor={key}>{label}{optional && <span>optional</span>}</label>
    <input aria-label={label} id={key} name={key} type={key === 'email' ? 'email' : 'text'} inputMode={key === 'website' ? 'url' : undefined} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : key === 'company' ? 'organization' : 'url'} maxLength={key === 'website' ? 500 : key === 'email' ? 254 : key === 'name' ? 100 : 150} placeholder={placeholder} value={draft[key]} onChange={event => update(key, event.target.value)} aria-required={!optional} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />
    {errors[key] && <p id={`${key}-error`} className="field-error" role="alert">{errors[key]}</p>}
  </div>;

  return <div className="enquiry-page">
    <header className="enquiry-header content-width">
      <Link href="/" className="wordmark" aria-label="Swell Apps home"><strong>Swell</strong><span>Apps</span></Link>
      <Link href="/" className="return-link"><ArrowLeft size={15} aria-hidden="true" /><span>Back to Swell</span></Link>
    </header>
    <main className="enquiry-main content-width">
      <aside className="enquiry-aside">
        <span className="eyebrow">A GOOD PLACE TO START</span>
        <h1>Tell us what<br /> you’re <span>working on.</span></h1>
        <p>A little context.<br />A clearer conversation.</p>
        <div className="enquiry-doodle"><SectionDoodle variant="conversation" /></div>
        <span className="aside-note">Short answers welcome.</span>
      </aside>
      <div className="enquiry-flow">
        {!received && <>
          <div className="step-topline"><span>0{step + 1} <span className="muted">/ 06</span></span><span>{labels[step]}</span></div>
          <progress className="sr-only" max={6} value={step + 1} aria-label={`Step ${step + 1} of 6: ${labels[step]}`} />
          <div className="step-progress" aria-hidden="true">
            {labels.map((label, index) => <span key={label} className={index <= step ? 'filled' : ''} />)}
          </div>
        </>}
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => headingRef.current?.focus({ preventScroll: true })}>
          {received ? <motion.section key="success" className="enquiry-success" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease: softEase }}>
            <span className="success-check"><Check size={30} aria-hidden="true" /></span>
            <span className="eyebrow">ENQUIRY RECEIVED</span>
            <h2 ref={headingRef} tabIndex={-1}>Thanks for<br /><span>the context.</span></h2>
            <p>Your enquiry is saved for review. If there’s a fit, we’ll follow up at <strong>{draft.email}</strong> to arrange a conversation.</p>
            <p className="success-note">No calendar to rush into. A good conversation starts with the right context.</p>
            <Link href="/" className="book-button">Back to Swell <ArrowUpRight size={19} aria-hidden="true" /></Link>
          </motion.section> : <motion.form key={step} onSubmit={send} noValidate className="step-form" initial={reduced ? false : { opacity: 0, x: direction * 12 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: direction * -10 }} transition={{ duration: .18, ease: softEase }}>
            <h2 ref={headingRef} tabIndex={-1} id="question-title">{titles[step]}</h2>
            <p className="question-note" id="question-note">{notes[step]}</p>
            {step === 0 && <div className="short-answer">
              <label className="sr-only" htmlFor="building">What are you building?</label>
              <textarea aria-labelledby="question-title" id="building" name="building" rows={3} maxLength={250} value={draft.building} placeholder="A mobile app that helps runners train for their first marathon." onChange={event => update('building', event.target.value.replace(/\n/g, ' '))} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); advance(); } }} aria-describedby={errors.building ? 'building-error' : 'question-note'} aria-invalid={!!errors.building} aria-required="true" />
              <div className="answer-meta"><span>Just the idea. Not the pitch.</span><span>{draft.building.length}/250</span></div>
              {errors.building && <p className="field-error" id="building-error" role="alert">{errors.building}</p>}
            </div>}
            {step === 1 && <fieldset className="choice-list stage-choices" aria-labelledby="question-title">
              {stages.map((value, index) => <button type="button" key={value} className={`choice ${draft.stage === value ? 'selected' : ''}`} aria-pressed={draft.stage === value} onClick={() => { setDraft(previous => ({ ...previous, stage: value })); go(2); }}><span className="choice-number">0{index + 1}</span><span>{value}</span><span className="choice-mark">{draft.stage === value ? <Check size={18} /> : <ArrowRight size={18} />}</span></button>)}
            </fieldset>}
            {step === 2 && <fieldset className="choice-list revenue-choices" aria-labelledby="question-title">
              {revenues.map(value => <button type="button" key={value} className={`choice ${draft.revenue === value ? 'selected' : ''} ${value === 'Not revenue-driven yet' ? 'secondary-choice' : ''}`} aria-pressed={draft.revenue === value} onClick={() => { setDraft(previous => ({ ...previous, revenue: value })); go(3); }}><span>{value}</span><span className="choice-mark">{draft.revenue === value ? <Check size={18} /> : <ArrowRight size={18} />}</span></button>)}
            </fieldset>}
            {step === 3 && <>
              <fieldset className="help-choices" aria-labelledby="question-title">{helpAreas.map(value => <button className={`help-choice ${draft.areas.includes(value) ? 'selected' : ''}`} key={value} type="button" aria-pressed={draft.areas.includes(value)} onClick={() => toggleArea(value)}>{value}<span>{draft.areas.includes(value) ? <Check size={19} /> : '+'}</span></button>)}</fieldset>
              <p className="selection-note" aria-live="polite">{draft.areas.length ? `${draft.areas.length} selected. Continue when you’re ready.` : 'Choose at least one. You can select all five.'}</p>
            </>}
            {step === 4 && <div className="short-answer">
              <label className="sr-only" htmlFor="challenge">What’s the main thing you’re trying to solve?</label>
              <textarea aria-labelledby="question-title" id="challenge" name="challenge" rows={3} maxLength={200} value={draft.challenge} placeholder="We have happy users, but we haven’t found a repeatable way to reach more of them." onChange={event => update('challenge', event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); advance(); } }} aria-describedby={errors.challenge ? 'challenge-error' : 'question-note'} aria-invalid={!!errors.challenge} aria-required="true" />
              <div className="answer-meta"><span>No essay needed.</span><span>{draft.challenge.length}/200</span></div>
              {errors.challenge && <p className="field-error" id="challenge-error" role="alert">{errors.challenge}</p>}
            </div>}
            {step === 5 && <>
              <div className="contact-grid">
                {field('name', 'Name', 'Your name')}{field('email', 'Email', 'you@company.com')}{field('company', 'Company / product name', 'What do you call it?')}{field('website', 'Website or app link', 'yourproject.com', true)}
              </div>
              <div className="spam-field" aria-hidden="true"><label htmlFor="companyFax">Company fax</label><input aria-label="Company fax" id="companyFax" tabIndex={-1} autoComplete="off" value={draft.companyFax} onChange={event => update('companyFax', event.target.value)} /></div>
              <details className="enquiry-summary"><summary>Your answers <span>Review before sending</span></summary><dl><dt>Building</dt><dd>{draft.building}</dd><dt>Stage & revenue</dt><dd>{draft.stage} · {draft.revenue}</dd><dt>Help with</dt><dd>{draft.areas.join(' & ')}</dd><dt>The challenge</dt><dd>{draft.challenge}</dd></dl></details>
              <p className="form-privacy">We’ll use these details to review your enquiry and contact you about it.</p>
              {submit.isError && <p className="submit-error" role="alert">{submit.error.message || 'We couldn’t save your enquiry. Your answers are still here — please try again.'}</p>}
            </>}
            <div className="step-actions">
              {step > 0 ? <button type="button" className="form-back" onClick={() => go(step - 1)} disabled={submit.isPending}><ArrowLeft size={17} aria-hidden="true" />Back</button> : <span className="keyboard-note">Enter ↵ to continue</span>}
              <button type="submit" className="book-button form-next" disabled={submit.isPending || (step === 1 && !draft.stage) || (step === 2 && !draft.revenue) || (step === 3 && !draft.areas.length)}>{submit.isPending ? <><LoaderCircle className="sending-spinner" size={18} />Sending…</> : <>{step === 5 ? 'Send enquiry' : 'Continue'}<ArrowUpRight size={18} aria-hidden="true" /></>}</button>
            </div>
            {step === 5 && <p className="review-note">Every enquiry is reviewed. If it looks like a fit, we’ll be in touch.</p>}
          </motion.form>}
        </AnimatePresence>
      </div>
    </main>
    <footer className="enquiry-footer content-width"><span>Swell Apps © 2026</span><span>Thoughtful products. Thoughtful conversations.</span></footer>
  </div>;
}
