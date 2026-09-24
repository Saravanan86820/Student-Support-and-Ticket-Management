import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { CATEGORIES } from '../../data/seedData';
import { TicketCategory, TicketPriority, Attachment } from '../../types';
import { PRIORITY_CONFIG } from '../../utils/slaCalculator';
import { X, Upload, Sparkles, AlertCircle } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const { createTicket, selectTicket } = useTickets();

  const [category, setCategory] = useState<TicketCategory>('FEES_FINANCE');
  const [subcategory, setSubcategory] = useState<string>(CATEGORIES[0].subcategories[0]);
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic custom fields based on category
  const [transactionUtr, setTransactionUtr] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [academicSemester, setAcademicSemester] = useState('Semester 5');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [medicalDoctorName, setMedicalDoctorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [certificateType, setCertificateType] = useState('Bonafide Certificate');
  const [lostIdFirNumber, setLostIdFirNumber] = useState('');
  const [mockFileName, setMockFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategoryConfig = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

  const handleCategoryChange = (catId: TicketCategory) => {
    setCategory(catId);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSubcategory(cat.subcategories[0]);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMockFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the title and description.');
      return;
    }

    const customFields: Record<string, string> = {};
    if (category === 'FEES_FINANCE') {
      if (transactionUtr) customFields.transactionUtr = transactionUtr;
      if (feeAmount) customFields.feeAmount = feeAmount;
      if (academicSemester) customFields.academicSemester = academicSemester;
    } else if (category === 'ATTENDANCE_LEAVE') {
      if (leaveStartDate) customFields.leaveStartDate = leaveStartDate;
      if (leaveEndDate) customFields.leaveEndDate = leaveEndDate;
      if (medicalDoctorName) customFields.medicalDoctorName = medicalDoctorName;
    } else if (category === 'DOCUMENTS_CERTIFICATES') {
      if (certificateType) customFields.certificateType = certificateType;
      if (purpose) customFields.purpose = purpose;
    } else if (category === 'ID_CARD_ACCESS') {
      if (lostIdFirNumber) customFields.lostIdFirNumber = lostIdFirNumber;
    }

    const attachments: Attachment[] = [];
    if (mockFileName) {
      attachments.push({
        id: `att-${Date.now()}`,
        name: mockFileName,
        size: '1.2 MB',
        type: 'application/pdf',
      });
    }

    const created = createTicket({
      title,
      description,
      category,
      subcategory,
      priority,
      customFields,
      attachments,
    });

    onClose();
    selectTicket(created.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: '#818CF8' }}>
              <Sparkles size={20} />
            </div>
            <h2 className="modal-title">Raise New Support Request</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category Selector */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => handleCategoryChange(e.target.value as TicketCategory)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.departmentName})
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div className="form-group">
              <label className="form-label">Subcategory / Request Type</label>
              <select
                className="form-select"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
              >
                {currentCategoryConfig.subcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Custom Fields based on category */}
            {category === 'FEES_FINANCE' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Bank Transaction UTR / Ref</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HDFC260924..."
                    value={transactionUtr}
                    onChange={e => setTransactionUtr(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Paid</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹75,000"
                    value={feeAmount}
                    onChange={e => setFeeAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {category === 'ATTENDANCE_LEAVE' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Leave Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Leave End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Treating Doctor Name & Medical Reg #</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. K. Verma (Reg: TN-90123)"
                    value={medicalDoctorName}
                    onChange={e => setMedicalDoctorName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {category === 'DOCUMENTS_CERTIFICATES' && (
              <div className="form-group">
                <label className="form-label">Purpose of Document</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. German Embassy Visa, Education Loan, Internship verification"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              </div>
            )}

            {category === 'ID_CARD_ACCESS' && (
              <div className="form-group">
                <label className="form-label">Police Lost Report / Complaint No. (if lost)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FIR / Lost property reference"
                  value={lostIdFirNumber}
                  onChange={e => setLostIdFirNumber(e.target.value)}
                />
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Summary / Subject Line</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief summary of your issue..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Explanation</label>
              <textarea
                className="form-textarea"
                placeholder="Provide all relevant details to help staff process your request quickly..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Urgency / Priority Selection with SLA preview */}
            <div className="form-group">
              <label className="form-label">Urgency & Target SLA Commitment</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map(p => {
                  const cfg = PRIORITY_CONFIG[p];
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      style={{
                        background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                        border: isSelected ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: isSelected ? '#A5B4FC' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '4px' }}>
                        {cfg.resolutionHours}h SLA
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Attachment Upload */}
            <div className="form-group">
              <label className="form-label">Supporting Document (Challan, Medical Certificate, etc.)</label>
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  onChange={handleFileAttach}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                />
                <Upload size={24} style={{ color: '#818CF8', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {mockFileName ? mockFileName : 'Click or drag files here to attach'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  PDF, PNG, JPG up to 10MB
                </div>
              </div>
            </div>

            {/* Info Notice */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#C7D2FE',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Requests are automatically routed to the <strong>{currentCategoryConfig.departmentName}</strong> queue with guaranteed response time tracking.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
