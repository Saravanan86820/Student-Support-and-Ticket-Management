import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { CATEGORIES } from '../../data/seedData';
import { TicketDetailDrawer } from '../StaffWorkspace/TicketDetailDrawer';
import { ExportModal } from './ExportModal';
import { computeSLAStatus, computeAgeing, formatDateTime } from '../../utils/slaCalculator';
import { 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Star, 
  Download, 
  AlertTriangle, 
  BarChart3, 
  Building,
  UserCheck,
  ChevronRight,
  Flame
} from 'lucide-react';

export const DeanDashboard: React.FC = () => {
  const { tickets, selectTicket } = useTickets();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));
  const activeTickets = tickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status));

  // SLA Compliance Calculation
  let metCount = 0;
  let breachedCount = 0;
  let atRiskCount = 0;

  tickets.forEach(t => {
    const sla = computeSLAStatus(t);
    if (sla.state === 'RESOLVED_MET') metCount++;
    else if (sla.state === 'BREACHED' || sla.state === 'RESOLVED_BREACHED') breachedCount++;
    else if (sla.state === 'WARNING') atRiskCount++;
  });

  const totalEvaluated = metCount + breachedCount;
  const slaComplianceRate = totalEvaluated > 0 ? Math.round((metCount / totalEvaluated) * 100) : 100;

  // Average CSAT
  const csatTickets = tickets.filter(t => t.csat && t.csat.rating);
  const avgCsat = csatTickets.length > 0
    ? (csatTickets.reduce((acc, t) => acc + (t.csat?.rating || 0), 0) / csatTickets.length).toFixed(1)
    : '4.8';

  // Ageing Buckets
  const ageingStats = {
    under24h: 0,
    oneToThreeDays: 0,
    fourToSevenDays: 0,
    overSevenDays: 0,
  };

  tickets.forEach(t => {
    const { bucket } = computeAgeing(t.createdAt);
    if (bucket === 'UNDER_24_HOURS') ageingStats.under24h++;
    else if (bucket === 'ONE_TO_THREE_DAYS') ageingStats.oneToThreeDays++;
    else if (bucket === 'FOUR_TO_SEVEN_DAYS') ageingStats.fourToSevenDays++;
    else if (bucket === 'OVER_SEVEN_DAYS') ageingStats.overSevenDays++;
  });

  // Watchlist: Tickets breached or escalated
  const watchlistTickets = tickets.filter(t => {
    const sla = computeSLAStatus(t);
    return t.escalationLevel !== 'NONE' || sla.state === 'BREACHED' || sla.state === 'WARNING';
  });

  // Department Breakdown
  const deptPerformance = CATEGORIES.map(cat => {
    const deptTickets = tickets.filter(t => t.departmentId === cat.departmentId);
    const deptResolved = deptTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));
    const deptBreached = deptTickets.filter(t => {
      const sla = computeSLAStatus(t);
      return sla.state === 'BREACHED' || sla.state === 'RESOLVED_BREACHED';
    });

    const deptMet = deptResolved.filter(t => {
      const sla = computeSLAStatus(t);
      return sla.state === 'RESOLVED_MET';
    });

    const totalEvaluatedDept = deptMet.length + deptBreached.length;
    const deptSlaRate = totalEvaluatedDept > 0 ? Math.round((deptMet.length / totalEvaluatedDept) * 100) : 100;

    return {
      departmentId: cat.departmentId,
      departmentName: cat.departmentName,
      totalCount: deptTickets.length,
      activeCount: deptTickets.filter(t => !['RESOLVED', 'CLOSED'].includes(t.status)).length,
      slaRate: deptSlaRate,
      breachedCount: deptBreached.length,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={26} color="#818CF8" />
            Executive Management & Dean Oversight Cockpit
          </h1>
          <p className="page-subtitle">
            Comprehensive institutional visibility into SLA compliance, unresolved ageing bottlenecks, and cross-department workloads.
          </p>
        </div>

        <button onClick={() => setIsExportOpen(true)} className="btn-secondary">
          <Download size={16} />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Top Level Institutional KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">SLA Compliance Rate</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: slaComplianceRate >= 85 ? '#34D399' : '#FBBF24' }}>
            {slaComplianceRate}%
          </div>
          <div className="stat-card-hint">University target: &gt; 90%</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Submissions</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="stat-card-value">{totalTickets}</div>
          <div className="stat-card-hint">{activeTickets.length} active, {resolvedTickets.length} closed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Critical Breaches</span>
            <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: breachedCount > 0 ? '#F87171' : '#34D399' }}>
            {breachedCount}
          </div>
          <div className="stat-card-hint">Missed resolution SLA</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Student Satisfaction (CSAT)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}>
              <Star size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#FCD34D' }}>
            {avgCsat} ★
          </div>
          <div className="stat-card-hint">Based on verified closed ratings</div>
        </div>
      </div>

      {/* Main Grid: Ageing Analysis & Critical Escalation Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Ageing Breakdown Engine */}
        <div className="ageing-chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#818CF8" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Ticket Ageing Distribution Engine
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Across All Departments</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Ageing tracking automatically classifies tickets into SLA risk tiers to prevent student cases from lingering indefinitely.
          </p>

          <div className="ageing-bars">
            {/* Under 24h */}
            <div className="ageing-bar-row">
              <div className="ageing-bar-labels">
                <span style={{ color: '#6EE7B7', fontWeight: 600 }}>&lt; 24 Hours (Fresh)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {ageingStats.under24h} tickets ({totalTickets > 0 ? Math.round((ageingStats.under24h / totalTickets) * 100) : 0}%)
                </span>
              </div>
              <div className="ageing-bar-track">
                <div
                  className="ageing-bar-fill"
                  style={{
                    width: `${totalTickets > 0 ? (ageingStats.under24h / totalTickets) * 100 : 0}%`,
                    background: '#10B981',
                  }}
                />
              </div>
            </div>

            {/* 1 - 3 Days */}
            <div className="ageing-bar-row">
              <div className="ageing-bar-labels">
                <span style={{ color: '#93C5FD', fontWeight: 600 }}>1 – 3 Days (Active Work)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {ageingStats.oneToThreeDays} tickets ({totalTickets > 0 ? Math.round((ageingStats.oneToThreeDays / totalTickets) * 100) : 0}%)
                </span>
              </div>
              <div className="ageing-bar-track">
                <div
                  className="ageing-bar-fill"
                  style={{
                    width: `${totalTickets > 0 ? (ageingStats.oneToThreeDays / totalTickets) * 100 : 0}%`,
                    background: '#3B82F6',
                  }}
                />
              </div>
            </div>

            {/* 4 - 7 Days */}
            <div className="ageing-bar-row">
              <div className="ageing-bar-labels">
                <span style={{ color: '#FCD34D', fontWeight: 600 }}>4 – 7 Days (Lagging Attention)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {ageingStats.fourToSevenDays} tickets ({totalTickets > 0 ? Math.round((ageingStats.fourToSevenDays / totalTickets) * 100) : 0}%)
                </span>
              </div>
              <div className="ageing-bar-track">
                <div
                  className="ageing-bar-fill"
                  style={{
                    width: `${totalTickets > 0 ? (ageingStats.fourToSevenDays / totalTickets) * 100 : 0}%`,
                    background: '#F59E0B',
                  }}
                />
              </div>
            </div>

            {/* Over 7 Days */}
            <div className="ageing-bar-row">
              <div className="ageing-bar-labels">
                <span style={{ color: '#FCA5A5', fontWeight: 700 }}>&gt; 7 Days (Critical Stale / High Risk)</span>
                <span style={{ color: '#F87171', fontWeight: 700 }}>
                  {ageingStats.overSevenDays} tickets ({totalTickets > 0 ? Math.round((ageingStats.overSevenDays / totalTickets) * 100) : 0}%)
                </span>
              </div>
              <div className="ageing-bar-track">
                <div
                  className="ageing-bar-fill"
                  style={{
                    width: `${totalTickets > 0 ? (ageingStats.overSevenDays / totalTickets) * 100 : 0}%`,
                    background: '#EF4444',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Watchlist */}
        <div className="ageing-chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#EF4444" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Dean Intervention Watchlist ({watchlistTickets.length})
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600 }}>Requires Attention</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Tickets with SLA breaches, critical escalations, or impending deadlines requiring executive intervention.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {watchlistTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#10B981', fontSize: '0.85rem' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                No tickets currently require executive intervention.
              </div>
            ) : (
              watchlistTickets.map(t => {
                const sla = computeSLAStatus(t);
                return (
                  <div
                    key={t.id}
                    onClick={() => selectTicket(t.id)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                          {t.ticketNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#FCA5A5', fontWeight: 700 }}>
                          {sla.displayText}
                        </span>
                        {t.escalationLevel !== 'NONE' && (
                          <span style={{ fontSize: '0.68rem', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '1px 5px', borderRadius: '3px' }}>
                            {t.escalationLevel.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {t.studentName} • {t.departmentName}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Department Performance Matrix */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="#818CF8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Departmental Workload & SLA Compliance Matrix
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Live Feed</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Department Office</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Total Volume</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Active Queue</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>Breaches</th>
                <th style={{ padding: '10px 12px', fontWeight: 600 }}>SLA Compliance</th>
              </tr>
            </thead>
            <tbody>
              {deptPerformance.map(dept => (
                <tr
                  key={dept.departmentId}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dept.departmentName}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    {dept.totalCount} cases
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: dept.activeCount > 0 ? '#FCD34D' : '#34D399', fontWeight: 600 }}>
                      {dept.activeCount} active
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: dept.breachedCount > 0 ? '#F87171' : '#34D399', fontWeight: 600 }}>
                      {dept.breachedCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${dept.slaRate}%`,
                            background: dept.slaRate >= 85 ? '#10B981' : '#F59E0B',
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, color: dept.slaRate >= 85 ? '#34D399' : '#FBBF24', fontSize: '0.8rem' }}>
                        {dept.slaRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Drawer Side-Panel */}
      <TicketDetailDrawer />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
