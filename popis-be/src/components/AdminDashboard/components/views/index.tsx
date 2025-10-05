"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

import { Overview } from "./Overview";
import Link from "next/link";

export const AdminViews = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  let ActiveTabComponent: ReactNode | null = null;

  switch (view) {
    case "overview": {
      ActiveTabComponent = <Overview />;
      break;
    }
    case "applications-chat": {
      ActiveTabComponent = (
        <div style={{ padding: 16 }}>
          <h2 style={{ marginBottom: 8 }}>Czaty zgłoszeń</h2>
          <p style={{ marginBottom: 12 }}>
            Prosty widok demonstracyjny. Pełny komponent <code>ApplicationsChatView</code> można dodać później.
          </p>
          <Link href="/admin/collections/applications">Przejdź do zgłoszeń</Link>
        </div>
      );
      break;
    }
    default: {
      ActiveTabComponent = <Overview />;
    }
  }
  return ActiveTabComponent;
};
