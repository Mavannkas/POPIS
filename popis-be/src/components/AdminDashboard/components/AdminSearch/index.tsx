"use client";
import { getTranslation } from "@payloadcms/translations";
import { useConfig, useTranslation } from "@payloadcms/ui";
import { EntityType, formatAdminURL, type NavGroupType } from "@payloadcms/ui/shared";
import Link from "next/link";
import { Fragment, useState } from "react";
import "./styles.scss";

export const AdminSearch = ({ groups }: { groups: NavGroupType[] }) => {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();

  const { i18n } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      entities: group.entities.filter(({ label }) => {
        const labelText = getTranslation(label, i18n);
        return labelText.toLowerCase().includes(searchValue.toLowerCase());
      }),
    }))
    .filter((group) => group.entities.length > 0);

  return (
    <div className="admin-search">
      <input
        type="text"
        className="admin-search__input"
        placeholder="Szukaj..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      {isFocused && searchValue && (
        <div className="admin-search__results">
          {filteredGroups.length === 0 ? (
            <div className="admin-search__empty">Brak wyników</div>
          ) : (
            filteredGroups.map((group, index) => (
              <Fragment key={`${group.label}-${index}`}>
                <div className="admin-search__group">
                  <div className="admin-search__group-heading">{group.label}</div>
                  {group.entities.map(({ label, slug, type }) => {
                    let href = "/";
                    let id: string = slug;

                    if (type === EntityType.collection) {
                      href = formatAdminURL({ adminRoute, path: `/collections/${slug}` });
                      id = `nav-${slug}`;
                    }

                    if (type === EntityType.global) {
                      href = formatAdminURL({ adminRoute, path: `/globals/${slug}` });
                      id = `nav-global-${slug}`;
                    }
                    return (
                      <Link key={`${slug}-${index}-${id}`} href={href} className="admin-search__item">
                        {getTranslation(label, i18n)}
                      </Link>
                    );
                  })}
                </div>
                {index === filteredGroups.length - 1 ? null : <div className="admin-search__separator" />}
              </Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
};
