import { FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from './LineItemsEditor.module.css';

let uidCounter = 0;
function nextUid() {
  uidCounter += 1;
  return `item-${Date.now()}-${uidCounter}`;
}

export function newLineItem() {
  return { uid: nextUid(), description: '', quantity: 1, unit_price: 0 };
}

/**
 * items: [{ uid, description, quantity, unit_price }]
 * onChange(items)
 */
export default function LineItemsEditor({ items, onChange, currency = '' }) {
  function updateItem(uid, field, value) {
    onChange(items.map((item) => (item.uid === uid ? { ...item, [field]: value } : item)));
  }

  function removeItem(uid) {
    onChange(items.filter((item) => item.uid !== uid));
  }

  function addItem() {
    onChange([...items, newLineItem()]);
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ width: 90 }}>Qty</th>
              <th style={{ width: 140 }}>Price</th>
              <th style={{ width: 140 }}>Total</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
              return (
                <tr key={item.uid}>
                  <td>
                    <input
                      className={styles.cellInput}
                      value={item.description}
                      placeholder="e.g. Website design"
                      onChange={(e) => updateItem(item.uid, 'description', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.cellInput}
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.uid, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.cellInput}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.uid, 'unit_price', e.target.value)}
                    />
                  </td>
                  <td>
                    <span className={`${styles.lineTotal} figure`}>
                      {currency} {lineTotal.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.uid)}
                      disabled={items.length === 1}
                      aria-label="Remove line item"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button type="button" className={styles.addBtn} onClick={addItem}>
        <FiPlus aria-hidden="true" /> Add line item
      </button>

      <div className={styles.subtotalRow}>
        <span>Subtotal</span>
        <span className="figure">{currency} {subtotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
