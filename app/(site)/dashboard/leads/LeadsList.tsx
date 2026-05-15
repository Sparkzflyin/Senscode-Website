"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  bulkArchiveLeadsAction,
  bulkDeleteLeadsAction,
  type BulkActionState,
} from "./bulkActions";
import { leadStatusLabel } from "@/lib/leads";
import { formatDateTime } from "@/lib/format";
import type { LeadStatus, LeadSource } from "@/db/schema";

type Row = {
  id: string;
  name: string | null;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: Date;
  convertedOrderId: string | null;
};

const initialState: BulkActionState = {};

export function LeadsList({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [archiveState, archiveAction, archivePending] = useActionState(
    bulkArchiveLeadsAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    bulkDeleteLeadsAction,
    initialState,
  );

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected || someSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  };

  const status = archiveState.error || deleteState.error;
  const success = archiveState.success || deleteState.success;
  const pending = archivePending || deletePending;

  const showActionBar = selected.size > 0 || pending;

  return (
    <div>
      <div className="bulk-bar" data-active={showActionBar ? "true" : "false"}>
        <label
          className="bulk-bar-select"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={toggleAll}
            aria-label="Select all leads"
          />
          <span style={{ fontSize: "0.9rem", opacity: 0.85 }}>
            {selected.size > 0
              ? `${selected.size} selected`
              : `${rows.length} total`}
          </span>
        </label>

        {selected.size > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <form action={archiveAction}>
              {Array.from(selected).map((id) => (
                <input key={id} type="hidden" name="id" value={id} />
              ))}
              <button
                type="submit"
                className="cta-button small-btn"
                style={{ background: "transparent" }}
                disabled={pending}
                onClick={() => setConfirmingDelete(false)}
              >
                {archivePending ? "Archiving…" : "Archive selected"}
              </button>
            </form>

            {confirmingDelete ? (
              <form action={deleteAction}>
                {Array.from(selected).map((id) => (
                  <input key={id} type="hidden" name="id" value={id} />
                ))}
                <button
                  type="submit"
                  className="danger-btn"
                  disabled={pending}
                >
                  {deletePending
                    ? "Deleting…"
                    : `Yes, delete ${selected.size}`}
                </button>
                <button
                  type="button"
                  className="cta-button small-btn"
                  style={{ background: "transparent", marginLeft: 8 }}
                  onClick={() => setConfirmingDelete(false)}
                  disabled={pending}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="danger-btn"
                onClick={() => setConfirmingDelete(true)}
                disabled={pending}
              >
                Delete selected
              </button>
            )}

            <button
              type="button"
              className="cta-button small-btn"
              style={{ background: "transparent" }}
              onClick={() => {
                setSelected(new Set());
                setConfirmingDelete(false);
              }}
              disabled={pending}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      {status ? (
        <p style={{ color: "#ff6b6b", margin: "0 0 12px" }} role="alert">
          {status}
        </p>
      ) : null}
      {success ? (
        <p style={{ color: "#34d399", margin: "0 0 12px" }} role="status">
          {success}
        </p>
      ) : null}

      <div>
        {rows.map((row) => {
          const checked = selected.has(row.id);
          return (
            <div
              key={row.id}
              className="order-row lead-row"
              data-selected={checked ? "true" : "false"}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 16,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 2,
                }}
                aria-label={`Select ${row.name || row.email}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(row.id)}
                />
              </label>
              <Link
                href={`/dashboard/leads/${row.id}`}
                className="lead-row-link"
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <strong style={{ fontSize: "1.05rem" }}>
                    {row.name || row.email}
                  </strong>
                  <span className="order-status" data-status={row.status}>
                    {leadStatusLabel(row.status)}
                  </span>
                </div>
                <div className="order-row-meta">
                  {row.name ? <span>{row.email}</span> : null}
                  <span>via {row.source}</span>
                  <span>{formatDateTime(row.createdAt)}</span>
                </div>
              </Link>
              <div className="order-row-right">
                {row.convertedOrderId ? (
                  <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>
                    → order
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
