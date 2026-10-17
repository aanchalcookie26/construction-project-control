import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,

  ChevronDown,
  CircleHelp,
  Clock3,
  Construction,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  Wallet,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type Project = {
  id: number
  name: string
  project_code: string
  location: string
  approved_budget: number
  recorded_cost: number
  planned_progress: number
  actual_progress: number
  start_date: string | null
  end_date: string | null
  status: string
}

type TaskRecord = { id: number; task_code: string; name: string; phase: string; due_date: string | null; progress: number; status: string; notes?: string | null }
type ExpenseRecord = { id: number; category: string; description: string; amount: number; expense_date: string | null; vendor?: string | null; status: string }
type ProgressRecord = { id: number; update_date: string; planned_progress: number; actual_progress: number; summary: string; blockers?: string | null }
type RiskRecord = { id: number; title: string; description?: string | null; probability: string; impact: string; mitigation?: string | null; status: string }

const progressData = [
  { week: 'W01', planned: 8, actual: 7 },
  { week: 'W02', planned: 14, actual: 12 },
  { week: 'W03', planned: 21, actual: 19 },
  { week: 'W04', planned: 29, actual: 25 },
  { week: 'W05', planned: 37, actual: 32 },
  { week: 'W06', planned: 45, actual: 39 },
  { week: 'W07', planned: 53, actual: 46 },
  { week: 'W08', planned: 61, actual: 54 },
]

const budgetData = [
  { category: 'Structure', planned: 15, actual: 13.4 },
  { category: 'Foundation', planned: 8, actual: 8.8 },
  { category: 'Materials', planned: 7, actual: 5.9 },
  { category: 'Labour', planned: 6, actual: 5.4 },
  { category: 'Services', planned: 5, actual: 3.2 },
]

const tasks = [
  {
    id: 'WP-014',
    name: 'Reinforcement & slab casting',
    phase: 'Structure',
    due: '18 Oct',
    progress: 72,
    status: 'In progress',
    tone: 'green',
  },
  {
    id: 'WP-018',
    name: 'Electrical conduit installation',
    phase: 'Services',
    due: '16 Oct',
    progress: 35,
    status: 'At risk',
    tone: 'amber',
  },
  {
    id: 'WP-009',
    name: 'Ground-floor masonry',
    phase: 'Masonry',
    due: '21 Oct',
    progress: 0,
    status: 'Not started',
    tone: 'grey',
  },
]

const risks = [
  {
    number: '01',
    title: 'Electrical conduit work is behind plan',
    detail: 'WP-018 · Services',
    level: 'Review schedule',
    tone: 'amber',
  },
  {
    number: '02',
    title: 'Foundation cost is above allocation',
    detail: 'Budget category · Foundation',
    level: 'Review costs',
    tone: 'red',
  },
]


function App() {
  const [apiData, setApiData] = useState<Project[] | null>(null)
  const [apiError, setApiError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDemoNotice, setShowDemoNotice] = useState(true)
  const [tasksData, setTasksData] = useState<TaskRecord[]>([])
  const [expensesData, setExpensesData] = useState<ExpenseRecord[]>([])
  const [progressDataSaved, setProgressDataSaved] = useState<ProgressRecord[]>([])
  const [risksData, setRisksData] = useState<RiskRecord[]>([])
  const [pageError, setPageError] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [progressFormOpen, setProgressFormOpen] = useState(false)
  const [riskFormOpen, setRiskFormOpen] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', project_code: '', location: '', approved_budget: '0', recorded_cost: '0', planned_progress: '0', actual_progress: '0', start_date: '', end_date: '', status: 'Active' })
  const [taskForm, setTaskForm] = useState({ task_code: '', name: '', phase: 'General', due_date: '', progress: '0', status: 'Not started', notes: '' })
  const [expenseForm, setExpenseForm] = useState({ category: 'Materials', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), vendor: '' })
  const [progressForm, setProgressForm] = useState({ update_date: new Date().toISOString().slice(0, 10), planned_progress: '0', actual_progress: '0', summary: '', blockers: '' })
  const [riskForm, setRiskForm] = useState({ title: '', description: '', probability: 'Medium', impact: 'Medium', mitigation: '' })

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_BASE}/projects`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Backend request failed')
        return response.json() as Promise<Project[]>
      })
      .then((data) => {
        setApiData(data)
        setApiError(false)
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setApiError(true)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const endpoints: Record<string, string> = {
      'Tasks & schedule': '/tasks',
      'Budget & expenses': '/expenses',
      'Progress log': '/progress-updates',
      'Risks & alerts': '/risks',
    }
    const endpoint = endpoints[activeNav]
    if (!endpoint) return
    setPageError('')
    fetch(`${API_BASE}${endpoint}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load records. Check that the backend is running.')
        return response.json()
      })
      .then((data: unknown[]) => {
        if (activeNav === 'Tasks & schedule') setTasksData(data as TaskRecord[])
        if (activeNav === 'Budget & expenses') setExpensesData(data as ExpenseRecord[])
        if (activeNav === 'Progress log') setProgressDataSaved(data as ProgressRecord[])
        if (activeNav === 'Risks & alerts') setRisksData(data as RiskRecord[])
      })
      .catch((error: unknown) => setPageError(error instanceof Error ? error.message : 'Unable to load records.'))
  }, [activeNav])

  const submitRecord = async (endpoint: string, payload: object, onSuccess: () => void) => {
    setPageError('')
    setFormMessage('')
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : 'Could not save this record.')
      setFormMessage('Saved successfully.')
      onSuccess()
      if (endpoint === '/projects') {
        const refreshed = await fetch(`${API_BASE}/projects`).then((r) => r.json()) as Project[]
        setApiData(refreshed)
      }
      if (endpoint === '/expenses' && project) {
        const refreshed = await fetch(`${API_BASE}/projects`).then((r) => r.json()) as Project[]
        setApiData(refreshed)
      }
      const refreshPath = endpoint === '/tasks' ? '/tasks' : endpoint === '/expenses' ? '/expenses' : endpoint === '/progress-updates' ? '/progress-updates' : endpoint === '/risks' ? '/risks' : ''
      if (refreshPath) {
        const refreshed = await fetch(`${API_BASE}${refreshPath}`).then((r) => r.json()) as unknown[]
        if (refreshPath === '/tasks') setTasksData(refreshed as TaskRecord[])
        if (refreshPath === '/expenses') setExpensesData(refreshed as ExpenseRecord[])
        if (refreshPath === '/progress-updates') setProgressDataSaved(refreshed as ProgressRecord[])
        if (refreshPath === '/risks') setRisksData(refreshed as RiskRecord[])
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to save record.')
    }
  }

  const project = apiData?.[0]

  const formatCurrency = (amount: number) =>
    `₹${Math.round(amount).toLocaleString('en-IN')}`

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set'
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const budgetRemaining = project
    ? project.approved_budget - project.recorded_cost
    : 0
  const recordedCostPercentage =
    project && project.approved_budget > 0
      ? (project.recorded_cost / project.approved_budget) * 100
      : 0
  const scheduleVariance = project
    ? project.actual_progress - project.planned_progress
    : 0

  const displayedProgressData = project
    ? [
        ...progressData.slice(0, -1),
        { week: 'W08', planned: project.planned_progress, actual: project.actual_progress },
      ]
    : progressData

    const navigation = [
      { label: 'Dashboard', icon: LayoutDashboard },
      { label: 'Projects', icon: Construction },
      { label: 'Tasks & schedule', icon: CalendarDays },
      { label: 'Budget & expenses', icon: Wallet },
      { label: 'Progress log', icon: Activity },
      { label: 'Forecasting', icon: ArrowUpRight },
      { label: 'Risks & alerts', icon: ShieldAlert },
      { label: 'Reports', icon: FileText },
    ]
  
    const pageTitle = activeNav === 'Dashboard' ? 'Project overview' : activeNav
  
    return (
      <div className="journal-app">
        {mobileMenuOpen && (
          <button
            className="mobile-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
  
        <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div className="brand">
            <div className="brand-mark">
              <Construction size={22} strokeWidth={1.7} />
            </div>
            <div className="brand-copy">
              <span className="brand-name">FIELDNOTE</span>
              <span className="brand-subtitle">PROJECT CONTROLS</span>
            </div>
            <button
              className="icon-button sidebar-close"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
  
          <div className="workspace-label">WORKSPACE</div>
  
          <button className="workspace-switcher">
            <span className="workspace-avatar">GH</span>
            <span className="workspace-copy">
              <strong>{project?.name ?? 'Projects'}</strong>
              <small>{project?.location ?? 'Project workspace'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
  
          <div className="nav-label">PROJECT</div>
  
          <nav className="sidebar-nav" aria-label="Main navigation">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`nav-item ${activeNav === label ? 'nav-item-active' : ''}`}
                onClick={() => {
                  setActiveNav(label)
                  setMobileMenuOpen(false)
                }}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {label === 'Risks & alerts' && (
                  <span className="nav-count">2</span>
                )}
              </button>
            ))}
          </nav>
  
          <div className="sidebar-bottom">
            <div className={`api-status ${apiError ? 'api-offline' : ''}`}>
              <span className="api-status-dot" />
              <div>
                <strong>
                  {loading ? 'Connecting to API' : apiError ? 'API unavailable' : 'API connected'}
                </strong>
                <small>
                  {apiError ? 'Check backend server' : 'Local development'}
                </small>
              </div>
            </div>
            <button className="nav-item" onClick={() => setActiveNav('Settings')}>
              <Settings2 size={17} strokeWidth={1.8} />
              <span>Settings</span>
            </button>
            <button className="nav-item" onClick={() => setActiveNav('Help & support')}>
              <CircleHelp size={17} strokeWidth={1.8} />
              <span>Help & support</span>
            </button>
            <div className="profile">
              <div className="profile-avatar">PM</div>
              <div className="profile-copy">
                <strong>Project Manager</strong>
                <small>Local demo workspace</small>
              </div>
              <MoreHorizontal size={19} />
            </div>
          </div>
        </aside>

        <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">


        <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Projects</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{project?.name ?? 'Project overview'}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="report-date">
              <CalendarDays size={15} />
              <span>18 October 2026</span>
            </div>
            <button className="icon-button" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={18} />
              <span />
            </button>
            <div className="topbar-divider" />
            <div className="topbar-avatar">PM</div>
          </div>
        </header>

        <div className="page-content">
          {activeNav === 'Dashboard' ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" />
                    PROJECT INTELLIGENCE / 001
                  </div>
                  <h1>Project overview<span className="heading-period">.</span></h1>
                  <p className="page-description">
                    A considered view of progress, cost and the decisions ahead.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setActiveNav('Progress log')}
                >
                  <Plus size={16} />
                  Record update
                </button>
              </section>

              {showDemoNotice && (
                <div className="demo-notice">
                  <div className="demo-notice-icon">
                    <FileText size={16} />
                  </div>
                  <p>
                    <strong>{apiError || !project ? 'Demonstration data' : 'Data source note'}</strong>
                    <span>
                      {apiError || !project
                        ? 'Project details are unavailable until a project record loads. Charts, work packages and risk flags are illustrative sample data.'
                        : 'Project details and financial metrics load from your local database. Charts, work packages and risk flags are still illustrative sample data.'}
                    </span>
                  </p>
                  <button
                    className="icon-button"
                    aria-label="Dismiss demo notice"
                    onClick={() => setShowDemoNotice(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {apiError && (
                <div className="connection-warning">
                  The API is unavailable. Start the backend and refresh this page. Sample chart, task and risk data may still appear.
                </div>
              )}

              {!loading && !apiError && apiData?.length === 0 && (
                <div className="connection-warning">
                  The API is connected, but no project records were found. Create a project before viewing project metrics.
                </div>
              )}

              <section className="project-banner">
                <div className="project-banner-main">
                  <div className="project-kicker">
                    <span className="project-status-dot" />
                    {(project?.status ?? 'PROJECT')}
                    <span className="project-code">{project?.project_code ?? 'Loading project…'}</span>
                  </div>
                  <h2>{project?.name ?? (loading ? 'Loading project…' : 'No project selected')}</h2>
                  <div className="project-meta">
                    <span><MapPin size={14} /> {project?.location ?? 'Location not set'}</span>
                    <span><CalendarDays size={14} /> {project ? `${formatDate(project.start_date)} – ${formatDate(project.end_date)}` : 'Project dates not set'}</span>
                    <span><Clock3 size={14} /> Planned {project?.planned_progress ?? 0}% complete</span>
                  </div>
                </div>
                <div className="project-progress-ring">
                  <div className="ring-visual">
                    <svg viewBox="0 0 100 100" role="img" aria-label={`${project?.actual_progress ?? 0} percent physical progress`}>
                      <circle cx="50" cy="50" r="42" className="ring-track" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="ring-value"
                        strokeDasharray={`${2 * Math.PI * 42 * ((project?.actual_progress ?? 0) / 100)} ${2 * Math.PI * 42}`}
                      />
                    </svg>
                    <div className="ring-label">
                      <strong>{project?.actual_progress ?? 0}<span>%</span></strong>
                      <small>COMPLETE</small>
                    </div>
                  </div>
                  <div className="ring-caption">Physical progress</div>
                </div>
              </section>
              <section className="metrics-section" aria-label="Project financial metrics">
                <div className="section-heading">
                  <div>
                    <span className="section-index">01</span>
                    <h3>Financial position</h3>
                  </div>
                  <span className="section-note">INR · Database record</span>
                </div>
                <div className="metrics-grid">
                  <article className="metric metric-featured">
                    <div className="metric-top">
                      <span>Approved budget</span>
                      <Wallet size={17} />
                    </div>
                    <div className="metric-value">{project ? formatCurrency(project.approved_budget) : '—'}</div>
                    <div className="metric-bottom">
                      <span className="metric-footnote">Baseline allocation</span>
                      <span className="metric-tag">BAC</span>
                    </div>
                  </article>
                  <article className="metric">
                    <div className="metric-top">
                      <span>Recorded cost</span>
                      <Activity size={17} />
                    </div>
                    <div className="metric-value">{project ? formatCurrency(project.recorded_cost) : '—'}</div>
                    <div className="metric-bottom">
                      <span className="metric-footnote">{project ? `${recordedCostPercentage.toFixed(1)}% of budget` : 'No project data'}</span>
                      <span className="metric-mini-bar"><span style={{ width: `${Math.min(recordedCostPercentage, 100)}%` }} /></span>
                    </div>
                  </article>

                  <article className="metric">
                    <div className="metric-top">
                      <span>Budget remaining</span>
                      <ArrowDownRight size={17} />
                    </div>
                    <div className="metric-value">{project ? formatCurrency(budgetRemaining) : '—'}</div>
                    <div className="metric-bottom">
                      <span className="metric-footnote">Budget less recorded cost</span>
                    </div>
                  </article>

                  <article className="metric">
                    <div className="metric-top">
                      <span>Schedule variance</span>
                      <Clock3 size={17} />
                    </div>
                    <div className="metric-value">{scheduleVariance > 0 ? '+' : scheduleVariance < 0 ? '−' : ''}{Math.abs(scheduleVariance)}<span className="metric-unit">pp</span></div>
                    <div className="metric-bottom">
                      <span className="metric-footnote">{project ? `${project.actual_progress}% actual vs ${project.planned_progress}% planned` : 'Progress unavailable'}</span>
                      <span className="variance-tag">{scheduleVariance < 0 ? <><ArrowDownRight size={12} /> Behind plan</> : scheduleVariance > 0 ? <><ArrowUpRight size={12} /> Ahead of plan</> : 'On plan'}</span>
                    </div>
                  </article>
                  </div>
              </section>

              <section className="analysis-grid">
                <article className="journal-panel progress-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-kicker">02 / DELIVERY</span>
                      <h3>Progress against plan</h3>
                    </div>
                    <button className="subtle-button" onClick={() => setActiveNav('Progress log')}>
                      View history <ArrowRight size={14} />
                    </button>
                  </div>
                  <p className="panel-description">
                    Cumulative physical completion, reported weekly.
                  </p>
                  <div className="chart-legend">
                    <span><i className="legend-dot planned-dot" /> Baseline</span>
                    <span><i className="legend-dot actual-dot" /> Actual</span>
                  </div>
                  <div className="progress-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayedProgressData} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#315f49" stopOpacity={0.18} />
                            <stop offset="100%" stopColor="#315f49" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#e9e8e0" strokeDasharray="3 4" />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#898c80', fontSize: 11 }} dy={10} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#898c80', fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                          contentStyle={{ border: '1px solid #e5e5dc', borderRadius: 8, fontSize: 12 }}
                          formatter={(value, name) => [`${value}%`, name === 'planned' ? 'Baseline' : 'Actual']}
                        />
                        <Area type="monotone" dataKey="planned" stroke="#b5a78a" strokeWidth={2} strokeDasharray="5 4" fill="none" />
                        <Area type="monotone" dataKey="actual" stroke="#315f49" strokeWidth={2.5} fill="url(#actualFill)" activeDot={{ r: 4, fill: '#315f49' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footnote">
                    <span>Latest reporting period · W08 (history is illustrative)</span>
                    <span className="chart-gap">{scheduleVariance < 0 ? <><ArrowDownRight size={13} /> {Math.abs(scheduleVariance)} percentage points behind</> : scheduleVariance > 0 ? <><ArrowUpRight size={13} /> {scheduleVariance} percentage points ahead</> : 'On plan'}</span>
                  </div>
                </article>

                <article className="journal-panel budget-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-kicker">03 / EXPENDITURE</span>
                      <h3>Where the money goes</h3>
                    </div>
                    <button className="icon-button" aria-label="More budget options">
                      <MoreHorizontal size={19} />
                    </button>
                  </div>
                  <p className="panel-description">
                    Planned allocation compared with recorded cost.
                  </p>
                  <div className="budget-chart-legend">
                    <span><i className="legend-dot planned-dot" /> Budget</span>
                    <span><i className="legend-dot actual-dot" /> Recorded</span>
                  </div>
                  <div className="budget-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData} layout="vertical" margin={{ top: 2, right: 4, left: 0, bottom: 0 }} barGap={2}>
                        <CartesianGrid horizontal={false} stroke="#ecebe3" />
                        <XAxis type="number" hide domain={[0, 18]} />
                        <YAxis dataKey="category" type="category" width={76} tickLine={false} axisLine={false} tick={{ fill: '#696f63', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ border: '1px solid #e5e5dc', borderRadius: 8, fontSize: 12 }}
                          formatter={(value) => [`₹${Number(value).toFixed(1)}L`]}
                        />
                        <Bar dataKey="planned" name="Budget" fill="#d7d2c2" radius={[0, 3, 3, 0]} barSize={8} />
                        <Bar dataKey="actual" name="Recorded" radius={[0, 3, 3, 0]} barSize={8}>
                          {budgetData.map((entry) => (
                            <Cell key={entry.category} fill={entry.actual > entry.planned ? '#b7654b' : '#315f49'} />
                          ))}
                           </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="budget-insight">
                    <span className="insight-mark"><Activity size={15} /></span>
                    <p>
                      <strong>Foundation warrants review.</strong>
                      <span>Recorded cost exceeds its illustrative allocation.</span>
                    </p>
                  </div>
                </article>
              </section>

              <section className="bottom-grid">
                <article className="journal-panel tasks-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-kicker">04 / WORK PACKAGES</span>
                      <h3>Tasks requiring attention</h3>
                    </div>
                    <button className="subtle-button" onClick={() => setActiveNav('Tasks & schedule')}>
                      All tasks <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="task-table-wrap">
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Work package</th>
                          <th>Due</th>
                          <th>Progress</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id}>
                            <td>
                              <div className="task-name">{task.name}</div>
                              <div className="task-meta">{task.id} · {task.phase}</div>
                            </td>
                            <td className="task-due">{task.due}</td>
                            <td>
                              <div className="task-progress">
                                <div className="task-progress-track">
                                  <span style={{ width: `${task.progress}%` }} />
                                </div>
                                <small>{task.progress}%</small>
                              </div>
                            </td>
                            <td>
                              <span className={`status-pill status-${task.tone}`}>
                                <i /> {task.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="journal-panel risks-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-kicker">05 / EXCEPTIONS</span>
                      <h3>Items to review</h3>
                    </div>
                    <span className="risk-total">02</span>
                  </div>
                  <p className="panel-description">
                    Illustrative flags for project-manager review.
                  </p>
                  <div className="risk-list">
                    {risks.map((risk) => (
                      <div className="risk-item" key={risk.number}>
                        <span className={`risk-number risk-number-${risk.tone}`}>{risk.number}</span>
                        <div className="risk-copy">
                          <strong>{risk.title}</strong>
                          <small>{risk.detail}</small>
                        </div>
                        <button
                          className="risk-action"
                          aria-label={`Review ${risk.title}`}
                          onClick={() => setActiveNav('Risks & alerts')}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="risk-footer" onClick={() => setActiveNav('Risks & alerts')}>
                    Open risk register <ArrowRight size={14} />
                  </button>
                </article>
              </section>
              <footer className="page-footer">
                <span>FIELDNOTE / PROJECT CONTROLS</span>
                <span>Local prototype · v0.1.0</span>
                <span>{loading ? 'Connecting to API' : apiError ? 'API unavailable' : project ? 'Project data loaded' : 'No project records'}</span>
              </footer>
            </>
          
        
) : activeNav === 'Tasks & schedule' ? (
          <section className="placeholder-page">
            <div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / DELIVERY</div>
            <div className="functional-heading"><div><h1>Tasks & schedule<span className="heading-period">.</span></h1><p className="page-description">Track work packages, due dates and completion.</p></div><button className="primary-button" onClick={() => setTaskFormOpen(!taskFormOpen)}><Plus size={16} /> Add task</button></div>
            {pageError && <div className="connection-warning">{pageError}</div>}{formMessage && <div className="success-message">{formMessage}</div>}
            {taskFormOpen && <form className="record-form" onSubmit={(e) => { e.preventDefault(); void submitRecord('/tasks', { ...taskForm, project_id: project?.id ?? 1, due_date: taskForm.due_date || null, progress: Number(taskForm.progress) }, () => { setTaskFormOpen(false); setTaskForm({ task_code: '', name: '', phase: 'General', due_date: '', progress: '0', status: 'Not started', notes: '' }) }) }}><label>Task code<input required value={taskForm.task_code} onChange={e => setTaskForm({ ...taskForm, task_code: e.target.value })} placeholder="WP-021" /></label><label>Task name<input required value={taskForm.name} onChange={e => setTaskForm({ ...taskForm, name: e.target.value })} placeholder="Concrete slab casting" /></label><label>Phase<input required value={taskForm.phase} onChange={e => setTaskForm({ ...taskForm, phase: e.target.value })} /></label><label>Due date<input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} /></label><label>Progress %<input type="number" min="0" max="100" value={taskForm.progress} onChange={e => setTaskForm({ ...taskForm, progress: e.target.value })} /></label><label>Status<select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}><option>Not started</option><option>In progress</option><option>At risk</option><option>Completed</option></select></label><label className="form-wide">Notes<input value={taskForm.notes} onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })} /></label><button className="primary-button" type="submit">Save task</button></form>}
            <div className="journal-panel record-panel"><div className="panel-heading"><h3>Work package register</h3><span>{tasksData.length} tasks</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Work package</th><th>Phase</th><th>Due date</th><th>Progress</th><th>Status</th></tr></thead><tbody>{tasksData.map(t => <tr key={t.id}><td><div className="task-name">{t.name}</div><div className="task-meta">{t.task_code}</div></td><td>{t.phase}</td><td>{t.due_date ?? 'Not set'}</td><td>{t.progress}%</td><td><span className="status-pill">{t.status}</span></td></tr>)}</tbody></table>{tasksData.length === 0 && <p className="empty-state">No tasks saved yet. Add your first work package above.</p>}</div></div>
          </section>
        ) : activeNav === 'Budget & expenses' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / FINANCIAL CONTROL</div><div className="functional-heading"><div><h1>Budget & expenses<span className="heading-period">.</span></h1><p className="page-description">Record actual costs and monitor budget consumption.</p></div><button className="primary-button" onClick={() => setExpenseFormOpen(!expenseFormOpen)}><Plus size={16} /> Record expense</button></div>{pageError && <div className="connection-warning">{pageError}</div>}{formMessage && <div className="success-message">{formMessage}</div>}
            <div className="record-summary-grid"><div className="metric"><span>Approved budget</span><strong>{project ? formatCurrency(project.approved_budget) : '—'}</strong></div><div className="metric"><span>Recorded cost</span><strong>{project ? formatCurrency(project.recorded_cost) : '—'}</strong></div><div className="metric"><span>Budget remaining</span><strong>{project ? formatCurrency(project.approved_budget - project.recorded_cost) : '—'}</strong></div></div>
            {expenseFormOpen && <form className="record-form" onSubmit={e => { e.preventDefault(); void submitRecord('/expenses', { ...expenseForm, project_id: project?.id ?? 1, amount: Number(expenseForm.amount), expense_date: expenseForm.expense_date || null }, () => { setExpenseFormOpen(false); setExpenseForm({ category: 'Materials', description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), vendor: '' }) }) }}><label>Category<select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}><option>Materials</option><option>Labour</option><option>Equipment</option><option>Foundation</option><option>Structure</option><option>Services</option><option>Other</option></select></label><label>Description<input required value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} /></label><label>Amount (₹)<input required type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></label><label>Date<input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} /></label><label>Vendor<input value={expenseForm.vendor} onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })} /></label><button className="primary-button" type="submit">Save expense</button></form>}
            <div className="journal-panel record-panel"><div className="panel-heading"><h3>Expense ledger</h3><span>{expensesData.length} records · {formatCurrency(expensesData.reduce((sum, x) => sum + x.amount, 0))}</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Vendor</th><th>Amount</th></tr></thead><tbody>{expensesData.map(x => <tr key={x.id}><td>{x.description}</td><td>{x.category}</td><td>{x.expense_date ?? '—'}</td><td>{x.vendor || '—'}</td><td>{formatCurrency(x.amount)}</td></tr>)}</tbody></table>{expensesData.length === 0 && <p className="empty-state">No expenses recorded yet.</p>}</div></div>
          </section>
        ) : activeNav === 'Progress log' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / SITE REPORTING</div><div className="functional-heading"><div><h1>Progress log<span className="heading-period">.</span></h1><p className="page-description">Record weekly planned and actual completion.</p></div><button className="primary-button" onClick={() => setProgressFormOpen(!progressFormOpen)}><Plus size={16} /> Record update</button></div>{pageError && <div className="connection-warning">{pageError}</div>}{formMessage && <div className="success-message">{formMessage}</div>}
            {progressFormOpen && <form className="record-form" onSubmit={e => { e.preventDefault(); void submitRecord('/progress-updates', { ...progressForm, project_id: project?.id ?? 1, planned_progress: Number(progressForm.planned_progress), actual_progress: Number(progressForm.actual_progress) }, () => { setProgressFormOpen(false); setProgressForm({ update_date: new Date().toISOString().slice(0, 10), planned_progress: '0', actual_progress: '0', summary: '', blockers: '' }) }) }}><label>Report date<input required type="date" value={progressForm.update_date} onChange={e => setProgressForm({ ...progressForm, update_date: e.target.value })} /></label><label>Planned completion %<input required type="number" min="0" max="100" value={progressForm.planned_progress} onChange={e => setProgressForm({ ...progressForm, planned_progress: e.target.value })} /></label><label>Actual completion %<input required type="number" min="0" max="100" value={progressForm.actual_progress} onChange={e => setProgressForm({ ...progressForm, actual_progress: e.target.value })} /></label><label className="form-wide">Summary<input required value={progressForm.summary} onChange={e => setProgressForm({ ...progressForm, summary: e.target.value })} /></label><label className="form-wide">Blockers<input value={progressForm.blockers} onChange={e => setProgressForm({ ...progressForm, blockers: e.target.value })} /></label><button className="primary-button" type="submit">Save progress update</button></form>}
            <div className="journal-panel record-panel"><div className="panel-heading"><h3>Progress history</h3><span>{progressDataSaved.length} updates</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Date</th><th>Summary</th><th>Planned</th><th>Actual</th><th>Variance</th></tr></thead><tbody>{progressDataSaved.map(x => <tr key={x.id}><td>{x.update_date}</td><td><div className="task-name">{x.summary}</div>{x.blockers && <div className="task-meta">Blocker: {x.blockers}</div>}</td><td>{x.planned_progress}%</td><td>{x.actual_progress}%</td><td>{x.actual_progress - x.planned_progress > 0 ? '+' : ''}{x.actual_progress - x.planned_progress} pp</td></tr>)}</tbody></table>{progressDataSaved.length === 0 && <p className="empty-state">No progress updates yet. Record the latest site progress above.</p>}</div></div>
          </section>
        ) : activeNav === 'Risks & alerts' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / EXCEPTIONS</div><div className="functional-heading"><div><h1>Risks & alerts<span className="heading-period">.</span></h1><p className="page-description">Maintain a risk register with ownership actions and mitigation notes.</p></div><button className="primary-button" onClick={() => setRiskFormOpen(!riskFormOpen)}><Plus size={16} /> Add risk</button></div>{pageError && <div className="connection-warning">{pageError}</div>}{formMessage && <div className="success-message">{formMessage}</div>}
            {riskFormOpen && <form className="record-form" onSubmit={e => { e.preventDefault(); void submitRecord('/risks', { ...riskForm, project_id: project?.id ?? 1 }, () => { setRiskFormOpen(false); setRiskForm({ title: '', description: '', probability: 'Medium', impact: 'Medium', mitigation: '' }) }) }}><label>Risk title<input required value={riskForm.title} onChange={e => setRiskForm({ ...riskForm, title: e.target.value })} /></label><label>Probability<select value={riskForm.probability} onChange={e => setRiskForm({ ...riskForm, probability: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Impact<select value={riskForm.impact} onChange={e => setRiskForm({ ...riskForm, impact: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Description<input value={riskForm.description} onChange={e => setRiskForm({ ...riskForm, description: e.target.value })} /></label><label className="form-wide">Mitigation plan<input value={riskForm.mitigation} onChange={e => setRiskForm({ ...riskForm, mitigation: e.target.value })} /></label><button className="primary-button" type="submit">Save risk</button></form>}
            <div className="journal-panel record-panel"><div className="panel-heading"><h3>Risk register</h3><span>{risksData.filter(x => x.status !== 'Closed').length} open</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Risk</th><th>Probability</th><th>Impact</th><th>Mitigation</th><th>Status</th></tr></thead><tbody>{risksData.map(x => <tr key={x.id}><td><div className="task-name">{x.title}</div><div className="task-meta">{x.description}</div></td><td>{x.probability}</td><td>{x.impact}</td><td>{x.mitigation || 'Not set'}</td><td><span className="status-pill">{x.status}</span></td></tr>)}</tbody></table>{risksData.length === 0 && <p className="empty-state">No risks recorded. Add a risk when an issue needs monitoring.</p>}</div></div>
          </section>
        ) : activeNav === 'Forecasting' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / COST & SCHEDULE</div><h1>Forecasting<span className="heading-period">.</span></h1><p className="page-description">Earned-value indicators calculated from your saved project record.</p>{project ? <div className="record-summary-grid"><div className="metric"><span>Earned value (EV)</span><strong>{formatCurrency(project.approved_budget * project.actual_progress / 100)}</strong><small>Budget × actual completion</small></div><div className="metric"><span>Planned value (PV)</span><strong>{formatCurrency(project.approved_budget * project.planned_progress / 100)}</strong><small>Budget × planned completion</small></div><div className="metric"><span>Schedule variance</span><strong>{scheduleVariance > 0 ? '+' : ''}{scheduleVariance} pp</strong><small>{scheduleVariance < 0 ? 'Behind baseline' : scheduleVariance > 0 ? 'Ahead of baseline' : 'On baseline'}</small></div><div className="metric"><span>Cost variance</span><strong>{formatCurrency(project.approved_budget * project.actual_progress / 100 - project.recorded_cost)}</strong><small>EV − recorded cost</small></div><div className="metric"><span>Cost performance index</span><strong>{project.recorded_cost ? (project.approved_budget * project.actual_progress / 100 / project.recorded_cost).toFixed(2) : '—'}</strong><small>EV ÷ actual cost; above 1 is favorable</small></div><div className="metric"><span>Estimate at completion</span><strong>{project.recorded_cost && project.actual_progress ? formatCurrency(project.approved_budget / ((project.approved_budget * project.actual_progress / 100) / project.recorded_cost)) : '—'}</strong><small>Budget ÷ cost performance index</small></div></div> : <p>Load a project to calculate forecasts.</p>}<div className="placeholder-note"><FileText size={20}/><div><strong>Forecasting assumptions</strong><p>These are simplified earned-value indicators. They depend on the accuracy of your saved budget, progress, and recorded cost values.</p></div></div></section>
        ) : activeNav === 'Reports' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / REPORTING</div><h1>Reports<span className="heading-period">.</span></h1><p className="page-description">Export the current project register for review in a spreadsheet.</p><div className="journal-panel record-panel"><div className="panel-heading"><h3>Project summary</h3><span>{apiData?.length ?? 0} projects</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Project</th><th>Code</th><th>Budget</th><th>Recorded cost</th><th>Planned</th><th>Actual</th></tr></thead><tbody>{(apiData ?? []).map(p => <tr key={p.id}><td>{p.name}</td><td>{p.project_code}</td><td>{formatCurrency(p.approved_budget)}</td><td>{formatCurrency(p.recorded_cost)}</td><td>{p.planned_progress}%</td><td>{p.actual_progress}%</td></tr>)}</tbody></table></div></div><button className="primary-button" onClick={() => { const rows = [['Project','Code','Location','Status','Approved budget','Recorded cost','Planned progress','Actual progress'], ...(apiData ?? []).map(p => [p.name,p.project_code,p.location,p.status,p.approved_budget,p.recorded_cost,p.planned_progress,p.actual_progress].map(String))]; const csv = rows.map(r => r.map(v => `"${v.replaceAll('"','""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = 'fieldnote-project-report.csv'; a.click(); URL.revokeObjectURL(url) }}><FileText size={16} /> Export project CSV</button></section>
        ) : activeNav === 'Projects' ? (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / PROJECT CONTROLS</div><div className="functional-heading"><div><h1>Projects<span className="heading-period">.</span></h1><p className="page-description">Manage construction projects and review current status.</p></div><button className="primary-button" onClick={() => setProjectFormOpen(!projectFormOpen)}><Plus size={16} /> New project</button></div>{pageError && <div className="connection-warning">{pageError}</div>}{formMessage && <div className="success-message">{formMessage}</div>}
            {projectFormOpen && <form className="record-form" onSubmit={e => { e.preventDefault(); void submitRecord('/projects', { ...projectForm, approved_budget: Number(projectForm.approved_budget), recorded_cost: Number(projectForm.recorded_cost), planned_progress: Number(projectForm.planned_progress), actual_progress: Number(projectForm.actual_progress), start_date: projectForm.start_date || null, end_date: projectForm.end_date || null }, () => { setProjectFormOpen(false); setProjectForm({ name: '', project_code: '', location: '', approved_budget: '0', recorded_cost: '0', planned_progress: '0', actual_progress: '0', start_date: '', end_date: '', status: 'Active' }) }) }}><label>Project name<input required value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} /></label><label>Project code<input required value={projectForm.project_code} onChange={e => setProjectForm({ ...projectForm, project_code: e.target.value })} /></label><label>Location<input required value={projectForm.location} onChange={e => setProjectForm({ ...projectForm, location: e.target.value })} /></label><label>Approved budget (₹)<input required type="number" min="0" value={projectForm.approved_budget} onChange={e => setProjectForm({ ...projectForm, approved_budget: e.target.value })} /></label><label>Recorded cost (₹)<input type="number" min="0" value={projectForm.recorded_cost} onChange={e => setProjectForm({ ...projectForm, recorded_cost: e.target.value })} /></label><label>Planned progress %<input type="number" min="0" max="100" value={projectForm.planned_progress} onChange={e => setProjectForm({ ...projectForm, planned_progress: e.target.value })} /></label><label>Actual progress %<input type="number" min="0" max="100" value={projectForm.actual_progress} onChange={e => setProjectForm({ ...projectForm, actual_progress: e.target.value })} /></label><label>Start date<input type="date" value={projectForm.start_date} onChange={e => setProjectForm({ ...projectForm, start_date: e.target.value })} /></label><label>End date<input type="date" value={projectForm.end_date} onChange={e => setProjectForm({ ...projectForm, end_date: e.target.value })} /></label><button className="primary-button" type="submit">Save project</button></form>}
            <div className="journal-panel record-panel"><div className="panel-heading"><h3>Project register</h3><span>{apiData?.length ?? 0} projects</span></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Project</th><th>Status</th><th>Approved budget</th><th>Recorded cost</th><th>Progress</th></tr></thead><tbody>{(apiData ?? []).map(item => <tr key={item.id}><td><div className="task-name">{item.name}</div><div className="task-meta">{item.project_code} · {item.location}</div></td><td>{item.status}</td><td>{formatCurrency(item.approved_budget)}</td><td>{formatCurrency(item.recorded_cost)}</td><td>{item.actual_progress}%</td></tr>)}</tbody></table>{(apiData ?? []).length === 0 && <p className="empty-state">No projects found in the database.</p>}</div></div></section>
        ) : (
          <section className="placeholder-page"><div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / PROJECT CONTROLS</div><h1>{pageTitle}<span className="heading-period">.</span></h1><p className="page-description">{activeNav === 'Settings' ? 'Local workspace settings.' : 'Help and support for the FIELDNOTE prototype.'}</p><div className="placeholder-note"><FileText size={20}/><div><strong>Workspace information</strong><p>FIELDNOTE is a local prototype. Keep the backend running while using the app so saved records stay connected to your SQLite database.</p></div></div><button className="primary-button" onClick={() => setActiveNav('Dashboard')}><ArrowRight size={16}/> Return to dashboard</button></section>
          )}
        </div>
        </main>
    </div>
  )
}

export default App

