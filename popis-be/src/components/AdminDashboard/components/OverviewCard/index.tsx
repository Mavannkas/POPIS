import { type ReactNode } from "react";
import "./styles.scss";

export const OverviewCard = ({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
}) => {
  return (
    <div className="overview-card">
      <div className="overview-card__header">
        <h3 className="overview-card__label">{label}</h3>
        <div className="overview-card__icon">{icon}</div>
      </div>
      <div className="overview-card__content">
        <div className="overview-card__value">{value}</div>
        {subtitle && <p className="overview-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};
