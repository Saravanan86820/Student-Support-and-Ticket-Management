import React from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket } from '../../types';
import { X, Download, FileSpreadsheet, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { tickets } = useTickets();

  if (!isOpen) return null;

  const downloadCSV = () => {
    const headers = [
      'Ticket Number',
      'Title',
      'Category',
      'Subcategory',
      'Department',
      'Priority',
      'Status',
      'Student Name',
      'Student ID',
      'Assignee',
      'Created At',
      'Resolution Due At',
      'Resolved At',
      'Escalation Level',
      'CSAT Rating',
    ];

    const rows = tickets.map(t => [
      `"${t.ticketNumber}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.subcategory}"`,
      `"${t.departmentName}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.studentName}"`,
      `"${t.studentEnrollment}"`,
      `"${t.assigneeName || 'Unassigned'}"`,
      `"${t.createdAt}"`,
      `"${t.resolutionDueAt}"`,
      `"${t.resolvedAt || ''}"`,
      `"${t.escalationLevel}"`,
      `"${t.csat?.rating || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusDesk_Support_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const downloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `CampusDesk_Database_Dump_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} color="#818CF8" />
            <h2 className="modal-title">Export Management Audit Report</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select format for auditing campus ticket volume, SLA compliance logs, and department resolution times.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={downloadCSV}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#10B981')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
            >
              <FileSpreadsheet size={28} color="#10B981" />
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>CSV Spreadsheet</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>For Excel & BI Analytics</div>
            </button>

            <button
              onClick={downloadJSON}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#818CF8')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
            >
              <FileCode size={28} color="#818CF8" />
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Full JSON Dump</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Complete activity logs & metadata</div>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
