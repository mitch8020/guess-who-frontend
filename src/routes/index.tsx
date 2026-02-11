import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authApi } from '@/api/auth'
import { useSession } from '@/hooks/useSession'
import { getStaggerStyle, motionClassNames } from '@/utils/motion'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const session = useSession()
  const [inviteCode, setInviteCode] = useState('')

  const joinByCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanedCode = inviteCode.trim().toUpperCase()
    if (!cleanedCode) {
      return
    }
    void navigate({ to: '/join/$code', params: { code: cleanedCode } })
  }

  return (
    <div className={`panel ${motionClassNames.sectionEntry}`}>
      <p className="badge">Phase 1 MVP</p>
      <h1 className={`page-title ${motionClassNames.fadeIn}`}>Play fast 1v1 Guess Who matches with your own photo boards.</h1>
      <p className={`subtle mt-3 max-w-3xl ${motionClassNames.fadeIn}`} style={getStaggerStyle(1)}>
        Hosts create rooms, invite friends, upload images, and launch fair server-randomized matches.
        Spectators can stay in-room while games run.
      </p>

      <div className="grid-two mt-6">
        <section className={`card ${motionClassNames.listItemEntry}`} style={getStaggerStyle(2)}>
          <h2 className="text-xl font-semibold">Google Sign-In</h2>
          <p className="subtle mt-2">
            Sign in to create and manage rooms. Session recovery is handled with refresh tokens.
          </p>
          {session.user ? (
            <div className="mt-4">
              <p>
                Signed in as <strong>{session.user.displayName}</strong>
              </p>
              <button
                type="button"
                className="btn btn-secondary mt-3"
                onClick={() => void navigate({ to: '/rooms' })}
              >
                Open Rooms
              </button>
            </div>
          ) : (
            <a href={authApi.getGoogleStartUrl()} className="btn btn-primary mt-4">
              Continue with Google
            </a>
          )}
        </section>

        <section className={`card ${motionClassNames.listItemEntry}`} style={getStaggerStyle(3)}>
          <h2 className="text-xl font-semibold">Join with Invite Code</h2>
          <p className="subtle mt-2">Enter a room code from a host invite link.</p>
          <form className="field mt-4" onSubmit={joinByCode}>
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Example: AB12CD34"
              maxLength={12}
            />
            <button type="submit" className="btn btn-primary">
              Join Room
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
