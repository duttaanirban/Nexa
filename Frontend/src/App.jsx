import { LayoutDashboard } from "lucide-react"

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex items-center gap-3 text-white">
        <LayoutDashboard size={32} />
        <h1 className="text-4xl font-bold">
          Developer Productivity Dashboard
        </h1>
      </div>
    </div>
  )
}

export default App