"use client";

import { CheckCircle, Mail } from "lucide-react";

interface NotificationTypeCellProps {
  type: 'approval_decision' | 'event_invitation';
}

export const NotificationTypeCell: React.FC<NotificationTypeCellProps> = ({ type }) => {
  const getIcon = () => {
    switch (type) {
      case 'approval_decision':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'event_invitation':
        return <Mail size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'approval_decision':
        return 'Decyzja o akceptacji';
      case 'event_invitation':
        return 'Zaproszenie na wydarzenie';
      default:
        return type;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getIcon()}
      <span>{getLabel()}</span>
    </div>
  );
};
