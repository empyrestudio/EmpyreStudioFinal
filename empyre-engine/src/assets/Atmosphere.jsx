export default function Atmosphere({ className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="atm-sky" />
      <div className="atm-horizon" />
      <div className="atm-cloud" />
      <div className="atm-cloud two" />
    </div>
  )
}
