import React from 'react';
import { clearSessionToken } from '../utils';
import * as api from '../api';

interface LogoutButtonProps {
  setLocation: (to: string) => void;
}

const LogoutButton = ({ setLocation }: LogoutButtonProps) => {
  const onClick = async () => {
    try {
      await api.logout();
    } finally {
      // if it fails consider session expired
      clearSessionToken();
      setLocation('/app/login');
    }
  };

  return (
    <button onClick={onClick} className="">
      Log out
    </button>
  );
};

export default LogoutButton;
