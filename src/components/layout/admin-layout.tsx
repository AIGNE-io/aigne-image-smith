import BaseLayout from '@blocklet/ui-react/lib/Dashboard';
import { Outlet } from 'react-router-dom';

export default function AdminLayout({ title, ...rest }: { title: string; [key: string]: any }) {
  return (
    // @ts-ignore
    <BaseLayout
      showDomainWarningDialog
      meta={undefined}
      fallbackUrl={undefined}
      headerAddons={undefined}
      sessionManagerProps={undefined}
      links={undefined}
      title={title}
      // @ts-ignore will be fixed in the ux lib
      invalidPathFallback={() => {}}
      {...rest}>
      {/* @ts-expect-error */}
      <Outlet />
    </BaseLayout>
  );
}
