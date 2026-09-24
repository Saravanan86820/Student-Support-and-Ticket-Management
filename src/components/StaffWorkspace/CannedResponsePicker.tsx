import React, { useState } from 'react';
import { CANNED_RESPONSES } from '../../data/seedData';
import { TicketCategory, CannedResponse } from '../../types';
import { MessageSquareText, Sparkles, ChevronDown } from 'lucide-react';

interface CannedResponsePickerProps {
  category: TicketCategory;
  onSelect: (body: string) => void;
}

export const CannedResponsePicker: React.FC<CannedResponsePickerProps> = ({ category, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter templates relevant to this category first, plus all others
  const relevantTemplates = CANNED_RESPONSES.filter(cr => cr.category === category);
  const otherTemplates = CANNED_RESPONSES.filter(cr => cr.category !== category);

  const handleChoose = (cr: CannedResponse) => {
    onSelect(cr.body);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#A5B4FC',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 10px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
        title="Insert pre-approved official university response template"
      >
        <Sparkles size={13} />
        <span>Canned Reply</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 120 }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '6px',
              width: '320px',
              background: '#1E293B',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 130,
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#94A3B8',
                padding: '6px 8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Suggested University Templates
            </div>

            {relevantTemplates.map(cr => (
              <div
                key={cr.id}
                onClick={() => handleChoose(cr)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: '#F8FAFC',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquareText size={13} color="#818CF8" />
                  <span>{cr.title}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cr.body}
                </div>
              </div>
            ))}

            {otherTemplates.map(cr => (
              <div
                key={cr.id}
                onClick={() => handleChoose(cr)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: '#CBD5E1',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquareText size={13} color="#64748B" />
                  <span>{cr.title}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cr.body}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
