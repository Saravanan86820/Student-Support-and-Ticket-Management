import React from 'react';
import { TicketStatus } from '../../types';
import { 
  Clock, 
  UserCheck, 
  Activity, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Archive, 
  RotateCcw 
} from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="badge badge-status-open">
          <Clock size={12} /> Open
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="badge badge-status-assigned">
          <UserCheck size={12} /> Assigned
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="badge badge-status-inprogress">
          <Activity size={12} /> In Progress
        </span>
      );
    case 'PENDING_STUDENT':
      return (
        <span className="badge badge-status-pending">
          <HelpCircle size={12} /> Pending Student Action
        </span>
      );
    case 'PENDING_INTERNAL_REVIEW':
      return (
        <span className="badge badge-status-pending">
          <Clock size={12} /> Pending Internal Review
        </span>
      );
    case 'ESCALATED':
      return (
        <span className="badge badge-status-escalated">
          <AlertTriangle size={12} /> Escalated
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="badge badge-status-resolved">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    case 'CLOSED':
      return (
        <span className="badge badge-status-closed">
          <Archive size={12} /> Closed
        </span>
      );
    case 'REOPENED':
      return (
        <span className="badge badge-status-reopened">
          <RotateCcw size={12} /> Reopened
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};
