import React, { useEffect, useState } from 'react';
import { setSessionToken } from '../../../utils';
import {BridgeError, BridgeErrorType} from "../../../utils/error"
import * as api from '../../../api';
import ErrorMessage from '../../error';
import { useLocation } from 'wouter';
import useRedirect from '../../../utils/redirect';
import Container from '../../container';
import { provisioningLogo } from '../../svg/provisioning-illustration';
import SuccessMessage from '../../success';
import { StatusMessageMap } from '../../../messages';

const LoginRoute = () => {
  const [bearerToken, setBearerToken] = useState('');
  const [error, setError] = useState({ message: '', detail: '' });
  const [success, setSuccess] = useState({ message: '', detail: '' });
  const [, setLocation] = useLocation();
  const sessionCheck = useRedirect();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status) {
      const message = StatusMessageMap[status];
      setSuccess({
        message: '',
        detail: message,
      });
    }
  }, []); // Only render on initial page load

  const onSubmit = async () => {
    try {
      const loginSession = await api.getLoginSession(bearerToken);
      setSessionToken(loginSession.sessiontoken);
      setLocation('/app/status');
    } catch (_err) {
      const err = _err as BridgeError;

      switch (err.type) {
        case BridgeErrorType.Unauthorized:
          setError({
            message: err.message,
            detail: 'Incorrect bearer token.',
          });
          break;
        default:
          setError({
            message: 'Error occured when logging in.',
            detail: err.message,
          });
      }

      console.error(err);
    }
  };

  if (!sessionCheck.loading && sessionCheck.found === false) {
    setLocation('/app/setup');
  }

  return (
    <Container>
      <div className="pt-[15rem] md:mx-auto md:w-4/5 md:max-w-xlg px-4 lg:px-0">
        <div className="bg-white shadow md:rounded-lg md:pl-5">
          <div className="flex">
            <div className="flex-1 py-8 sm:pb-0 px-6 md:mt-6">
              <h2 className="text-center sm:text-left text-3xl font-semibold text-gray-700 mb-6 sm:my-3 my-1">
                1Password <span className="block">SCIM bridge</span>
              </h2>
              <label
                htmlFor="token"
                className="block text-sm mb-1.5 font-medium text-gray-700"
              >
                Bearer Token
              </label>

              <input
                value={bearerToken}
                onChange={e => setBearerToken(e.target.value)}
                id="token"
                name="token"
                type="password"
                autoComplete="bearer-token"
                required
                className="appearance-none block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-light focus:border-blue-light sm:text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    void onSubmit();
                  }
                }}
              />
              <button
                onClick={onSubmit}
                type="submit"
                className="w-full py-2 px-4 mt-4 border border-transparent border-solid rounded-lg shadow-sm text-sm font-medium mb-4 text-white bg-blue-primary hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light"
              >
                Verify
              </button>
              {error.message && (
                <div className="">
                  <ErrorMessage message={error.message} detail={error.detail} />
                </div>
              )}
              {success.detail && (
                <div className="">
                  <SuccessMessage
                    message={success.message}
                    detail={success.detail}
                  />
                </div>
              )}
            </div>
            <div className="hidden sm:flex">{provisioningLogo}</div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default LoginRoute;
