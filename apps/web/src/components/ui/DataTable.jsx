import styles from './DataTable.module.css';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

/**
 * DataTable
 * columns: [{ key, label, render?(row), width? }]
 * rows: array of data objects, each should have a stable `id`
 * onRowClick: optional (row) => void — makes rows clickable
 */
export default function DataTable({
  columns,
  rows,
  onRowClick,
  loading = false,
  emptyIcon,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
}) {
  if (loading) return <LoadingState />;

  if (!rows || rows.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? styles.clickableRow : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
