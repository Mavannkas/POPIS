import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { type EntityToGroup, EntityType, groupNavItems } from "@payloadcms/ui/shared";
import Link from "next/link";
import { type ClientUser, type Locale, type ServerProps } from "payload";

import { AdminDatePicker } from "./components/AdminDatePicker";
import { AdminSearch } from "./components/AdminSearch";
import { AdminTabs } from "./components/AdminTabs";
import { AdminViews } from "./components/views";
import "./styles.scss";

export type DashboardViewClientProps = {
  locale: Locale;
};

export type DashboardViewServerPropsOnly = {
  globalData: {
    data: { _isLocked: boolean; _lastEditedAt: string; _userEditing: ClientUser | number | string };
    lockDuration?: number;
    slug: string;
  }[];
  /**
   * @deprecated
   * This prop is deprecated and will be removed in the next major version.
   * Components now import their own `Link` directly from `next/link`.
   */
  Link?: React.ComponentType;
  navGroups?: ReturnType<typeof groupNavItems>;
} & ServerProps;

export type DashboardViewServerProps = DashboardViewClientProps & DashboardViewServerPropsOnly;

export const AdminDashboard = async (props: DashboardViewServerProps) => {
  const {
    i18n,
    locale,
    params,
    payload: {
      config: {
        admin: {
          components: { beforeDashboard },
        },
        collections,
        globals,
      },
    },
    payload,
    permissions,
    searchParams,
    user,
  } = props;

  const groups = groupNavItems(
    [
      ...collections
        .filter((collection) => !collection.admin.hidden)
        .map(
          (collection) =>
            ({
              type: EntityType.collection,
              entity: collection,
            }) satisfies EntityToGroup,
        ),
      ...globals
        .filter((global) => !global.admin.hidden)
        .map(
          (global) =>
            ({
              type: EntityType.global,
              entity: global,
            }) satisfies EntityToGroup,
        ),
    ],
    permissions!,
    i18n,
  );

  return (
    <>
      <main className="gutter--left gutter--right dashboard__wrap">
        {beforeDashboard &&
          RenderServerComponent({
            Component: beforeDashboard,
            importMap: payload.importMap,
            serverProps: {
              i18n,
              locale,
              params,
              payload,
              permissions,
              searchParams,
              user,
            } satisfies ServerProps,
          })}
        <section className="dashboard-header">
          <h1 className="dashboard-header__title">Panel Wydarzeń</h1>
          <AdminSearch groups={groups} />
          <Link href="/admin/collections/events/create" className="dashboard-header__button">
            <span className="dashboard-header__button-icon">+</span>
            Dodaj Wydarzenie
          </Link>
        </section>
        <section className="dashboard-controls">
          <AdminTabs />
          <AdminDatePicker />
        </section>
        <AdminViews />
      </main>
    </>
  );
};
