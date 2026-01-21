import React, { useState} from 'react';
import type { JSX } from 'react';
import useRedirect from '../../../utils/redirect';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import * as api from '../../../api';
import SectionHeader from '../../section-header';
import Container from '../../container';
import TopBar from '../../topbar';

const installMessages = {
  installing: 'Installing...',
  success: 'Success!',
  failed: 'Failed',
};

interface InstallStatus {
  message: string;
  detail: string;
}

const InstallRoute = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const sessionCheck = useRedirect();
  const [installStatus, setInstallStatus] = useState<InstallStatus>({
    message: installMessages.installing,
    detail: 'You should be redirected shortly. If not, try logging in below.',
  });

  if (!sessionCheck.loading && sessionCheck.found) {
    setLocation('/app/login');
  }

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const scimsession =
        params.get('scimsession') || window.location.hash.replace('#', '');

      if (scimsession.length === 0) {
        console.log('no scimsession provided in request');
        return;
      }

      try {
        await api.install({ session: scimsession });
        setInstallStatus({
          message: installMessages.success,
          detail: `The scimsession file was successfully installed. You should be
        redirected shortly. If not, try logging in below.`,
        });
      } catch (err) {
        setInstallStatus({
          message: installMessages.failed,
          detail: `Failed to validate and install scimsession file: ${err}`,
        });
        console.error('install call failed: ' + err);
        return;
      }

      const pingBridge = async () => {
        try {
          await api.ping();
          console.log('ping succeeded, redirecting');
          window.location.replace('/app/login?install=1');
        } catch (err) {
          console.error('ping failed: ' + err);
        }
      };

      await new Promise(() => setTimeout(pingBridge, 2000));
    })();
  }, []);

  if (sessionCheck.loading) {
    return <></>;
  }

  if (sessionCheck.found) {
    window.location.replace('/app/login');
  }

  return (
    <>
      <TopBar />
      <Container>
        <SectionHeader header="1Password SCIM bridge Setup"></SectionHeader>
        <div className="bg-white text-center shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-2xl font-medium text-gray-900">
              {installStatus.message}
            </h3>
            <div className="mt-6 text-sm text-gray-900">
              {installStatus.detail}
            </div>
            {installStatus.message !== installMessages.failed && (
              <div className="mt-6">
                <button
                  onClick={() => setLocation('/app/login?install=1')}
                  type="button"
                  className="inline-flex items-center justify-center py-2 px-12 border border-transparent font-medium rounded-md text-white bg-blue-primary hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light sm:text-sm"
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default InstallRoute;
