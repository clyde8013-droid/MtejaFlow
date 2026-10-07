import { FiSettings } from 'react-icons/fi';
import ComingSoon from '../../components/ui/ComingSoon';

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={FiSettings}
      title="Settings"
      description="Business profile, team members, and preferences will live here."
    />
  );
}
