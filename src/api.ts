import { bridgeFetch, RequestMethod as Method } from './utils';

/*
 * This API file should only contain functions that call the bridgeFetch API utility,
 * as well as the interfaces for the request/response body.
 * Any time we need to hit the API, a function should be created here to fetch the resource using bridgeFetch,
 * with the resource method and path, and should return the response body.
 *
 * This will help us maintain a single place for error handled fetch calls
 */

export interface HealthReport {
  build: string;
  version: string;
  reports: ComponentReport[];
}

export interface ComponentReport {
  source: string;
  time: Date;
  state: State;
  remaining?: string;
}

export enum State {
  Healthy = 'healthy',
  Unknown = 'unknown',
  Unhealthy = 'unhealthy',
}

export const getHealthReport = async (): Promise<HealthReport> => {
  const res = await bridgeFetch(Method.GET, '/status/health');
  return res.json();
};

export interface SessionCheck {
  sessionFileFound: boolean;
}

export const getScimSessionStatus = async (): Promise<SessionCheck> => {
  const res = await bridgeFetch(Method.GET, '/check');
  return res.json();
};

export interface InfoReport {
  connection: boolean;
  session: boolean;
  mode: Mode;
  configMode: ConfigMode;
  beta: boolean;
}

export enum Mode {
  Workspace = 'workspace',
  SCIM = '',
}

export enum ConfigMode {
  EnvVars = 'envvars',
  UI = 'ui',
}

export const getInfoReport = async (): Promise<InfoReport> => {
  const res = await bridgeFetch(Method.GET, '/status/info');
  return res.json();
};

export const getLogs = async (): Promise<string[]> => {
  const res = await bridgeFetch(Method.GET, '/status/logs');
  return res.json();
};

export const getLog = async (log: string): Promise<Blob> => {
  const res = await bridgeFetch(Method.GET, '/status/logs/' + log);
  return res.blob();
};

export interface SyncProgress {
  started: boolean;
  total: number;
  current: number;
  failed: number;
}

export const getSyncProgress = async (): Promise<SyncProgress> => {
  const res = await bridgeFetch(Method.GET, '/workspace/sync');
  return res.json();
};
export interface LoginSession {
  // maybe we should camelCase this on the backend?
  sessiontoken: string;
}

export const getLoginSession = async (
  bearerToken: string,
): Promise<LoginSession> => {
  const res = await bridgeFetch(
    Method.GET,
    '/login/session',
    undefined,
    bearerToken,
  );

  return res.json();
};

export const logout = async (): Promise<void> => {
  await bridgeFetch(Method.DELETE, '/logout');
};

export const getTLSCert = async (domain: string): Promise<string> => {
  const res = await bridgeFetch(Method.GET, `/verify?domain=${domain}`);
  return res.text();
};

export interface ScimSession {
  session: string;
}

export const install = async (scimsession: ScimSession): Promise<void> => {
  await bridgeFetch(Method.POST, '/install', scimsession);
};

export const ping = async (): Promise<void> => {
  await bridgeFetch(Method.GET, '/ping');
};

// The key is an extremely complex type that we do not validate on the client,
// so stating it is a generic object that will be serialized is fine.
export const uploadWorkspaceKey = async (key: object): Promise<void> => {
  await bridgeFetch(Method.POST, '/workspace/credentials', key);
};

export interface WorkspaceGroup {
  id: string;
  email: string;
  name: string;
  description: string;
  adminCreated: boolean;
  directMembersCount: number;
}

export const getAllWorkspaceGroups = async (): Promise<WorkspaceGroup[]> => {
  const res = await bridgeFetch(Method.GET, '/workspace/groups');
  return res.json();
};

export const getWorkspaceGroupsByName = async (
  name: string,
): Promise<WorkspaceGroup[]> => {
  const res = await bridgeFetch(Method.GET, `/workspace/groups/name/${name}`);
  return res.json();
};

export const updateGroupSettings = async (
  settings: string[],
): Promise<void> => {
  await bridgeFetch(Method.POST, '/workspace/groups/settings', settings);
};

export const queueSync = async (): Promise<void> => {
  await bridgeFetch(Method.POST, '/workspace/sync');
};

export const deleteGroup = async (
  workspaceGroup: WorkspaceGroup,
): Promise<void> => {
  await bridgeFetch(Method.DELETE, '/workspace/groups', workspaceGroup);
};

export const getGroupSettings = async (): Promise<string[]> => {
  const res = await bridgeFetch(Method.GET, '/workspace/groups/settings');
  return res.json();
};

export const deleteWorkspaceKey = async (): Promise<void> => {
  await bridgeFetch(Method.DELETE, '/workspace/credentials');
};

export const getWorkspaceKey = async (): Promise<void> => {
  await bridgeFetch(Method.GET, '/workspace/credentials');
};

export interface Config {
  actor: string;
  bridgeAddress: string;
}

export const uploadConfig = async (config: Config): Promise<void> => {
  await bridgeFetch(Method.POST, '/workspace/settings', config);
};

export const deleteConfig = async (): Promise<void> => {
  await bridgeFetch(Method.DELETE, '/workspace/settings');
};

export const restartServer = async (): Promise<void> => {
  await bridgeFetch(Method.GET, '/workspace/restart');
};

export const getConfig = async (): Promise<Config> => {
  const res = await bridgeFetch(Method.GET, '/workspace/settings');

  return res.json();
};
