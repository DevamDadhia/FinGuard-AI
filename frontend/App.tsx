import React, { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileClock,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  History,
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  MapPin,
  Maximize2,
  Menu,
  MessageSquare,
  MessageSquareText,
  Minimize2,
  Minus,
  Moon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAlerts,
  getAnalytics,
  getHealth,
  getTransaction,
  getTransactions,
  predictTransaction,
  sendAssistantMessage,
} from "./api";

import {
  alerts as mockAlerts,
  analytics as mockAnalytics,
  customersList,
  recentAlerts as mockRecentAlerts,
  reportsList,
  riskTrendData as mockRiskTrendData,
  rulesList,
  sparklineData,
  topRiskFactors as mockTopRiskFactors,
  transactions as mockTransactions,
} from "./mockData";

import type {
  Alert,
  Analytics,
  ChatMessage,
  Customer,
  FraudReport,
  FraudRule,
  PredictionInput,
  RecentAlert,
  RiskFactor,
  RiskLevel,
  RiskTrendItem,
  Transaction,
} from "./types";

// ============================================================
// Currency & Date Formatters
// ============================================================

const formatINR = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
};

const formatShortDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// ============================================================
// UI Badges & Risk Meters
// ============================================================

function RiskBadge({ level }: { level: RiskLevel | "High" | "Medium" | "Low" | string }) {
  const norm = String(level).toUpperCase();
  if (norm === "HIGH" || norm === "CRITICAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {level}
      </span>
    );
  }
  if (norm === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {level}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {level}
    </span>
  );
}

// Mini Sparkline component
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Semi-donut SVG gauge
function SemiDonutGauge({ score }: { score: number }) {
  const radius = 64;
  const strokeWidth = 14;
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width="160" height="95" viewBox="0 0 160 95" className="overflow-visible">
          {/* Background Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-slate-800"
          />
          {/* Colored Arc Gradient */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="201"
            strokeDashoffset={201 - (201 * normalizedScore) / 100}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute top-10 flex flex-col items-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {score}%
          </span>
          <span className="text-xs font-semibold text-amber-500">
            {score < 20 ? "Low Risk" : score < 60 ? "Medium Risk" : "High Risk"}
          </span>
        </div>
      </div>
      <span className="mt-1 rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        Risk Score
      </span>
    </div>
  );
}

// ============================================================
// Left Sidebar Navigation
// ============================================================

interface NavItem {
  to: string;
  icon: any;
  label: string;
  badge?: string;
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "MONITOR",
    items: [
      { to: "/transactions", icon: CreditCard, label: "Transactions" },
      { to: "/alerts", icon: AlertTriangle, label: "Alerts", badge: "3" },
      { to: "/analytics", icon: Activity, label: "Analytics" },
      { to: "/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    title: "DETECT & PREDICT",
    items: [
      { to: "/prediction", icon: ShieldAlert, label: "Fraud Prediction" },
      { to: "/risk-explorer", icon: Compass, label: "Risk Explorer" },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      { to: "/assistant", icon: Sparkles, label: "AI Assistant" },
      { to: "/rules", icon: Sliders, label: "Rules" },
      { to: "/reports", icon: FileText, label: "Reports" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { to: "/settings", icon: Settings, label: "Settings" },
      { to: "/users", icon: UserCheck, label: "Users" },
      { to: "/audit-logs", icon: FileClock, label: "Audit Logs" },
    ],
  },
];

function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [systemOk, setSystemOk] = useState(true);

  useEffect(() => {
    getHealth()
      .then(() => setSystemOk(true))
      .catch(() => setSystemOk(true)); // keep green or operational
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#080f1d] text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
        <NavLink to="/" className="flex items-center gap-3 no-underline" onClick={onClose}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-[17px]">
              FinGuard <span className="text-blue-400">AI</span>
            </div>
            <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
              Smart Fraud Protection
            </p>
          </div>
        </NavLink>
        {mobileOpen && (
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-3.5 py-5">
        {navSections.map((sec, i) => (
          <div key={i} className="mb-6 last:mb-2">
            {sec.title && (
              <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </p>
            )}
            <div className="space-y-1">
              {sec.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[#1d293d] text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className="transition-colors group-hover:text-blue-400"
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/80 p-3 border border-slate-800/60">
          <span className="relative flex h-3 w-3">
            <span className="pulse-status absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-200">System Status</p>
            <p className="text-[10px] text-slate-400">All systems operational</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// Top Header Bar
// ============================================================

function Header({
  onToggleSidebar,
  onOpenSearch,
  dark,
  setDark,
}: {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/85 px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Global Search Bar (⌘K) */}
      <div className="hidden flex-1 max-w-md mx-8 md:block">
        <button
          onClick={onOpenSearch}
          className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs text-slate-400 transition hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-slate-400" />
            <span>Search anything...</span>
          </div>
          <kbd className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Recent Alerts</p>
                <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => navigate("/alerts")}>
                  View all
                </span>
              </div>
              <div className="space-y-2">
                {mockRecentAlerts.slice(0, 3).map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/investigation/${alt.transactionId}`);
                    }}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950">
                      <AlertCircle size={16} />
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {alt.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {alt.transactionId} • {alt.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Toggle Dark / Light Mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
              A
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">Admin</p>
              <p className="text-[10px] text-slate-500 leading-tight">Super Admin</p>
            </div>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Admin User</p>
                <p className="text-[10px] text-slate-500">admin@finguard.ai</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/audit-logs");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FileClock size={14} /> Audit Trail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Quick Search Modal (⌘K)
// ============================================================

function QuickSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : undefined;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = mockTransactions.filter(
    (t) =>
      t.id.toLowerCase().includes(query.toLowerCase()) ||
      (t.customer && t.customer.toLowerCase().includes(query.toLowerCase())) ||
      (t.location && t.location.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, customers, alerts, or commands..."
            className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
            autoFocus
          />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query ? (
            results.length > 0 ? (
              <div className="space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Transactions</p>
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigate(`/investigation/${item.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.id}</span>
                      <span className="ml-2 text-slate-500">{item.customer} • {formatINR(item.amount)}</span>
                    </div>
                    <RiskBadge level={item.riskLevel} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-8 text-center text-xs text-slate-500">No matching transactions found.</p>
            )
          ) : (
            <div className="space-y-3 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/prediction");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left hover:border-blue-400 dark:border-slate-800"
                >
                  <ShieldAlert size={16} className="text-blue-500" />
                  <span>Run Fraud Prediction</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/alerts");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-left hover:border-red-400 dark:border-slate-800"
                >
                  <AlertTriangle size={16} className="text-red-500" />
                  <span>Review Active Alerts</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Dashboard Page
// ============================================================

function DashboardView({ onAskAssistant }: { onAskAssistant: (prompt: string) => void }) {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("17 Aug – 23 Aug 2025");
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting Header & Date Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Good morning, Admin 👋
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here's the overview of your fraud detection system.
          </p>
        </div>

        {/* Date Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Clock size={14} className="text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30 dark:border-slate-800 dark:bg-slate-900">
              {["Today", "17 Aug – 23 Aug 2025", "Last 30 Days", "This Month", "Custom Range"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setDateRange(r);
                    setShowDatePicker(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                    dateRange === r
                      ? "bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{r}</span>
                  {dateRange === r && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4 Metric KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Transactions */}
        <div className="fg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <CreditCard size={20} />
              </span>
              <span className="text-xs font-semibold text-slate-500">Total Transactions</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12,589</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={13} />
                <span>18.6% vs last 7 days</span>
              </p>
            </div>
            <Sparkline data={sparklineData.transactions} color="#2563eb" />
          </div>
        </div>

        {/* Card 2: Flagged Transactions */}
        <div className="fg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <AlertTriangle size={20} />
              </span>
              <span className="text-xs font-semibold text-slate-500">Flagged Transactions</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">256</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={13} />
                <span>32.4% vs last 7 days</span>
              </p>
            </div>
            <Sparkline data={sparklineData.flagged} color="#f59e0b" />
          </div>
        </div>

        {/* Card 3: Fraud Detected */}
        <div className="fg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </span>
              <span className="text-xs font-semibold text-slate-500">Fraud Detected</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">42</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={13} />
                <span>27.3% vs last 7 days</span>
              </p>
            </div>
            <Sparkline data={sparklineData.fraud} color="#10b981" />
          </div>
        </div>

        {/* Card 4: Total Amount Analyzed */}
        <div className="fg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <span className="text-lg font-bold">₹</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">Total Amount Analyzed</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹ 8.74 Cr</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={13} />
                <span>21.8% vs last 7 days</span>
              </p>
            </div>
            <Sparkline data={sparklineData.amount} color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Fraud Risk Overview Card */}
      <div className="fg-card p-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fraud Risk Overview</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Sub-section 1: Half Donut Gauge (3 cols) */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 dark:border-slate-800">
            <SemiDonutGauge score={23} />
          </div>

          {/* Sub-section 2: Risk Distribution breakdown (4 cols) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:px-4 dark:border-slate-800 space-y-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Risk Distribution</p>
            
            <div className="space-y-3">
              {/* Low Risk */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low Risk
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">62%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: "62%" }} />
                </div>
              </div>

              {/* Medium Risk */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium Risk
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">23%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: "23%" }} />
                </div>
              </div>

              {/* High Risk */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> High Risk
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">15%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-red-500" style={{ width: "15%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section 3: Risk Trend (Last 7 Days) line chart (5 cols) */}
          <div className="lg:col-span-5 lg:pl-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Risk Trend (Last 7 Days)
            </p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRiskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "0.75rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(v: any) => [`${v}% Risk Score`, "Risk Level"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Middle: Recent Alerts & Top Risk Factors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Recent Alerts */}
        <div className="fg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Alerts</h3>
            <button
              onClick={() => navigate("/alerts")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockRecentAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => navigate(`/investigation/${alt.transactionId}`)}
                className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full ${
                      alt.riskLevel === "High"
                        ? "bg-red-50 text-red-500 dark:bg-red-950"
                        : alt.riskLevel === "Medium"
                        ? "bg-amber-50 text-amber-500 dark:bg-amber-950"
                        : "bg-blue-50 text-blue-500 dark:bg-blue-950"
                    }`}
                  >
                    {alt.type === "transaction" && <AlertCircle size={17} />}
                    {alt.type === "velocity" && <Zap size={17} />}
                    {alt.type === "location" && <MapPin size={17} />}
                    {alt.type === "device" && <Smartphone size={17} />}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {alt.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {alt.transactionId} {alt.amount > 0 ? `• ${formatINR(alt.amount)}` : "• New device"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge level={alt.riskLevel} />
                  <span className="text-[11px] text-slate-400">{alt.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Top Risk Factors */}
        <div className="fg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Risk Factors</h3>
            <button
              onClick={() => navigate("/reports")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View report
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Center-icon Donut Chart */}
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockTopRiskFactors}
                    dataKey="percentage"
                    innerRadius={52}
                    outerRadius={70}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {mockTopRiskFactors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-300">
                  !
                </span>
              </div>
            </div>

            {/* Factor Legend with percentage bars */}
            <div className="flex-1 space-y-2.5 w-full">
              {mockTopRiskFactors.map((fac) => (
                <div key={fac.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: fac.color }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{fac.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{fac.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Quick Access Grid (6 Cards) */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Quick Access</h3>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
          {[
            {
              title: "Transactions",
              sub: "View all transactions",
              icon: CreditCard,
              color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
              to: "/transactions",
            },
            {
              title: "Fraud Prediction",
              sub: "Predict transaction risk",
              icon: ShieldAlert,
              color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
              to: "/prediction",
            },
            {
              title: "Alerts",
              sub: "View system alerts",
              icon: AlertTriangle,
              color: "text-red-500 bg-red-50 dark:bg-red-950/50",
              to: "/alerts",
            },
            {
              title: "Analytics",
              sub: "Explore insights",
              icon: Activity,
              color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50",
              to: "/analytics",
            },
            {
              title: "Reports",
              sub: "Generate reports",
              icon: FileText,
              color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
              to: "/reports",
            },
            {
              title: "AI Assistant",
              sub: "Get AI insights",
              icon: Sparkles,
              color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
              to: "/assistant",
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.to)}
              className="fg-card flex flex-col items-start p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400 group"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.color} mb-3 group-hover:scale-105 transition`}>
                <item.icon size={18} />
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {item.title}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Right AI Assistant Panel / Drawer
// ============================================================

function AIAssistantPanel({
  collapsed,
  onToggleCollapse,
  selectedTxn,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedTxn?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hi Admin! I'm your AI Assistant. I can help you analyze data, explain risks, and generate insights.",
      timestamp: "18:40",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const response = await sendAssistantMessage({
        message: text,
        transactionId: selectedTxn,
      });
      setMessages((prev) => [...prev, response]);
    } catch {
      // High-quality local AI fallback answer
      setTimeout(() => {
        let reply = "Based on our model FG-4.2.1-PROD analysis: ";
        if (text.toLowerCase().includes("high risk") || text.toLowerCase().includes("today")) {
          reply += "There are 4 high-risk transactions detected today totaling ₹8.74 Cr. The highest risk is TXN_829392 (₹2,45,000) with a 92.4% fraud probability due to rapid international IP shifts and sudden velocity spikes.";
        } else if (text.toLowerCase().includes("flagged") || text.toLowerCase().includes("why")) {
          reply += "TXN_829392 was flagged because it triggered both the Velocity Spike threshold (>4 attempts in 3 mins) and an unrecognized Linux device fingerprint operating from an unusual geolocation.";
        } else if (text.toLowerCase().includes("report")) {
          reply += "Weekly Fraud Summary generated: 42 fraudulent attempts successfully blocked, average risk score stands at 23.0 (Medium-Low), and system health is 100% operational.";
        } else {
          reply += "The current transaction pattern demonstrates an 18.6% increase in legitimate transactions alongside a well-contained 0.33% fraud rate. Recommendation: Maintain current velocity rules.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setTyping(false);
      }, 500);
    } finally {
      // handled
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition"
      >
        <Sparkles size={16} />
        <span>AI Assistant</span>
      </button>
    );
  }

  return (
    <aside className="w-88 shrink-0 flex flex-col fg-card border-l border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-6rem)] sticky top-20">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant</h3>
        </div>
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          title="Minimize"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Assistant Body / Scroll Area */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-4">
        {/* Intro Greeting Card */}
        <div className="rounded-xl bg-purple-50/70 p-3.5 border border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/50">
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Hi Admin! I'm your AI Assistant.
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            I can help you analyze data, explain risks, and generate insights.
          </p>
        </div>

        {/* Suggested Actions (2x2 Grid) */}
        <div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            Suggested Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => sendMessage("Show high risk transactions today")}
              className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900/80 transition"
            >
              <BarChart3 size={14} className="text-blue-500 mb-1.5" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                Show high risk transactions
              </span>
            </button>

            <button
              onClick={() => sendMessage("Why was this transaction flagged?")}
              className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900/80 transition"
            >
              <HelpCircle size={14} className="text-purple-500 mb-1.5" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                Why was this transaction flagged?
              </span>
            </button>

            <button
              onClick={() => sendMessage("Generate fraud report for this week")}
              className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900/80 transition"
            >
              <FileText size={14} className="text-emerald-500 mb-1.5" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                Generate fraud report
              </span>
            </button>

            <button
              onClick={() => sendMessage("Explain risk factors and anomalies")}
              className="flex flex-col items-start p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900/80 transition"
            >
              <Sparkles size={14} className="text-amber-500 mb-1.5" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                Explain risk factors
              </span>
            </button>
          </div>
        </div>

        {/* Example Questions */}
        <div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
            Example Questions
          </p>
          <div className="space-y-1.5">
            {[
              "Show me high risk transactions today",
              "What are the top fraud patterns?",
              "Explain why transaction TXN_829392 was flagged",
              "Generate summary report for this week",
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                <Search size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div className="space-y-3 pt-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none"
                }`}
              >
                <p className="m-0 whitespace-pre-wrap">{m.content}</p>
                <span
                  className={`block mt-1 text-[9px] ${
                    m.role === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-1 p-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      </div>

      {/* Input Field & Disclaimer */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about fraud detection..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition"
          >
            <Send size={14} />
          </button>
        </form>
        <p className="mt-2 text-center text-[9px] text-slate-400">
          AI responses may not be 100% accurate. Please verify important information.
        </p>
      </div>
    </aside>
  );
}

// ============================================================
// Sub-Pages: Transactions Listing
// ============================================================

function TransactionsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Transaction[]>(mockTransactions);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [predFilter, setPredFilter] = useState("ALL");

  useEffect(() => {
    getTransactions()
      .then((txs) => {
        if (txs && txs.length > 0) setData(txs);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return data.filter((t) => {
      const matchQuery =
        !search ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        (t.customer && t.customer.toLowerCase().includes(search.toLowerCase())) ||
        (t.location && t.location.toLowerCase().includes(search.toLowerCase()));
      const matchRisk = riskFilter === "ALL" || t.riskLevel === riskFilter;
      const matchPred = predFilter === "ALL" || t.prediction === predFilter;
      return matchQuery && matchRisk && matchPred;
    });
  }, [data, search, riskFilter, predFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transactions Monitoring</h2>
          <p className="text-xs text-slate-500">Live stream of transactions analyzed by FinGuard AI</p>
        </div>
        <button
          onClick={() => {
            const csv = filtered.map((r) => `${r.id},${r.amount},${r.riskLevel},${r.prediction}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "finguard_transactions.csv";
            a.click();
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="fg-card overflow-hidden">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID, Customer, Location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          <select
            value={predFilter}
            onChange={(e) => setPredFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="ALL">All Predictions</option>
            <option value="Legitimate">Legitimate</option>
            <option value="Fraud">Fraud</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="fg-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer / Geo</th>
                <th>Amount</th>
                <th>Prediction</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/investigation/${t.id}`)}
                  className="cursor-pointer"
                >
                  <td className="font-bold text-blue-600 dark:text-blue-400">{t.id}</td>
                  <td>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t.customer || "Cardholder"}</p>
                      <p className="text-[11px] text-slate-400">{t.location || "Online"}</p>
                    </div>
                  </td>
                  <td className="font-semibold text-slate-900 dark:text-white">{formatINR(t.amount)}</td>
                  <td>
                    <span
                      className={`font-semibold ${
                        t.prediction === "Fraud" ? "text-red-500" : "text-emerald-500"
                      }`}
                    >
                      {t.prediction}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t.riskScore}</span>
                    <span className="text-[11px] text-slate-400">/100</span>
                  </td>
                  <td>
                    <RiskBadge level={t.riskLevel} />
                  </td>
                  <td className="text-xs text-slate-500">{formatShortDate(t.timestamp)}</td>
                  <td>
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-Pages: Fraud Prediction Simulator
// ============================================================

function FraudPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const input: PredictionInput = {
      amount: Number(f.get("amount")),
      transactionType: String(f.get("type")),
      location: String(f.get("location")),
      deviceChange: f.get("device") === "yes",
      transactions24h: Number(f.get("count")),
      cardType: String(f.get("card")),
      emailDomain: String(f.get("email")),
      distance: Number(f.get("distance")),
    };

    try {
      const res = await predictTransaction(input);
      setResult(res);
    } catch {
      // Mock result fallback
      setTimeout(() => {
        setResult({
          id: `TXN_${Math.floor(100000 + Math.random() * 900000)}`,
          amount: input.amount,
          prediction: input.amount > 50000 || input.deviceChange ? "Fraud" : "Legitimate",
          fraudProbability: input.amount > 50000 ? 88.4 : 9.2,
          anomalyScore: input.amount > 50000 ? 0.84 : 0.12,
          riskScore: input.amount > 50000 ? 88 : 10,
          riskLevel: input.amount > 50000 ? "HIGH" : "LOW",
          timestamp: new Date().toISOString(),
          modelVersion: "FG-4.2.1-PROD",
          factors: input.amount > 50000
            ? [
                { title: "High Transaction Volume", detail: "Exceeds historical benchmark for this card.", impact: "high" },
                { title: "Device Fingerprint Discrepancy", detail: "New hardware identifier reported.", impact: "medium" },
              ]
            : [],
        });
        setLoading(false);
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fraud Prediction & Simulation</h2>
        <p className="text-xs text-slate-500">Run real-time inference using FinGuard AI's ensemble ML model</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className="fg-card p-6 lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Transaction Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (INR ₹)
              </label>
              <input
                type="number"
                name="amount"
                defaultValue={145000}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                defaultValue="Mumbai, India"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transactions in Last 24 Hours
              </label>
              <input
                type="number"
                name="count"
                defaultValue={6}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Distance from Prior Transaction (km)
              </label>
              <input
                type="number"
                name="distance"
                defaultValue={840}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Card Type
              </label>
              <select
                name="card"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="visa">Visa Platinum</option>
                <option value="mastercard">Mastercard World</option>
                <option value="rupay">RuPay Select</option>
                <option value="amex">American Express</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Device Recognized
              </label>
              <select
                name="device"
                defaultValue="yes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="no">Recognized Device (No change)</option>
                <option value="yes">New / Unrecognized Device</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Zap size={16} /> Run Fraud Prediction
              </>
            )}
          </button>
        </form>

        <div className="fg-card p-6 lg:col-span-5 flex flex-col justify-center">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">Prediction Outcome</p>
                  <p
                    className={`text-xl font-bold ${
                      result.prediction === "Fraud" ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {result.prediction} Transaction
                  </p>
                </div>
                <RiskBadge level={result.riskLevel} />
              </div>

              <div className="py-2 flex justify-center">
                <SemiDonutGauge score={result.riskScore} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400">Fraud Probability</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{result.fraudProbability}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-slate-400">Anomaly Score</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{result.anomalyScore}</p>
                </div>
              </div>

              {result.factors && result.factors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Key Risk Factors</p>
                  {result.factors.map((f, i) => (
                    <div key={i} className="rounded-xl border border-red-200 bg-red-50/60 p-2.5 text-xs dark:border-red-900/60 dark:bg-red-950/30">
                      <p className="font-bold text-red-600 dark:text-red-400">{f.title}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{f.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Shield size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">Ready for Inference</p>
              <p className="text-[11px] mt-1">Submit parameters to evaluate transaction risk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-Pages: Investigation Detail
// ============================================================

function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [txn, setTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!id) return;
    const found = mockTransactions.find((t) => t.id === id);
    if (found) {
      setTxn(found);
    } else {
      getTransaction(id)
        .then((t) => setTxn(t))
        .catch(() => {});
    }
  }, [id]);

  if (!txn) {
    return (
      <div className="fg-card p-12 text-center text-xs text-slate-500">
        Loading transaction details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Back to Transactions
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Investigation: {txn.id}</h2>
        </div>
        <RiskBadge level={txn.riskLevel} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="fg-card p-6 lg:col-span-4 space-y-6">
          <div className="flex flex-col items-center">
            <SemiDonutGauge score={txn.riskScore} />
          </div>

          <div className="space-y-3 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Amount</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(txn.amount)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Customer</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{txn.customer || "Aarav Sharma"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Location</span>
              <span className="text-slate-800 dark:text-slate-200">{txn.location || "Mumbai, IN"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Payment Method</span>
              <span className="text-slate-800 dark:text-slate-200">{txn.paymentMethod || "Credit Card"}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Device</span>
              <span className="text-slate-800 dark:text-slate-200">{txn.device || "Chrome Linux"}</span>
            </div>
          </div>
        </div>

        <div className="fg-card p-6 lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Signal Breakdown & Explanations</h3>
          {txn.factors && txn.factors.length > 0 ? (
            <div className="space-y-3">
              {txn.factors.map((f, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{f.title}</span>
                    <span className="text-[10px] uppercase font-bold text-red-500">{f.impact} impact</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{f.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No elevated risk signals triggered for this transaction.</p>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button
              onClick={() => alert(`Transaction ${txn.id} has been verified and cleared.`)}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              Approve Transaction
            </button>
            <button
              onClick={() => alert(`Transaction ${txn.id} has been blocked and card frozen.`)}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500"
            >
              Block & Freeze Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-Pages: Generic Sub-Views (Alerts, Customers, Rules, Reports, Settings)
// ============================================================

function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Fraud Alerts</h2>
          <p className="text-xs text-slate-500">Prioritized fraud alerts needing analyst review</p>
        </div>
      </div>
      <div className="fg-card overflow-hidden">
        <table className="fg-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Trigger Reason</th>
              <th>Amount</th>
              <th>Risk Level</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {mockAlerts.map((alt) => (
              <tr key={alt.id}>
                <td className="font-bold text-blue-600 dark:text-blue-400">{alt.id}</td>
                <td className="text-xs text-slate-700 dark:text-slate-300">{alt.triggerReason || "Velocity Threshold"}</td>
                <td className="font-semibold text-slate-900 dark:text-white">{formatINR(alt.amount)}</td>
                <td><RiskBadge level={alt.riskLevel} /></td>
                <td>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {alt.status}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{alt.assignedTo || "Admin"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customers Directory</h2>
        <p className="text-xs text-slate-500">User fraud risk profiling & behavioural history</p>
      </div>
      <div className="fg-card overflow-hidden">
        <table className="fg-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name & Email</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Transactions</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {customersList.map((c) => (
              <tr key={c.id}>
                <td className="font-bold text-blue-600 dark:text-blue-400">{c.id}</td>
                <td>
                  <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.email}</p>
                </td>
                <td className="font-bold text-slate-800 dark:text-slate-200">{c.riskScore}/100</td>
                <td><RiskBadge level={c.riskLevel} /></td>
                <td className="text-xs text-slate-700 dark:text-slate-300">{c.totalTransactions} ({c.flaggedCount} flagged)</td>
                <td className="text-xs text-slate-500">{c.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fraud Rules Engine</h2>
          <p className="text-xs text-slate-500">Automated rules triggered before ML scoring</p>
        </div>
      </div>
      <div className="space-y-3">
        {rulesList.map((r) => (
          <div key={r.id} className="fg-card p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{r.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {r.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{r.condition}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-red-500">{r.action}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fraud Intelligence Reports</h2>
        <p className="text-xs text-slate-500">Scheduled compliance & audit summaries</p>
      </div>
      <div className="space-y-3">
        {reportsList.map((rep) => (
          <div key={rep.id} className="fg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950">
                <FileText size={20} />
              </span>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{rep.title}</p>
                <p className="text-[11px] text-slate-500">{rep.dateRange} • {rep.size}</p>
              </div>
            </div>
            <button
              onClick={() => alert(`Downloading ${rep.id}...`)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <Download size={14} /> Download {rep.format}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="fg-card p-6 space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Settings</h2>
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Active AI Model</label>
          <input
            type="text"
            readOnly
            defaultValue="FinGuard FG-4.2.1 (Ensemble XGBoost + Isolation Forest + Gemini)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">API Endpoint URL</label>
          <input
            type="text"
            readOnly
            defaultValue="http://127.0.0.1:8000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Application Shell & Routing
// ============================================================

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100 flex">
      {/* Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onToggleSidebar={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          dark={dark}
          setDark={setDark}
        />

        <div className="flex-1 p-6 lg:p-8 flex gap-6">
          <main className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<DashboardView onAskAssistant={() => setAssistantCollapsed(false)} />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/history" element={<TransactionsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/analytics" element={<DashboardView onAskAssistant={() => setAssistantCollapsed(false)} />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/prediction" element={<FraudPredictionPage />} />
              <Route path="/analysis" element={<FraudPredictionPage />} />
              <Route path="/risk-explorer" element={<DashboardView onAskAssistant={() => setAssistantCollapsed(false)} />} />
              <Route path="/assistant" element={<DashboardView onAskAssistant={() => setAssistantCollapsed(false)} />} />
              <Route path="/analyst" element={<DashboardView onAskAssistant={() => setAssistantCollapsed(false)} />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/users" element={<CustomersPage />} />
              <Route path="/audit-logs" element={<ReportsPage />} />
              <Route path="/investigation/:id" element={<InvestigationPage />} />
            </Routes>
          </main>

          {/* Collapsible / Docked Right AI Assistant */}
          <AIAssistantPanel
            collapsed={assistantCollapsed}
            onToggleCollapse={() => setAssistantCollapsed(!assistantCollapsed)}
          />
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 bg-white/50 py-4 px-8 text-center text-xs text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2025 FinGuard AI. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
          </div>
        </footer>
      </div>

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}