'use client'

type ActiveView = 'overview' | 'transactions' | 'add' | 'test'

interface SidebarProps {
  activeView: ActiveView
  onNavigate: (view: ActiveView) => void
  onLogout: () => void
  user: any
  isDemoMode: boolean
  isOpen: boolean
}

const NAV_ITEMS: { view: ActiveView; label: string; iconFile: string }[] = [
  { view: 'overview', label: 'Dashboard', iconFile: '/figma/container-11.svg' },
  { view: 'transactions', label: 'History', iconFile: '/figma/container-12.svg' },
  { view: 'add', label: 'New Activity', iconFile: '/figma/container-13.svg' },
  { view: 'test', label: 'Status', iconFile: '/figma/container-14.svg' },
]

export default function Sidebar({ activeView, onNavigate, onLogout, user, isDemoMode, isOpen }: SidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-sidebar border-r border-sidebar-border
        transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:flex
      `}
    >
      {/* Brand */}
      <div className="px-6 pt-8 pb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-[33px] h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#d4af37' }}
          >
            <img src="/figma/container-10.svg" alt="" width={19} height={18} />
          </div>
          <div>
            <p
              className="text-2xl font-bold leading-8"
              style={{ color: '#735c00', fontFamily: 'var(--font-heading)' }}
            >
              Money Mate
            </p>
            <p className="text-sm leading-5" style={{ color: '#5d5e61' }}>
              Premium Wealth
              <br />
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2" aria-label="Main navigation">
        {NAV_ITEMS.map(({ view, label, iconFile }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded text-base transition
                ${isActive
                  ? 'border border-[#735c00]'
                  : 'hover:bg-[#f3f4f5]'}
              `}
              style={{
                backgroundColor: isActive ? '#f3f4f5' : 'transparent',
                color: isActive ? '#735c00' : '#5d5e61',
              }}
            >
              <img
                src={iconFile}
                alt=""
                width={18}
                height={18}
                style={{ opacity: isActive ? 1 : 0.7 }}
              />
              <span className={isActive ? 'font-medium' : 'font-normal'}>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div
        className="px-6 pt-6 pb-8"
        style={{ borderTop: '1px solid #d0c5af' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#e1e3e4' }}
          >
            <img src="/figma/container-15.svg" alt="" width={16} height={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#191c1d' }}>
              {user?.email ?? 'demo@example.com'}
            </p>
            <button
              onClick={onLogout}
              className="text-xs font-medium tracking-wide transition hover:underline"
              style={{ color: '#5d5e61', letterSpacing: '0.06em' }}
            >
              {isDemoMode ? 'Sign out (Demo)' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
