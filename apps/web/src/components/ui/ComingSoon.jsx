import EmptyState from '../ui/EmptyState';

export default function ComingSoon({ icon, title, description }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
