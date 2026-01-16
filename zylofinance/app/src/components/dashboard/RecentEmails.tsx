"use client";

interface Email {
  id: string;
  sender: string;
  avatar?: string;
  subject: string;
  time: string;
}

const sampleEmails: Email[] = [
  {
    id: '1',
    sender: 'Hannah Morgan',
    subject: 'Meeting scheduled',
    time: '1:24 PM',
  },
  {
    id: '2',
    sender: 'Megan Clark',
    subject: 'Update on marketing campaign',
    time: '12:32 PM',
  },
  {
    id: '3',
    sender: 'Brandon Williams',
    subject: 'Dexignt 2.0 is about to launch',
    time: 'Yesterday at 8:57 PM',
  },
];

export const RecentEmails = () => {
  return (
    <div className="bento-card">
      <h3 className="email-list-header">Recent emails</h3>
      <div className="email-list">
        {sampleEmails.map((email) => (
          <div key={email.id} className="email-item">
            <div className="email-avatar">
              {email.avatar ? (
                <img src={email.avatar} alt={email.sender} />
              ) : (
                <div className="email-avatar-placeholder">
                  {email.sender.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="email-content">
              <div className="email-sender">{email.sender}</div>
              <div className="email-subject">{email.subject}</div>
            </div>
            <div className="email-time">{email.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentEmails;
