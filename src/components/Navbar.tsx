import React from 'react';
import { useTickets } from '../context/TicketContext';
import { Role } from '../types';
import { 
  GraduationCap, 
  UserCog, 
  Building, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchUser, resetToDemoData } = useTickets();

  const roles: { role: Role; label: string; icon: React.ReactNode; desc: string }[] = [
    { role: 'STUDENT', label: 'Student', icon: <GraduationCap size={15} />, desc: 'Aarav Sharma' },
    { role: 'STAFF', label: 'Staff Agent', icon: <UserCog size={15} />, desc: 'Priya Nair (Accounts)' },
    { role: 'HOD', label: 'Dept HOD', icon: <Building size={15} />, desc: 'Prof. Sundaram (Academics)' },
    { role: 'DEAN', label: 'Dean / Management', icon: <ShieldAlert size={15} />, desc: 'Dr. Ramanathan' },
  ];

  return (
    <header>
      {/* Top Interactive Role Switcher Banner */}
      <div className="role-banner">
        <div className="role-banner-left">
          <div className="role-tagline">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#818CF8" /> Interactive Role Switcher:
            </span>
          </div>

          <div className="role-switcher-group">
            {roles.map(item => (
              <button
                key={item.role}
                onClick={() => switchUser(item.role)}
                className={`role-btn ${currentUser.role === item.role ? 'active' : ''}`}
                title={`Switch view to ${item.desc}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="demo-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span>SLA Engine Online</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all tickets and audit history to initial sample state?')) {
                resetToDemoData();
              }
            }}
            className="btn-ghost-sm"
            title="Reload realistic university tickets and activity trails"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main SaaS Navigation Bar */}
      <nav className="header-nav">
        <div className="brand-wrapper">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="brand-title">
              EduMerge <span>CampusDesk</span>
              <span className="brand-badge">Enterprise Edition</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Student Support, SLA Tracking & Ticket Ageing Engine
            </div>
          </div>
        </div>

        <div className="header-user-profile">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="user-avatar"
          />
          <div className="user-meta">
            <span className="user-meta-name">{currentUser.name}</span>
            <span className="user-meta-role">
              {currentUser.role === 'STUDENT'
                ? `${currentUser.studentId} • ${currentUser.course}`
                : currentUser.departmentName || `${currentUser.role} Administration`}
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
};
