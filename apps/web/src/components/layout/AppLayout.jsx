import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useBusiness } from '../../hooks/useBusiness';
import styles from './AppLayout.module.css';

export default function AppLayout({ title }) {
  const { business } = useBusiness();

  return (
    <div className={styles.wrap}>
      <Sidebar businessName={business?.name} />
      <div className={styles.main}>
        <Topbar title={title} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
