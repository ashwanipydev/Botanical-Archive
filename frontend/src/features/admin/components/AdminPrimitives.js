import React from 'react';

export const AdminPageHeader = ({ eyebrow, title, description, action }) => (
  <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div className="max-w-3xl">
      <p className="label mb-3">{eyebrow}</p>
      <h1 className="text-4xl font-black tracking-tighter text-primary md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-on-surface-variant md:text-base">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </header>
);

export const AdminPanel = ({ children, className = '', muted = false, dark = false }) => {
  let tone = 'bg-surface-container-lowest shadow-organic-md';

  if (muted) tone = 'bg-surface-container-low shadow-organic-sm';
  if (dark) tone = 'bg-primary text-background shadow-organic-xl';

  return (
    <section className={`rounded-[2rem] p-6 md:p-8 ${tone} ${className}`.trim()}>
      {children}
    </section>
  );
};

export const AdminSectionTitle = ({ eyebrow, title, description, action }) => (
  <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      {eyebrow ? <p className="label mb-2">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black tracking-tight text-primary">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm font-medium text-on-surface-variant">{description}</p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export const AdminStatCard = ({ icon, label, value, meta, accent = 'primary' }) => {
  const accentMap = {
    primary: 'text-primary bg-primary/8',
    secondary: 'text-secondary bg-secondary-container/35',
    tertiary: 'text-tertiary bg-tertiary/10',
    neutral: 'text-on-surface-variant bg-surface-container-high',
    danger: 'text-error bg-error-container/60',
  };

  return (
    <AdminPanel className="h-full">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentMap[accent] || accentMap.primary}`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        {meta ? (
          <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">
            {meta}
          </span>
        ) : null}
      </div>
      <p className="label mb-2">{label}</p>
      <div className="text-3xl font-black tracking-tight text-on-surface md:text-4xl">
        {value}
      </div>
    </AdminPanel>
  );
};

export const AdminStatusBadge = ({ tone = 'neutral', children }) => {
  const toneMap = {
    success: 'bg-secondary-container/45 text-on-secondary-container',
    warning: 'bg-surface-container-high text-on-surface-variant',
    danger: 'bg-error-container text-error',
    neutral: 'bg-surface-container-low text-on-surface-variant',
    dark: 'bg-background/10 text-background',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${toneMap[tone] || toneMap.neutral}`}
    >
      {children}
    </span>
  );
};

export const AdminIconButton = ({ icon, label, className = '', ...props }) => (
  <button
    type="button"
    aria-label={label}
    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary transition hover:bg-surface-container-high ${className}`.trim()}
    {...props}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
);

export const AdminEmptyState = ({ icon, title, description }) => (
  <AdminPanel muted className="py-16 text-center">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-surface-container-lowest text-primary/45 shadow-organic-sm">
      <span className="material-symbols-outlined text-4xl">{icon}</span>
    </div>
    <h3 className="text-xl font-black tracking-tight text-primary">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-on-surface-variant">
      {description}
    </p>
  </AdminPanel>
);
