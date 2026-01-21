import { remoteFetch, RequestMethod as Method } from './utils';

/* Similarly to the api.js file, this API file should only contain functions that call the remoteFetch API utility,
 * as well as the interfaces for the request/response body.
 *
 * The purpose of splitting these two files is to highlight
 * that we are providing the basepath for the request in this file, and not hitting our relative "/" API.
 *
 * For example, with getHealthCheck(), we need to call `https://scim.example.com/health`
 * from our current location of `http://scim.example.com/health`
 * in order to finish the domain verification process. We want to split these ideas out
 * so we don't have to be concerned with retrieving the correct base path everytime when using bridgeFetch
 */

export const getHealthCheck = async (basePath: string): Promise<void> => {
  await remoteFetch(Method.GET, basePath, '/health');
};
