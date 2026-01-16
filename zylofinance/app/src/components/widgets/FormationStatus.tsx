"use client";

interface FormationStatusProps {
  progress?: number;
  estimatedDays?: string;
}

export const FormationStatus = ({ progress = 30, estimatedDays = '4-5 business days' }: FormationStatusProps) => {
  return (
    <div className="formation-status-card">
      <div className="formation-status-header">
        <h3 className="formation-status-title">Formation status</h3>
        <span className="formation-status-badge">In progress</span>
      </div>
      <div className="formation-progress-bar">
        <div
          className="formation-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="formation-estimate">
        Estimated processing<br />
        {estimatedDays}
      </p>
      <button className="formation-btn">View status</button>
    </div>
  );
};

export default FormationStatus;
