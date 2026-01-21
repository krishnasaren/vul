import React from 'react';

const SignInTo1PasswordButton = () => {
  return (
    <button
      onClick={() => (window.location.href = '/signinredirect')}
      className="py-3 px-16 mt-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-primary hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light"
    >
      Sign in with 1Password
    </button>
  );
};

export default SignInTo1PasswordButton;
