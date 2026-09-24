import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  TicketStatus, 
  TicketPriority, 
  EscalationLevel, 
  User, 
  Role 
} from '../../types';
import { DEMO_USERS } from '../../data/seedData';
import { StatusBadge } from '../Common/StatusBadge';
import { PriorityBadge } from '../Common/PriorityBadge';
import { SLABadge } from '../Common/SLABadge';
import { CannedResponsePicker } from './CannedResponsePicker';
import { CSATModal } from '../StudentPortal/CSATModal';
import { 
  X, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Paperclip, 
  Lock, 
  Send, 
  RotateCcw, 
  MessageSquare, 
  Activity, 
  Award,
  ChevronRight,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import { formatDateTime, computeAgeing, computeSLAStatus } from '../../utils/slaCalculator';

export const TicketDetailDrawer: React.FC = () => {
  const {
    selectedTicket,
    selectTicket,
    currentUser,
    updateTicketStatus,
    assignTicket,
    escalateTicket,
    resolveTicket,
    reopenTicket,
    closeTicket,
    addMessage,
    updateTicketPriority,
  } = useTickets();

  const [activeTab, setActiveTab] = useState<'CONVERSATION' | 'TIMELINE' | 'RESOLUTION'>('CONVERSATION');
  const [messageText, setMessageText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Escalation Modal state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalationLevel, setEscalationLevel] = useState<EscalationLevel>('LEVEL_2_HOD');
  const [escalationReason, setEscalationReason] = useState('');

  // Resolution Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [mockAttachmentName, setMockAttachmentName] = useState('Official_Resolution_Approval.pdf');

  // Reopen Modal state
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // CSAT Modal state
  const [isCsatModalOpen, setIsCsatModalOpen] = useState(false);

  if (!selectedTicket) return null;

  const ageing = computeAgeing(selectedTicket.createdAt);
  const sla = computeSLAStatus(selectedTicket);
  const isStudent = currentUser.role === 'STUDENT';
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(selectedTicket.status);

  // Available staff members for assignment
  const staffMembers = DEMO_USERS.filter(u => u.role !== 'STUDENT');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    addMessage(selectedTicket.id, messageText, isInternalNote);
    setMessageText('');
    setIsInternalNote(false);
  };

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationReason.trim()) {
      alert('Please enter a reason for escalation.');
      return;
    }
    escalateTicket(selectedTicket.id, escalationLevel, escalationReason);
    setIsEscalateModalOpen(false);
    setEscalationReason('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) {
      alert('Please provide a resolution summary.');
      return;
    }
    resolveTicket(selectedTicket.id, resolutionSummary, {
      id: `att-res-${Date.now()}`,
      name: mockAttachmentName,
      size: '640 KB',
      type: 'application/pdf',
    });
    setIsResolveModalOpen(false);
    setResolutionSummary('');
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please state why the resolution was unsatisfactory.');
      return;
    }
    reopenTicket(selectedTicket.id, reopenReason);
    setIsReopenModalOpen(false);
    setReopenReason('');
  };

  // Filter messages based on role (hide internal notes from student)
  const visibleMessages = selectedTicket.messages.filter(msg => {
    if (isStudent && msg.isInternal) return false;
    return true;
  });

  return (
    <div className="drawer-overlay" onClick={() => selectTicket(null)}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="ticket-number">{selectedTicket.ticketNumber}</span>
              <StatusBadge status={selectedTicket.status} />
              <PriorityBadge priority={selectedTicket.priority} />
              <SLABadge ticket={selectedTicket} />
            </div>

            <button
              onClick={() => selectTicket(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {selectedTicket.title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged by <strong>{selectedTicket.studentName}</strong> ({selectedTicket.studentEnrollment}) • {formatDateTime(selectedTicket.createdAt)} ({ageing.displayText})
            </div>
          </div>

          {/* Operational Quick Actions for Staff & Admins */}
          {!isStudent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Status Switcher Dropdown */}
                <select
                  value={selectedTicket.status}
                  onChange={e => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                  className="filter-select"
                  style={{ background: '#1E293B', fontWeight: 600 }}
                >
                  <option value="OPEN">Status: Open</option>
                  <option value="ASSIGNED">Status: Assigned</option>
                  <option value="IN_PROGRESS">Status: In Progress</option>
                  <option value="PENDING_STUDENT">Status: Pending Student Action (Pause SLA)</option>
                  <option value="PENDING_INTERNAL_REVIEW">Status: Pending Internal Review</option>
                  <option value="ESCALATED">Status: Escalated</option>
                  <option value="RESOLVED">Status: Resolved</option>
                  <option value="CLOSED">Status: Closed</option>
                </select>

                {/* Priority Switcher */}
                <select
                  value={selectedTicket.priority}
                  onChange={e => updateTicketPriority(selectedTicket.id, e.target.value as TicketPriority)}
                  className="filter-select"
                  style={{ background: '#1E293B' }}
                >
                  <option value="CRITICAL">P1 - Critical (12h SLA)</option>
                  <option value="HIGH">P2 - High (24h SLA)</option>
                  <option value="MEDIUM">P3 - Medium (48h SLA)</option>
                  <option value="LOW">P4 - Low (72h SLA)</option>
                </select>

                {/* Assignee Picker */}
                <select
                  value={selectedTicket.assigneeId || ''}
                  onChange={e => {
                    const target = staffMembers.find(u => u.id === e.target.value);
                    if (target) assignTicket(selectedTicket.id, target);
                  }}
                  className="filter-select"
                  style={{ background: '#1E293B' }}
                >
                  <option value="">Unassigned</option>
                  {staffMembers.map(s => (
                    <option key={s.id} value={s.id}>
                      Assign: {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="btn-secondary"
                  style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <AlertTriangle size={14} /> Escalate
                </button>

                {!isResolvedOrClosed && (
                  <button
                    type="button"
                    onClick={() => setIsResolveModalOpen(true)}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    <CheckCircle2 size={14} /> Resolve Ticket
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Student Actions */}
          {isStudent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
              {selectedTicket.status === 'RESOLVED' && (
                <>
                  <button
                    onClick={() => setIsCsatModalOpen(true)}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                  >
                    <Award size={15} /> Rate Resolution / CSAT
                  </button>
                  <button
                    onClick={() => setIsReopenModalOpen(true)}
                    className="btn-secondary"
                    style={{ color: '#FB923C', borderColor: 'rgba(249, 115, 22, 0.4)' }}
                  >
                    <RotateCcw size={15} /> Reopen Request
                  </button>
                  <button
                    onClick={() => closeTicket(selectedTicket.id)}
                    className="btn-secondary"
                  >
                    <CheckCircle2 size={15} /> Accept & Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="drawer-content">
          {/* Stepper Pipeline */}
          <div className="status-pipeline">
            {[
              { id: 'OPEN', label: '1. Logged' },
              { id: 'IN_PROGRESS', label: '2. Under Review' },
              { id: 'PENDING_STUDENT', label: '3. Student Info' },
              { id: 'RESOLVED', label: '4. Resolved' },
              { id: 'CLOSED', label: '5. Closed' },
            ].map(step => {
              const isCurrent = selectedTicket.status === step.id;
              return (
                <div
                  key={step.id}
                  className={`status-step ${isCurrent ? 'current' : ''}`}
                >
                  <div className="status-step-circle">
                    {isCurrent ? <Clock size={12} /> : '•'}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Pending Student Action Alert if applicable */}
          {selectedTicket.status === 'PENDING_STUDENT' && (
            <div
              style={{
                background: 'rgba(244, 114, 182, 0.12)',
                border: '1px solid rgba(244, 114, 182, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Lock size={20} color="#F472B6" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FDF2F8' }}>
                  SLA Timer Paused (Awaiting Student Action)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#F9A8D4' }}>
                  Total paused duration: {selectedTicket.totalPausedMinutes} minutes. Clock automatically resumes once the student replies.
                </div>
              </div>
            </div>
          )}

          {/* Escalation Notice */}
          {selectedTicket.escalationLevel !== 'NONE' && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <AlertTriangle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FEF2F2' }}>
                  Escalated to {selectedTicket.escalationLevel.replace('_', ' ')}: {selectedTicket.escalatedTo}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#FCA5A5', marginTop: '2px' }}>
                  Reason: "{selectedTicket.escalationReason || 'SLA limit exceeded without resolution'}"
                </div>
              </div>
            </div>
          )}

          {/* Metadata Card: Student & Custom Fields */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Request Specifics & Verification Data
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Department: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTicket.departmentName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Subcategory: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTicket.subcategory}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Target Resolution: </span>
                <span style={{ fontWeight: 600, color: '#A5B4FC', fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(selectedTicket.resolutionDueAt)}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Assigned Officer: </span>
                <span style={{ fontWeight: 600, color: selectedTicket.assigneeName ? '#34D399' : '#F59E0B' }}>
                  {selectedTicket.assigneeName || 'Unassigned'}
                </span>
              </div>

              {/* Dynamic custom fields */}
              {selectedTicket.customFields && Object.entries(selectedTicket.customFields).map(([key, val]) => {
                if (!val) return null;
                return (
                  <div key={key}>
                    <span style={{ color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}:{' '}
                    </span>
                    <strong style={{ color: '#FCD34D' }}>{val}</strong>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>STUDENT STATEMENT:</span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
                {selectedTicket.description}
              </p>
            </div>

            {/* Attachments */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Attachments:</span>
                {selectedTicket.attachments.map(att => (
                  <div
                    key={att.id}
                    onClick={() => alert(`Simulated downloading: ${att.name}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: '#A5B4FC',
                      cursor: 'pointer',
                    }}
                    title="Click to download"
                  >
                    <Paperclip size={12} />
                    <span>{att.name}</span>
                    <span style={{ color: '#6B7280' }}>({att.size})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('CONVERSATION')}
              className={`filter-tab-btn ${activeTab === 'CONVERSATION' ? 'active' : ''}`}
            >
              <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Communication Thread ({visibleMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`filter-tab-btn ${activeTab === 'TIMELINE' ? 'active' : ''}`}
            >
              <Activity size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Activity Audit Trail ({selectedTicket.activityLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('RESOLUTION')}
              className={`filter-tab-btn ${activeTab === 'RESOLUTION' ? 'active' : ''}`}
            >
              <Award size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Resolution & CSAT {selectedTicket.csat ? `(${selectedTicket.csat.rating}★)` : ''}
            </button>
          </div>

          {/* TAB 1: CONVERSATION & NOTES */}
          {activeTab === 'CONVERSATION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="messages-box">
                {visibleMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    No messages in this thread yet.
                  </div>
                ) : (
                  visibleMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message-item ${msg.isInternal ? 'internal-note' : ''}`}
                    >
                      <div className="message-meta">
                        <div className="message-author">
                          {msg.isInternal && <Lock size={12} color="#FBBF24" />}
                          <span style={msg.isInternal ? { color: '#FCD34D' } : {}}>
                            {msg.authorName} ({msg.authorRole})
                          </span>
                          {msg.isInternal && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                background: 'rgba(245, 158, 11, 0.2)',
                                color: '#FBBF24',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 700,
                              }}
                            >
                              STAFF ONLY NOTE
                            </span>
                          )}
                        </div>
                        <span style={{ color: 'var(--text-tertiary)' }}>{formatDateTime(msg.timestamp)}</span>
                      </div>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Internal Note vs Public toggle (Only for Staff/Dean) */}
                  {!isStudent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={e => setIsInternalNote(e.target.checked)}
                        />
                        <span style={isInternalNote ? { color: '#FCD34D', fontWeight: 600 } : { color: 'var(--text-secondary)' }}>
                          🔒 Internal Staff Note (Invisible to Student)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Replying to Department Officer
                    </span>
                  )}

                  {/* Canned reply dropdown */}
                  {!isStudent && (
                    <CannedResponsePicker
                      category={selectedTicket.category}
                      onSelect={text => setMessageText(prev => prev ? `${prev}\n\n${text}` : text)}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    className="form-textarea"
                    placeholder={
                      isInternalNote
                        ? 'Write internal notes for colleagues or HOD (e.g. verified with bank branch, pending stamp)...'
                        : isStudent
                        ? 'Provide requested details or follow up with staff...'
                        : 'Reply to student...'
                    }
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    style={{
                      flex: 1,
                      minHeight: '75px',
                      background: isInternalNote ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-secondary)',
                      borderColor: isInternalNote ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      alignSelf: 'flex-end',
                      background: isInternalNote ? '#D97706' : undefined,
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL & ACTIVITY LOGS */}
          {activeTab === 'TIMELINE' && (
            <div className="timeline">
              {selectedTicket.activityLogs.map(log => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-header">
                    <span className="timeline-actor">
                      {log.actorName} ({log.actorRole})
                    </span>
                    <span>{formatDateTime(log.timestamp)}</span>
                  </div>
                  <div className="timeline-text">{log.details}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RESOLUTION & CSAT */}
          {activeTab === 'RESOLUTION' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedTicket.resolutionSummary ? (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} />
                    <span>Official Resolution Note</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#F8FAFC', marginTop: '8px', lineHeight: 1.5 }}>
                    {selectedTicket.resolutionSummary}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#A7F3D0', marginTop: '6px' }}>
                    Resolved at: {formatDateTime(selectedTicket.resolvedAt)}
                  </div>

                  {selectedTicket.resolutionAttachment && (
                    <div
                      onClick={() => alert(`Simulated downloading resolution file: ${selectedTicket.resolutionAttachment?.name}`)}
                      style={{
                        marginTop: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        color: '#6EE7B7',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <FileDown size={14} />
                      <span>Download: {selectedTicket.resolutionAttachment.name}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  This request has not been marked resolved yet.
                </div>
              )}

              {/* CSAT Section */}
              {selectedTicket.csat ? (
                <div
                  style={{
                    background: 'rgba(251, 191, 36, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FCD34D' }}>
                      Student Satisfaction Feedback
                    </div>
                    <div style={{ color: '#FBBF24', fontWeight: 800, fontSize: '1rem' }}>
                      {'★'.repeat(selectedTicket.csat.rating)}{'☆'.repeat(5 - selectedTicket.csat.rating)} ({selectedTicket.csat.rating}/5)
                    </div>
                  </div>

                  {selectedTicket.csat.feedback && (
                    <p style={{ fontSize: '0.85rem', color: '#FEF3C7', marginTop: '8px', fontStyle: 'italic' }}>
                      "{selectedTicket.csat.feedback}"
                    </p>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#FDE68A', marginTop: '6px' }}>
                    Submitted: {formatDateTime(selectedTicket.csat.submittedAt)}
                  </div>
                </div>
              ) : selectedTicket.status === 'RESOLVED' && isStudent ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <button onClick={() => setIsCsatModalOpen(true)} className="btn-primary" style={{ margin: '0 auto' }}>
                    <Award size={16} /> Rate Your Experience
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Escalation Modal */}
      {isEscalateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEscalateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#EF4444" />
                <h2 className="modal-title">Escalate Ticket</h2>
              </div>
              <button onClick={() => setIsEscalateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEscalateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Escalation Tier</label>
                  <select
                    className="form-select"
                    value={escalationLevel}
                    onChange={e => setEscalationLevel(e.target.value as EscalationLevel)}
                  >
                    <option value="LEVEL_2_HOD">Level 2: Department Head (HOD - Prof. Sundaram)</option>
                    <option value="LEVEL_3_DEAN">Level 3: Dean of Student Affairs (Dr. Ramanathan)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Escalation / Blocker</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Explain why this requires senior intervention (e.g. SLA breach imminent, inter-departmental dispute, special sanction needed)..."
                    value={escalationReason}
                    onChange={e => setEscalationReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEscalateModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#EF4444' }}>
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {isResolveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResolveModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10B981" />
                <h2 className="modal-title">Mark Ticket as Resolved</h2>
              </div>
              <button onClick={() => setIsResolveModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resolution Summary (Visible to Student)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Detail the steps taken, ledger updates made, or how the student should proceed..."
                    value={resolutionSummary}
                    onChange={e => setResolutionSummary(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deliverable Document (Certificate, Fee Receipt, Clearance Slip)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mockAttachmentName}
                    onChange={e => setMockAttachmentName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsResolveModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#10B981' }}>
                  Complete Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {isReopenModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReopenModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="#FB923C" />
                <h2 className="modal-title">Reopen Ticket</h2>
              </div>
              <button onClick={() => setIsReopenModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReopenSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Why is this issue still unresolved?</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Explain what was missing or incorrect with the provided resolution..."
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsReopenModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#FB923C' }}>
                  Reopen Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSAT Modal */}
      <CSATModal
        ticketId={selectedTicket.id}
        isOpen={isCsatModalOpen}
        onClose={() => setIsCsatModalOpen(false)}
      />
    </div>
  );
};
