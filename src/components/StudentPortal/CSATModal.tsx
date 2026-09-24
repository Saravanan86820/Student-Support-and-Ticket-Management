import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Star, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CSATModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CSATModal: React.FC<CSATModalProps> = ({ ticketId, isOpen, onClose }) => {
  const { submitCSAT } = useTickets();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCSAT(ticketId, rating, feedback);

    // Launch celebratory confetti if 4 or 5 stars
    if (rating >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback gracefully
      }
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#FBBF24" />
            <h2 className="modal-title">Rate Resolution Quality</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ textAlign: 'center', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              How satisfied are you with the timeliness and resolution of your request?
            </p>

            {/* Interactive Star Rating */}
            <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'transform 0.15s ease',
                      transform: isFilled ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={32}
                      fill={isFilled ? '#FBBF24' : 'transparent'}
                      color={isFilled ? '#FBBF24' : '#4B5563'}
                    />
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FCD34D' }}>
              {rating === 5 && 'Outstanding & Prompt!'}
              {rating === 4 && 'Very Satisfied'}
              {rating === 3 && 'Acceptable'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Poor Turnaround'}
            </div>

            <div className="form-group" style={{ width: '100%', marginTop: '12px', textAlign: 'left' }}>
              <label className="form-label">Optional Comments / Feedback for Department Head</label>
              <textarea
                className="form-textarea"
                placeholder="Share any thoughts on how we can improve our services..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                style={{ minHeight: '80px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Skip
            </button>
            <button type="submit" className="btn-primary">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
