import React from 'react';
import { Mail, Users, Paperclip, Send } from 'lucide-react';

interface DashboardStatsProps {
  recipients: number;
  attachments: number;
  emailsSent: number;
}

export function DashboardStats({ recipients, attachments, emailsSent }: DashboardStatsProps) {
  const stats = [
    { label: 'Recipients', value: recipients, icon: Users },
    { label: 'Attachments', value: attachments, icon: Paperclip },
    { label: 'Emails Sent', value: emailsSent, icon: Send },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
            <Icon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      ))}
    </div>
  );
}