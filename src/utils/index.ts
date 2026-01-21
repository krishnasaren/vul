import { BridgeErrorType } from './error';

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
}

// An automatically error handled and authenticated bridge fetch.
// This should never be used directly in a component.
export const bridgeFetch = async (
  method: RequestMethod,
  path: string,
  body?: object,
  bearerTokenOverride?: string,
): Promise<Response> => {
  const token = bearerTokenOverride || getSessionToken();
  const headers = token
    ? {
        Authorization: 'Bearer ' + token,
      }
    : undefined;

  const endpoint =
      import.meta.env.DEV ? '/api' + path : path;
    //process.env.NODE_ENV === 'development' ? '/api' + path : path;


  const res = await fetch(endpoint, {
    method,
    headers,
    body: body && JSON.stringify(body),
  });

  if (res.ok) {
    return res;
  }

  let resDetail = '';
  try {
    const { detail } = await res.json();
    resDetail = detail;
  } catch (err) {
    resDetail = '';
  }

  if (res.status === 401)
    throw { type: BridgeErrorType.Unauthorized, message: resDetail };
  if (res.status === 404)
    throw { type: BridgeErrorType.NotFound, message: resDetail };
  if (res.status >= 400 && res.status < 500)
    throw { type: BridgeErrorType.BadRequest, message: resDetail };
  if (res.status >= 500 && res.status < 600)
    throw { type: BridgeErrorType.InternalServerError, message: resDetail };

  throw { type: BridgeErrorType.Unknown, message: 'Unknown error' };
};

// We want to keep bridgeFetch as an API strictly for Bridge endpoints
// The remoteFetch wrapper should only be used for fetching resources outside of the normal basepath.
// Errors do not need to be handled to such detail.
export const remoteFetch = async (
  method: RequestMethod,
  basePath: string,
  endpoint: string,
): Promise<Response> => {
  const path =
      import.meta.env.DEV ? '/api' + endpoint : endpoint;
    //process.env.NODE_ENV === 'development' ? '/api' + endpoint : endpoint;

  const res = await fetch(`${basePath}${path}`, {
    method,
  });

  if (res.ok) {
    return res;
  }

  const { detail } = await res.json();
  throw detail;
};

export * as validator from './validators';

export const setSessionToken = (sessionToken: string) =>
  sessionStorage.setItem('session-token', sessionToken);

export const clearSessionToken = () => setSessionToken('');

const getSessionToken = () => sessionStorage.getItem('session-token');

export const downloadBlob = (blob: Blob, name: string) => {
  // special url that points to object's memory
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;

  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(blobUrl);
  document.body.removeChild(link);
};

export const fileAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsText(file);
  });
};

export const removeProtocolFromURL = (url: string): string => {
  const regexp = /(^\w+:|^)\/\/|(\/)/g;
  return url.replace(regexp, '');
};
