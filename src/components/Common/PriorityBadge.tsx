import React from 'react';
import { TicketPriority } from '../../types';
import { Flame, AlertCircle, ArrowUpCircle, MinusCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="badge badge-prio-critical">
          <Flame size={12} /> P1 Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="badge badge-prio-high">
          <AlertCircle size={12} /> P2 High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="badge badge-prio-medium">
          <ArrowUpCircle size={12} /> P3 Medium
        </span>
      );
    case 'LOW':
      return (
        <span className="badge badge-prio-low">
          <MinusCircle size={12} /> P4 Low
        </span>
      );
    default:
      return <span className="badge">{priority}</span>;
  }
};
