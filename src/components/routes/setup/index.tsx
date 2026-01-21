import React, { useState, useEffect } from 'react';
import useRedirect from '../../../utils/redirect';
import { useLocation } from 'wouter';
import SignInTo1PasswordButton from './sign-in-1password-button';
import Block from '../../block';
import * as api from '../../../api';
import * as remoteApi from '../../../remote-api';
import ErrorMessage from '../../error';
import { isIpv4Domain } from '../../../utils/validators';
import { removeProtocolFromURL } from '../../../utils';
import Step from './step';
import Container from '../../container';
import SectionHeader from '../../section-header';
import TopBar from '../../topbar';

const SetupRoute = () => {
  const [, setLocation] = useLocation();
  const sessionCheck = useRedirect();
  const [domainConfigured, setDomainConfigured] = useState('');
  const [dnsDescription, setDnsDescription] = useState('');
  const [verifyError, setVerifyError] = useState({
    message: '',
    detail: '',
  });
  const [domain, setDomain] = useState(window.location.hostname);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!sessionCheck.loading && sessionCheck.found) {
    window.location.replace('/app/login');
  }

  useEffect(() => {
    if (isIpv4Domain(window.location.hostname)) {
      setDnsDescription(
        'Configure a DNS record for your SCIM bridge, and replace the IP address with your domain name:',
      );
    } else {
      setDnsDescription(
        'Configure a DNS record for your SCIM bridge, and confirm the domain name below is correct:',
      );
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('verified') || window.location.protocol === 'https:') {
      setVerifyError({ message: '', detail: '' });
      setDomainConfigured(window.location.hostname);
    }
  }, []);

  const testDomain = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setVerifyError({ message: '', detail: '' });
    setIsVerifying(true);

    const newDomain = removeProtocolFromURL(domain);

    if (newDomain === 'localhost' || newDomain === '127.0.0.1') {
      setDomainConfigured(newDomain);
      setIsVerifying(false);
      setLocation('/app/setup?verified=true', { replace: true });
      return;
    }

    const path = 'https://' + newDomain;

    try {
      await api.getTLSCert(newDomain);
    } catch (err) {
      console.log('getTLSCert error: ' + err);
      setVerifyError({
        message: "Couldn't verify domain.",
        detail:
          'Check your configuration and try again. Ensure the DNS record has had time to propagate, and that port 443 is open on your firewall.',
      });
      return;
    }

    try {
      await attemptHealthCheck(path, 35);
      window.location.replace(path);
    } catch (err) {
      console.log('Failed to resolve TLS upgrade: ' + err);
      setVerifyError({
        message: 'LetsEncrypt challenge attempt failed',
        detail:
          "Verify that your SCIM bridge's domain name has not been rate limited.",
      });
      setIsVerifying(false);
      setDomainConfigured('');
    }
  };

  const attemptHealthCheck = async (
    path: string,
    retries: number,
  ): Promise<void> => {
    try {
      return await remoteApi.getHealthCheck(path);
    } catch (err) {
      if (retries === 0) {
        throw new Error('Out of retries: ' + err);
      }
      console.log('1Password SCIM bridge TLS upgrade not ready. Retrying...');

      // pause between tries
      await new Promise(resolve => setTimeout(resolve, 1000));

      return attemptHealthCheck(path, retries - 1);
    }
  };

  return (
    <>
      <TopBar />
      <Container>
        <SectionHeader header=""></SectionHeader>
        <Block>
          <Step
            name="Deploy"
            completed={true}
            description="Successful deployment."
          />
        </Block>

        <Block>
          {domainConfigured ? (
            <Step
              name="Configure your domain"
              completed={true}
              description={`${domainConfigured} configured successfully`}
            />
          ) : (
            // TODO refactor in a <Step /> component
            <div className="flex">
              <span
                className="flex-shrink-0 mt-1 w-4 h-4 flex items-center justify-center bg-gray-300 rounded-full"
                aria-hidden="true"
              />

              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Configure your domain
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-900">
                  <p>{dnsDescription}</p>
                </div>
                <form
                  className="mt-5 sm:flex sm:items-center"
                  onSubmit={testDomain}
                >
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="domain" className="sr-only">
                      Domain
                    </label>

                    <input
                      type="text"
                      value={domain}
                      name="domain"
                      id="domain"
                      className="shadow-sm focus:ring-blue-primary focus:border-blue-primary block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="scim.example.com"
                      onChange={e => setDomain(e.currentTarget.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-lg text-white bg-blue-primary hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light disabled:bg-gray-100 disabled:text-gray-400 sm:mt-0 sm:ml-3 sm:w-1/2 sm:text-sm"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </form>
                <div className="rounded-md bg-blue-50 p-2 mt-4 border border-[#0077FF3D]">
                  <div className="flex">
                    <div className="flex-1 md:flex md:justify-between">
                      <p className="text-sm font-normal text-gray-500">
                        The above domain will be sent to the{' '}
                        <a
                          className="text-gray-600 font-medium no-underline hover:underline"
                          href="https://letsencrypt.org/"
                          target="blank"
                        >
                          {"Let's Encrypt"}
                        </a>{' '}
                        service for the purposes of acquiring a TLS certificate
                        for your SCIM bridge.
                        <br />
                        <br />
                        If successful, you will be automatically redirected to a
                        TLS-secured connection.
                      </p>
                    </div>
                  </div>
                </div>
                {verifyError.message && (
                  <div className="my-3">
                    <ErrorMessage
                      message={verifyError.message}
                      detail={verifyError.detail}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </Block>

        <Block>
          <Step
            name="Connect your account"
            description="Domain configuration required"
            completed={false}
          />

          {domainConfigured && (
            <div className="ml-44 flex justify-center items-center">
              <SignInTo1PasswordButton />
            </div>
          )}
        </Block>
      </Container>
    </>
  );
};

export default SetupRoute;
