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

  useEffect(() => {
    const controller = new AbortController()

    const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '')

fetch(`${apiBaseUrl}/projects`, { signal: controller.signal })
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
          
        
) : activeNav === 'Projects' ? (
  <section className="placeholder-page">
    <div className="eyebrow">
      <span className="eyebrow-line" />
      FIELDNOTE / PROJECT CONTROLS
    </div>

    <h1>Projects<span className="heading-period">.</span></h1>

    <p className="page-description">
      Manage your construction projects and review their current status.
    </p>

    {loading ? (
      <p>Loading projects...</p>
    ) : apiError ? (
      <div className="placeholder-note">
        <FileText size={20} />
        <div>
          <strong>Unable to load projects</strong>
          <p>Check the backend connection and refresh the page.</p>
        </div>
      </div>
    ) : (
      <div className="journal-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">PROJECT REGISTER</span>
            <h3>All projects</h3>
          </div>
          <span>{apiData?.length ?? 0} projects</span>
        </div>

        <div className="task-table-wrap">
          <table className="task-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Approved budget</th>
                <th>Recorded cost</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {(apiData ?? []).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="task-name">{item.name}</div>
                    <div className="task-meta">
                      {item.project_code} · {item.location}
                    </div>
                  </td>
                  <td>{item.status}</td>
                  <td>{formatCurrency(item.approved_budget)}</td>
                  <td>{formatCurrency(item.recorded_cost)}</td>
                  <td>{item.actual_progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(apiData ?? []).length === 0 && (
          <p>No projects found in the database.</p>
        )}
      </div>
    )}

    <button
      className="primary-button"
      onClick={() => setActiveNav('Dashboard')}
      style={{ marginTop: 20 }}
    >
      <ArrowRight size={16} />
      Return to dashboard
    </button>
  </section>

        ) : (
          <section className="placeholder-page">
              <div className="eyebrow"><span className="eyebrow-line" /> FIELDNOTE / PROJECT CONTROLS</div>
              <h1>{pageTitle}<span className="heading-period">.</span></h1>
              <p className="page-description">
                This workspace section is planned but has not been implemented yet.
                The dashboard is the first completed interface milestone.
              </p>
              <div className="placeholder-note">
                <FileText size={20} />
                <div>
                  <strong>Next implementation step</strong>
                  <p>We'll build this section around real project records, with validated forms and backend calculations.</p>
                </div>
              </div>
              <button className="primary-button" onClick={() => setActiveNav('Dashboard')}>
                <ArrowRight size={16} /> Return to dashboard
              </button>
            </section>
          )}
        </div>
        </main>
    </div>
  )
}

export default App

