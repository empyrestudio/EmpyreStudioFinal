import lockup from './brand/lockup-300.webp'
import lockupSm from './brand/lockup-200.webp'
import mark from './brand/mark-180.png'
import wordmark from './brand/wordmark-280.webp'
import hero from './brand/hero_atmosphere.jpg'
import summit from './brand/cta_summit.jpg'

export function LogoLockup({ className = '', size = 'md' }) {
  return (
    <img
      className={`brand-img lockup ${className}`}
      src={size === 'sm' ? lockupSm : lockup}
      alt="Empyré Studio"
    />
  )
}

export function LogoMark({ className = '' }) {
  return <img className={`brand-img mark ${className}`} src={mark} alt="" />
}

export function LogoWordmark({ className = '' }) {
  return <img className={`brand-img wordmark ${className}`} src={wordmark} alt="Empyré Studio" />
}

export function AtmospherePhoto({ variant = 'hero', className = '' }) {
  const src = variant === 'summit' ? summit : hero
  return (
    <div className={`atm-photo ${className}`} aria-hidden="true">
      <img src={src} alt="" />
      <div className="atm-overlay" />
      <div className="atm-vignette" />
    </div>
  )
}
