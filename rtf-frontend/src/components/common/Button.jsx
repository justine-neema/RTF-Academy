export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold text-sm px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light',
    outline: 'border border-navy text-navy hover:bg-navy/5 active:bg-navy/10',
    ghost: 'text-navy hover:underline',
    gold: 'bg-gold text-navy-dark hover:bg-gold-dark',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}