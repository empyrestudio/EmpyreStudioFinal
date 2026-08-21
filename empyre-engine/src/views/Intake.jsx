import { INDUSTRIES, STAGES, MODELS, ACTIONS, BUDGETS, TIMELINES, INTAKE_STEPS, TIER_LIST } from '../lib/constants.js'
import { Field, Input, Area, Select } from '../components/ui.jsx'
import { completeness, nameOf } from '../lib/utils.js'

export default function Intake({ record, step, setStep, onChange, onGenerate, saved }) {
  const c = record.client
  const set = (key) => (val) => onChange({ ...c, [key]: val })
  const { score, missing } = completeness(c)

  const onFiles = async (files) => {
    const max = 8
    const existing = c.assets || []
    const room = max - existing.length
    const picked = Array.from(files).slice(0, room)
    const assets = [...existing]
    for (const f of picked) {
      if (f.size > 2.5 * 1024 * 1024) continue
      const dataUrl = await readFile(f)
      assets.push({ name: f.name, type: f.type, dataUrl })
    }
    onChange({ ...c, assets })
  }

  return (
    <div className="page">
      <div className="intake-head">
        <div className="kicker">Client intake · Step 0{step} of 06</div>
        <h1 className="display">{nameOf(c) === 'Untitled assessment' ? 'New Brand Elevation Assessment' : nameOf(c)}</h1>
        <p className="lede">
          Capture the business reality first. Visual direction comes after. Incomplete fields will be marked as hypotheses in the assessment.
        </p>
        <div className="meta" style={{ marginTop: 12 }}>
          <span className="badge">{score}% foundation</span>
          <span className="save-pill">{saved}</span>
        </div>
      </div>

      <div className="steps">
        {INTAKE_STEPS.map((s) => (
          <button key={s.id} className={`step ${step === s.id ? 'active' : ''}`} onClick={() => setStep(s.id)}>
            <span className="n">0{s.id}</span>
            {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="grid-form">
          <Field label="Business name" className="span-2">
            <Input value={c.businessName} onChange={set('businessName')} placeholder="Legal or trading name" />
          </Field>
          <Field label="Website URL">
            <Input value={c.website} onChange={set('website')} placeholder="https://" />
          </Field>
          <Field label="Social links">
            <Input value={c.socials} onChange={set('socials')} placeholder="Instagram, LinkedIn, others" />
          </Field>
          <Field label="Location / service area">
            <Input value={c.location} onChange={set('location')} placeholder="City, region, or 'national / digital'" />
          </Field>
          <Field label="Industry">
            <Select value={c.industry} onChange={set('industry')} options={INDUSTRIES} />
          </Field>
          <Field label="Business model">
            <Select value={c.businessModel} onChange={set('businessModel')} options={MODELS} />
          </Field>
          <Field label="Business stage">
            <Select value={c.stage} onChange={set('stage')} options={STAGES} />
          </Field>
          <Field label="Primary service or product" className="span-2">
            <Area value={c.primaryOffer} onChange={set('primaryOffer')} placeholder="What is actually sold, booked, or reserved?" />
          </Field>
          <Field label="Typical project / order value" className="span-2">
            <Input value={c.typicalValue} onChange={set('typicalValue')} placeholder="As stated by the client — do not invent" />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="grid-form">
          <Field label="Primary audience" className="span-2">
            <Area value={c.primaryAudience} onChange={set('primaryAudience')} placeholder="Who is this actually for? Be specific." />
          </Field>
          <Field label="Secondary audience" className="span-2">
            <Area value={c.secondaryAudience} onChange={set('secondaryAudience')} />
          </Field>
          <Field label="Customer motivations">
            <Area value={c.motivations} onChange={set('motivations')} />
          </Field>
          <Field label="Customer objections">
            <Area value={c.objections} onChange={set('objections')} />
          </Field>
          <Field label="Customer pain points" className="span-2">
            <Area value={c.painPoints} onChange={set('painPoints')} />
          </Field>
          <Field label="Desired customer action">
            <Select value={c.desiredAction} onChange={set('desiredAction')} options={ACTIONS} />
          </Field>
          <Field label="Geographic market">
            <Input value={c.geoMarket} onChange={set('geoMarket')} />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="grid-form">
          <Field label="Current brand strengths">
            <Area value={c.strengths} onChange={set('strengths')} />
          </Field>
          <Field label="Current brand challenges">
            <Area value={c.challenges} onChange={set('challenges')} />
          </Field>
          <Field label="What feels unclear, outdated, inconsistent, or limiting" className="span-2">
            <Area value={c.unclear} onChange={set('unclear')} />
          </Field>
          <Field label="What must remain unchanged" className="span-2">
            <Area value={c.mustRemain} onChange={set('mustRemain')} />
          </Field>
          <Field label="Brand voice as it exists today">
            <Area value={c.voiceDescription} onChange={set('voiceDescription')} />
          </Field>
          <Field label="Current website (if different)">
            <Input value={c.currentWebsite} onChange={set('currentWebsite')} />
          </Field>
          <Field label="Brands they admire — and why">
            <Area value={c.admiredBrands} onChange={set('admiredBrands')} />
          </Field>
          <Field label="Brands they do not want to resemble">
            <Area value={c.avoidBrands} onChange={set('avoidBrands')} />
          </Field>
          <Field label="Current logo and visual assets" className="span-2" hint="Up to 5 images, 2.5MB each. Stored locally in this browser.">
            <div
              className="drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onFiles(e.dataTransfer.files)
              }}
            >
              Drop files here or
              <label className="btn small" style={{ marginLeft: 8 }}>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </div>
            <div className="asset-row">
              {(c.assets || []).map((a, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img className="asset-thumb" src={a.dataUrl} alt={a.name} />
                  <button
                    className="btn small danger"
                    style={{ marginTop: 6 }}
                    onClick={() => onChange({ ...c, assets: c.assets.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="grid-form">
          <Field label="Competitors" className="span-2">
            <Area value={c.competitors} onChange={set('competitors')} placeholder="Named competitors only. Do not invent a set." />
          </Field>
          <Field label="Alternatives clients compare them with">
            <Area value={c.alternatives} onChange={set('alternatives')} />
          </Field>
          <Field label="Current market positioning">
            <Area value={c.marketPosition} onChange={set('marketPosition')} />
          </Field>
          <Field label="Main differentiators" className="span-2">
            <Area value={c.differentiators} onChange={set('differentiators')} />
          </Field>
          <Field label="Known sales objections">
            <Area value={c.salesObjections} onChange={set('salesObjections')} />
          </Field>
          <Field label="Reviews, testimonials, or customer language">
            <Area value={c.customerLanguage} onChange={set('customerLanguage')} hint="Paste only real language. Leave blank if none." />
          </Field>
          <Field label="Existing analytics or performance data" className="span-2">
            <Area value={c.analytics} onChange={set('analytics')} placeholder="Only client-supplied figures. Never invent rates or rankings." />
          </Field>
        </div>
      )}

      {step === 5 && (
        <div className="grid-form">
          <Field label="Goals for the next 6–12 months" className="span-2">
            <Area value={c.goals} onChange={set('goals')} />
          </Field>
          <Field label="Primary conversion goal">
            <Area value={c.conversionGoal} onChange={set('conversionGoal')} />
          </Field>
          <Field label="Desired brand perception">
            <Area value={c.desiredPerception} onChange={set('desiredPerception')} />
          </Field>
          <Field label="Timeline">
            <Select value={c.timeline} onChange={set('timeline')} options={TIMELINES} />
          </Field>
          <Field label="Budget range">
            <Select value={c.budget} onChange={set('budget')} options={BUDGETS} />
          </Field>
          <Field label="Preferred Empyré service, if any">
            <Select
              value={c.preferredService}
              onChange={set('preferredService')}
              options={[{ id: '', label: 'No preference — diagnose first' }, ...TIER_LIST.map((t) => ({ id: t.name, label: t.name }))]}
              placeholder="No preference — diagnose first"
            />
          </Field>
          <Field label="Required deliverables" className="span-2">
            <Area value={c.requiredDeliverables} onChange={set('requiredDeliverables')} />
          </Field>
          <Field label="Additional notes" className="span-2">
            <Area value={c.notes} onChange={set('notes')} />
          </Field>
          {missing.length > 0 && (
            <div className="banner warn span-2">
              <h4>Still open</h4>
              <p>The engine can draft, but these fields are empty and will be treated as hypotheses: {missing.join(', ')}.</p>
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        <button className="btn" disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}>
          Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {step < 5 && (
            <button className="btn primary" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          )}
          {step === 5 && (
            <button className="btn primary" onClick={onGenerate} disabled={!c.businessName}>
              Generate assessment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
