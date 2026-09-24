import React from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentPortal/StudentDashboard';
import { StaffDashboard } from './components/StaffWorkspace/StaffDashboard';
import { DeanDashboard } from './components/ManagementDashboard/DeanDashboard';
import { ToastContainer } from './components/Common/ToastContainer';
import './styles/index.css';

const MainAppView: React.FC = () => {
  const { currentUser } = useTickets();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {currentUser.role === 'STUDENT' && <StudentDashboard />}
        {(currentUser.role === 'STAFF' || currentUser.role === 'HOD') && <StaffDashboard />}
        {currentUser.role === 'DEAN' && <DeanDashboard />}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 28px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-app)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <strong>EduMerge CampusDesk</strong> • Student Support & SLA Management Platform • Candidate Assessment Prototype
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TicketProvider>
      <MainAppView />
    </TicketProvider>
  );
};

export default App;
