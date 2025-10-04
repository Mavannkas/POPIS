"use client";
import { Calendar, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import "./styles.scss";

import { OverviewCard } from "../../OverviewCard";
import { OverviewChart } from "../../OverviewChart";
import { OverviewLastOrders } from "../../OverviewLastOrders";

export const Overview = () => {
  // Mock data for event statistics
  const [totalEvents] = useState(342);
  const [activeEvents] = useState(45);
  const [upcomingEvents] = useState(127);
  const [totalAttendees] = useState(8924);

  return (
    <section className="dashboard-overview">
      <div className="dashboard-overview__cards">
        <OverviewCard
          label="Wszystkie wydarzenia"
          icon={<Calendar />}
          value={totalEvents}
          subtitle="Łącznie w systemie"
        />
        <OverviewCard
          label="Aktywne wydarzenia"
          icon={<TrendingUp />}
          value={activeEvents}
          subtitle="Odbywają się teraz"
        />
        <OverviewCard
          label="Nadchodzące wydarzenia"
          icon={<Calendar />}
          value={upcomingEvents}
          subtitle="W najbliższym czasie"
        />
        <OverviewCard
          label="Uczestnicy"
          icon={<Users />}
          value={totalAttendees}
          subtitle="Zarejestrowanych łącznie"
        />
      </div>
      <div className="dashboard-overview__widgets">
        <OverviewChart />
        <OverviewLastOrders />
      </div>
    </section>
  );
};
