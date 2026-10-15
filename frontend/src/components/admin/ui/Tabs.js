"use client";

import { useId, useState } from "react";

/** Tabbed panels. tabs: [{ key, label, content }] */
export default function Tabs({ tabs, initialKey }) {
  const baseId = useId();
  const [activeKey, setActiveKey] = useState(initialKey ?? tabs[0]?.key);
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap border-b border-slate-200">
        {tabs.map((tab) => {
          const selected = tab.key === active?.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${baseId}-${tab.key}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.key}-panel`}
              onClick={() => setActiveKey(tab.key)}
              className={[
                "px-4 py-2.5 text-sm bg-transparent border-0 border-b-2 -mb-px cursor-pointer",
                selected ? "font-semibold text-slate-800" : "border-transparent text-slate-500 hover:text-slate-800",
              ].join(" ")}
              style={selected ? { borderColor: "var(--admin-primary)" } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div role="tabpanel" id={`${baseId}-${active.key}-panel`} aria-labelledby={`${baseId}-${active.key}-tab`} className="pt-4">
          {active.content}
        </div>
      )}
    </div>
  );
}
