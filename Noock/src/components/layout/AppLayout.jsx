import Sidebar from './Sidebar'
import TopBar from './Topbar'

export default function AppLayout({ children, user }) {
  return (
    <div className="h-screen w-screen bg-bg flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} />

        <main className="flex-1 min-h-0 overflow-hidden px-5 pb-4">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}