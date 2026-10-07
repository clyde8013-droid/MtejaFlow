import { useEffect, useState } from 'react';
import Select from '../ui/Select';
import { listCustomers } from '../../services/customersService';

/**
 * Simple dropdown of active customers. For MVP scale (a few hundred
 * customers at most) a plain <select> is fine — no need for a
 * searchable combobox yet.
 */
export default function CustomerPicker({ businessId, value, onChange, label = 'Customer' }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await listCustomers(businessId, { status: 'active' });
        if (!cancelled) setCustomers(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (businessId) load();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const options = [
    { value: '', label: loading ? 'Loading customers…' : 'Select a customer' },
    ...customers.map((c) => ({
      value: c.id,
      label: c.company ? `${c.full_name} — ${c.company}` : c.full_name,
    })),
  ];

  return <Select label={label} options={options} value={value || ''} onChange={(e) => onChange(e.target.value)} required />;
}
