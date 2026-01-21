// email address validator that uses the browser's build in validator.
export const validateEmailAddress = (s: string): boolean => {
  const input = document.createElement('input');
  input.type = 'email';
  input.required = true;
  input.value = s;

  // if their browser can't do it, fall back to server check
  return typeof input.checkValidity === 'function'
    ? input.checkValidity()
    : true;
};

// domain validator copied from the golang standard library
export const validateDomain = (s: string): boolean => {
  let l = s.length;
  if (l === 0 || l > 254 || (l === 254 && s[l - 1] != '.')) {
    return false;
  }

  let last = '.';
  let nonNumeric = false;
  let partLen = 0;

  for (let i = 0; i < l; i++) {
    let c = s[i];
    if (('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || c == '_') {
      nonNumeric = true;
      partLen++;
    } else if ('0' <= c && c <= '9') {
      partLen++;
    } else if (c === '-') {
      if (last === '.') {
        return false;
      }
      partLen++;
      nonNumeric = true;
    } else if (c === '.') {
      if (last === '.' || last === '-') {
        return false;
      }
      if (partLen > 63 || partLen === 0) {
        return false;
      }
      partLen = 0;
    } else {
      return false;
    }
    last = c;
  }

  if (last === '-' || partLen > 63) {
    return false;
  }

  return nonNumeric;
};

export enum ValidationErrorType {
  NoError = 'NoError',
  NotSecureProtocol = 'NotSecureProtocol',
  TrailingSlash = 'TrailingSlash',
  InvalidDomain = 'InvalidDomain',
}

// Secure protocol
const protocol = 'https://';

// Validates that the url starts with https://, does not have a trailing slash, and is a valid domain format.
export const validateSecureDomain = (url: string): ValidationErrorType => {
  if (!url.startsWith(protocol)) {
    return ValidationErrorType.NotSecureProtocol;
  }

  if (url.endsWith('/')) {
    return ValidationErrorType.TrailingSlash;
  }

  const domain = url.slice(protocol.length);
  if (!validateDomain(domain)) {
    return ValidationErrorType.InvalidDomain;
  }

  return ValidationErrorType.NoError;
};

/*
 * .match() will return null if the string doesn't match the regex pattern,
 * so we derive a boolean value based on whether the passed in string is an ipv4 address.
 * For example: !!("192.0.2.146").match('...') is true but !!("scim.example.com").match('...') is false
 *
 */
export const isIpv4Domain = (s: string): boolean => {
  return !!s.match(
    '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}',
  );
};
