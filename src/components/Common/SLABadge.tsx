import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import { computeSLAStatus } from '../../utils/slaCalculator';
import { Clock, AlertOctagon, PauseCircle, CheckCircle } from 'lucide-react';

interface SLABadgeProps {
  ticket: Ticket;
}

export const SLABadge: React.FC<SLABadgeProps> = ({ ticket }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update timer every 10 seconds for real-time feel
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const sla = computeSLAStatus(ticket, now);

  if (sla.state === 'PAUSED') {
    return (
      <span className="badge-sla badge-sla-paused" title="SLA Countdown Paused while waiting for student info">
        <PauseCircle size={12} /> Paused
      </span>
    );
  }

  if (sla.state === 'BREACHED') {
    return (
      <span className="badge-sla badge-sla-breached" title="Resolution SLA deadline has passed!">
        <AlertOctagon size={12} /> {sla.displayText}
      </span>
    );
  }

  if (sla.state === 'WARNING') {
    return (
      <span className="badge-sla badge-sla-warning" title="Less than 25% SLA time remaining">
        <Clock size={12} /> {sla.displayText}
      </span>
    );
  }

  if (sla.state === 'RESOLVED_MET') {
    return (
      <span className="badge-sla badge-sla-healthy">
        <CheckCircle size={12} /> Met SLA
      </span>
    );
  }

  if (sla.state === 'RESOLVED_BREACHED') {
    return (
      <span className="badge-sla badge-sla-breached">
        <AlertOctagon size={12} /> Breached
      </span>
    );
  }

  return (
    <span className="badge-sla badge-sla-healthy">
      <Clock size={12} /> {sla.displayText}
    </span>
  );
};
