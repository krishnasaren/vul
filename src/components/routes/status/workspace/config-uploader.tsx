import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLocation } from 'wouter';
import { BridgeErrorType, BridgeError } from '../../../../utils/error';
import * as storage from '../../../../storage';
import Input from './input';
import { useModal } from './modals/modal';
import * as api from '../../../../api';
import { Message } from '../../../../messages';
import { validator } from '../../../../utils';

interface ConfigUploaderProps {
  setError: Dispatch<SetStateAction<{ message: string; detail: string }>>;
}

const ConfigUploader = ({ setError }: ConfigUploaderProps) => {
  const [modalRender, popup] = useModal();
  const [, setLocation] = useLocation();
  const [actor, setActor] = useState('');
  const [bridgeAddress, setBridgeAddress] = useState(window.location.origin);
  const [previousConfig, setPreviousConfig] = useState<api.Config>();

  useEffect(() => {
    (async () => {
      try {
        const config = await api.getConfig();
        setActor(config.actor);
        setBridgeAddress(config.bridgeAddress);
        setPreviousConfig(config);
        storage.saveConfigUploaded();
      } catch (_err) {
        const err = _err as BridgeError;

        handleError(err, 'get config');
      }
    })();
  }, []);

  const onSaveClick = async () => {
    if (!validator.validateEmailAddress(actor)) {
      setError({
        message: '',
        detail: "Your actor email address doesn't seem to be valid.",
      });
      return;
    }

    const validationErrorType = validator.validateSecureDomain(bridgeAddress);
    const { NotSecureProtocol, TrailingSlash, InvalidDomain, NoError } =
      validator.ValidationErrorType;

    let detail = '';
    let message = '';

    switch (validationErrorType) {
      case NotSecureProtocol:
        detail = 'Bridge address must start with /"https://"';
        break;
      case TrailingSlash:
        detail = 'Remove the trailing slash "/" from the bridge address.';
        break;
      case InvalidDomain:
        detail = 'Bridge address format is not valid';
        break;
      case NoError:
        detail = '';
        break;
      default:
        detail = 'An unexpected error has occurred. Review your input.';
        break;
    }

    // Set the error once after the switch statement
    setError({ message, detail });

    // If there was an error, return early to prevent further execution
    if (validationErrorType !== NoError) {
      return;
    }

    try {
      await api.uploadConfig({ actor, bridgeAddress });
      storage.saveConfigUploaded();
      await api.restartServer();

      // Users who have already uploaded their SA key will be in workspace mode after a successful config upload,
      // So let's make sure they know that.
      if (storage.getKeyUploaded()) {
        setLocation(`/app/login?status=${Message.Connected}`);
        return;
      }
      setLocation(`/app/login?status=${Message.ConfigUploaded}`);
    } catch (_err) {
      const err = _err as BridgeError;

      handleError(err, 'upload config');
    }
  };

  const onDeleteClick = async () => {
    try {
      const cont = await popup({
        titleText: 'Disconnect from Workspace',
        subtitleText: '',
        confirmText: 'Confirm and Disconnect',
        cancelText: 'Cancel',
        bodyText:
          'After you are disconnected, this page will refresh and you’ll need to sign in again.',
        isCritical: true,
      });

      if (cont) {
        await api.deleteConfig();
        storage.removeConfigUploaded();
        await api.restartServer();
        setLocation(`/app/login?status=${Message.Disconnected}`);
      }
    } catch (_err) {
      const err = _err as BridgeError;

      handleError(err, 'delete config');
    }
  };

  const handleError = (err: BridgeError, operationSummary: string) => {
    switch (err.type) {
      case BridgeErrorType.Unauthorized:
        setError({
          message: err.message,
          detail: 'Redirecting to login page in 2 seconds',
        });
        setTimeout(() => setLocation('/app/login'), 2000);
        break;

      // not found just means that the initial config was not present,
      // so we can ignore this error.
      case BridgeErrorType.NotFound:
        break;

      default:
        setError({
          message: 'Unable to ' + operationSummary + '.',
          detail: err.message,
        });
    }
  };

  const disableSaveConfigButton =
    previousConfig &&
    previousConfig.actor === actor &&
    previousConfig.bridgeAddress === bridgeAddress;

  return (
    <>
      {modalRender}
      <div className="flex flex-col">
        <Input
          title="Actor"
          tooltip="Email address of the Google Workspace administrator account your Service Account will act on behalf of."
          text={actor}
          setText={setActor}
        />

        <Input
          title="Bridge Address"
          tooltip="The fully-qualified domain name of your 1Password SCIM bridge."
          text={bridgeAddress}
          setText={setBridgeAddress}
        />

        <div className="border-t border-[#DADCE3] mt-4 md:-ml-[15.5rem] mb-6"></div>

        <div className="flex justify-end">
          {previousConfig && (
            <button
              type="button"
              onClick={onDeleteClick}
              className="px-4 border border-red-primary rounded-lg shadow-sm text-sm text-red-primary bg-white hover:text-red-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-light"
            >
              Disconnect
            </button>
          )}
          <button
            type="submit"
            onClick={onSaveClick}
            disabled={disableSaveConfigButton}
            className="ml-3 inline-flex justify-center py-2 px-4 rounded-lg border border-transparent bg-blue-primary text-sm font-medium text-white shadow-sm hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-blue-light focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfigUploader;
