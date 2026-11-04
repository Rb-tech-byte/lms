/**
 * Reusable Faculty Console UI building blocks.
 * Shared by the instructor dashboard and every page rendered inside InstructorLayout.
 */
import React from 'react';

export type Tone = 'primary' | 'info' | 'warning' | 'success' | 'violet' | 'dark';

/* ---------------- KPI Card ---------------- */
export const KpiCard: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: React.ReactNode;
  icon: string;
  tone?: Tone;
  onClick?: () => void;
}> = ({ label, value, unit, hint, icon, tone = 'primary', onClick }) => (
  <div
    className="ins-kpi"
    role={onClick ? 'button' : undefined}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    <div className="ins-kpi-top">
      <span className="ins-kpi-label">{label}</span>
      <span className={`ins-kpi-icon tone-${tone}`}>
        <i className={icon} />
      </span>
    </div>
    <div className="ins-kpi-value">
      {value}
      {unit && <small>{unit}</small>}
    </div>
    {hint && <div className={`ins-kpi-hint text-tone-${tone}`}>{hint}</div>}
  </div>
);

export const KpiGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="ins-kpi-grid">{children}</div>
);

/* ---------------- Section Card ---------------- */
export const SectionCard: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}> = ({ title, subtitle, actions, children, bodyClassName }) => (
  <section className="ins-card">
    <header className="ins-card-head">
      <div className="min-w-0">
        <h3 className="ins-card-title">{title}</h3>
        {subtitle && <p className="ins-card-sub">{subtitle}</p>}
      </div>
      {actions && <div className="ins-card-actions">{actions}</div>}
    </header>
    <div className={`ins-card-body ${bodyClassName || ''}`}>{children}</div>
  </section>
);

/* ---------------- Search Input ---------------- */
export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="ins-search">
    <i className="feather-search" />
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
    />
    {value && (
      <button type="button" onClick={() => onChange('')} aria-label="Clear search">
        <i className="feather-x" style={{ position: 'static', transform: 'none' }} />
      </button>
    )}
  </div>
);

/* ---------------- Filter Pills ---------------- */
export interface PillOption {
  value: string;
  label: string;
  count?: number;
}
export const FilterPills: React.FC<{
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="ins-pills">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        className={`ins-pill ${value === o.value ? 'is-active' : ''}`}
        onClick={() => onChange(o.value)}
      >
        {o.label}
        {typeof o.count === 'number' && <span className="count">({o.count})</span>}
      </button>
    ))}
  </div>
);

/* ---------------- Pagination ---------------- */
export const Pagination: React.FC<{
  page: number;
  pageSize: number;
  total: number;
  onChange: (p: number) => void;
  noun?: string;
}> = ({ page, pageSize, total, onChange, noun = 'records' }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="ins-pager">
      <span>
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> {noun}
      </span>
      {pages > 1 && (
        <div className="ins-pager-btns">
          <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>
            <i className="feather-chevron-left" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={p === page ? 'is-active' : ''}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ))}
          <button type="button" disabled={page === pages} onClick={() => onChange(page + 1)}>
            <i className="feather-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------- Empty / Loading ---------------- */
export const EmptyState: React.FC<{ icon?: string; text: string }> = ({ icon = 'feather-inbox', text }) => (
  <div className="ins-empty">
    <i className={icon} />
    {text}
  </div>
);

export const LoadingState: React.FC<{ text?: string }> = ({ text = 'Loading live data...' }) => (
  <div className="ins-empty">
    <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />
    {text}
  </div>
);

/* ---------------- Modal ---------------- */
export const Modal: React.FC<{
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitting?: boolean;
  children: React.ReactNode;
}> = ({ open, title, subtitle, onClose, onSubmit, submitLabel = 'Save', submitting, children }) => {
  if (!open) return null;
  return (
    <div className="ins-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="ins-modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        <div className="ins-modal-head">
          <div>
            <h6 className="fw-bold text-dark mb-0">{title}</h6>
            {subtitle && <span className="text-muted" style={{ fontSize: 11.5 }}>{subtitle}</span>}
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
        </div>
        <div className="ins-modal-body">{children}</div>
        <div className="ins-modal-foot">
          <button type="button" className="ins-btn ins-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {onSubmit && (
            <button type="submit" className="ins-btn ins-btn-primary" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm" />}
              {submitting ? 'Saving...' : submitLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

/* ---------------- CSV Export ---------------- */
export const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => {
    let s = v === null || v === undefined ? '' : String(v);
    s = s.replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ---------------- Pagination helper hook ---------------- */
export function usePaged<T>(items: T[], pageSize: number, resetKeys: any[] = []) {
  const [page, setPage] = React.useState(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => setPage(1), resetKeys);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = React.useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );
  return { page: safePage, setPage, slice };
}

