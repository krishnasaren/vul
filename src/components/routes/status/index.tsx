import React, { useEffect, useState } from 'react';
import * as api from '../../../api';
import IndicatorRow from './indicator-row';
import { BridgeError, BridgeErrorType } from '../../../utils/error';
import { useLocation } from 'wouter';
import ErrorMessage from '../../error';
import { Collapsible, CollapsibleWithButton } from './collapsible';
import Block from '../../block';
import DownloadLogButton from './download-log-button';
import TitleText from './title-text';
import useRedirect from '../../../utils/redirect';
import Container from '../../container';
import Spinner from '../../spinner';
import TopBar from '../../topbar';
import KeyUploader from './workspace/key-uploader';
import ConfigUploader from './workspace/config-uploader';
import GroupManagement from './workspace/group-management';
import { HealthyBadge, InfoBadge, UnhealthyBadge } from './badge';
import SuccessMessage from '../../success';
import image from '../../svg/google-workspace-logo.png';
import * as storage from '../../../storage';

const StatusRoute = () => {
  const [, setLocation] = useLocation();

  const [logs, setLogs] = useState<string[] | null>(null);
  const [infoReport, setInfoReport] = useState<api.InfoReport | null>(null);
  const [healthReport, setHealthReport] = useState<api.HealthReport | null>(
    null,
  );
  const sessionCheck = useRedirect();

  const [, setHasBeenOpenedBefore] = useState(() => false);

  const [error, setError] = useState({ message: '', detail: '' });

  useEffect(() => {
    (async () => {
      try {
        const healthReport = await api.getHealthReport();
        const infoReport = await api.getInfoReport();
        const logs = await api.getLogs();

        setHealthReport(healthReport);
        setInfoReport(infoReport);
        storage.saveMode(infoReport.mode);
        setLogs(logs);
      } catch (_err) {
        const err = _err as BridgeError;
        handleError(err, 'fetch status');
      }
    })();
  }, []);

  const handleError = (err: BridgeError, operationSummary: string) => {
    switch (err.type) {
      case BridgeErrorType.Unauthorized:
        setError({
          message: err.message,
          detail: 'Redirecting to login page in 2 seconds',
        });
        setTimeout(() => setLocation('/app/login'), 2000);
        break;

      default:
        setError({
          message: err.message,
          detail: 'Unable to ' + operationSummary + '.',
        });
    }
  };

  if (!sessionCheck.loading && sessionCheck.found === false) {
    setLocation('/app/setup');
  }

  const indicators = healthReport &&
    infoReport && [
      {
        name: 'Connection',
        text: infoReport.connection
          ? 'Successfully Connected'
          : 'Not Connected',
        state: infoReport.connection ? api.State.Healthy : api.State.Unhealthy,
      },
      {
        name: 'Session',
        text: infoReport.session
          ? 'Successfully Authenticated'
          : 'Not Authenticated',
        state: infoReport.session ? api.State.Healthy : api.State.Unhealthy,
      },
      ...healthReport.reports.map(report => ({
        name: report.source,
        state: report.state,
        text: report.time.toLocaleString(),
      })),
    ];

  const workspaceEnabled = infoReport?.mode === api.Mode.Workspace;

  return (
    <>
      <TopBar version={healthReport?.version} build={healthReport?.build} />
      <Container>
        <Block>
          <Collapsible
            title={<TitleText text="Status" />}
            setHasBeenOpenedBefore={setHasBeenOpenedBefore}
            startOpened={!workspaceEnabled} // Workspace users want to see workspace content, so let's collapse Status if in workspace mode
          >
            {indicators ? (
              <>
                <div className="w-full">
                  {indicators.map(indicator => (
                    <IndicatorRow key={indicator.name} {...indicator} />
                  ))}
                </div>
              </>
            ) : (
              <Spinner />
            )}
          </Collapsible>
        </Block>

        <Block>
          {logs ? (
            <Collapsible title={<TitleText text="Logs" />}>
              <div className="flex flex-col items-start mt-4">
                {logs
                  .sort((a, b) => b.localeCompare(a))
                  .map(log => (
                    <DownloadLogButton
                      key={log}
                      log={log}
                      handleError={handleError}
                    />
                  ))}
              </div>
            </Collapsible>
          ) : (
            <Spinner />
          )}
        </Block>

        {infoReport && infoReport.beta && (
          <>
            <hr className="mt-6 mb-10" />

            <Block>
              <CollapsibleWithButton
                collapsedButtonText="Edit Configuration"
                expandedButtonText="Cancel"
                disabled={infoReport?.configMode === api.ConfigMode.EnvVars}
                setHasBeenOpenedBefore={setHasBeenOpenedBefore}
                startOpened={!workspaceEnabled}
                title={<img src={image} />}
                status={
                  <div className="flex ml-6">
                    {workspaceEnabled ? (
                      <HealthyBadge text="Connected" />
                    ) : (
                      <InfoBadge text="Not set up" />
                    )}
                  </div>
                }
              >
                <div className="bg-white border-t pt-5 sm:pt-6">
                  <div className="md:grid md:grid-cols-3">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Configuration
                      </h3>
                      <a
                        className="text-sm text-blue-primary hover:text-blue-dark underline"
                        href="https://support.1password.com/scim-google-workspace/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn how to integrate with Google Workspace
                      </a>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="flex flex-col">
                        {(error.message || error.detail) && (
                          <div className="mb-3">
                            <ErrorMessage
                              message={error.message}
                              detail={error.detail}
                            />
                          </div>
                        )}

                        {workspaceEnabled && (
                          <div className="mb-3">
                            <SuccessMessage
                              message=""
                              detail="You are now connected to Google Workspace and can start syncing groups to your 1Password account."
                            />
                          </div>
                        )}

                        <KeyUploader setError={setError} />
                        <ConfigUploader setError={setError} />
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleWithButton>
            </Block>

            {workspaceEnabled && (
              <Block>
                <GroupManagement />
              </Block>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default StatusRoute;
