import { Link } from '@tanstack/react-router'
import { House, LogOut, PlusSquare, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { authApi } from '@/api/auth'
import { sessionStore } from '@/stores/sessionStore'
import { useSession } from '@/hooks/useSession'
import { shellMotionClassNames } from '@/utils/motion'

export default function Header() {
  const session = useSession()

  useEffect(() => {
    if (!session.accessToken || session.user) {
      return
    }
    void authApi
      .me()
      .then((payload) => sessionStore.setUser(payload.user))
      .catch(() => sessionStore.clearUserSession())
  }, [session.accessToken, session.user])

  return (
    <header className={`site-header ${shellMotionClassNames.header}`}>
      <Link to="/" className="brand">
        <span className="brand-token">GW</span>
        <span>Guess Who Arena</span>
      </Link>
      <nav className="header-links">
        <Link to="/" className={`header-link ${shellMotionClassNames.headerLink}`}>
          <House size={16} />
          Home
        </Link>
        {session.user ? (
          <>
            <Link to="/rooms" className={`header-link ${shellMotionClassNames.headerLink}`}>
              <UsersRound size={16} />
              Rooms
            </Link>
            <Link to="/rooms/new" className={`header-link ${shellMotionClassNames.headerLink}`}>
              <PlusSquare size={16} />
              New Room
            </Link>
            <button
              type="button"
              className={`header-link ghost-button ${shellMotionClassNames.headerLink}`}
              onClick={async () => {
                await authApi.logout().catch(() => undefined)
                sessionStore.clearUserSession()
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : null}
      </nav>
    </header>
  )
}
