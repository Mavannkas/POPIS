"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import "./styles.scss";

export const AdminTabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("view", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { value: "overview", label: "Przegląd" },
    { value: "analytics", label: "Analityka" },
    { value: "reports", label: "Raporty" },
    { value: "notifications", label: "Powiadomienia" },
  ];

  return (
    <div className="admin-tabs">
      <div className="admin-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`admin-tabs__trigger ${activeTab === tab.value ? "admin-tabs__trigger--active" : ""}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
