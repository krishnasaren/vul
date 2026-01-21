const CONFIG_UPLOADED = 'configUploaded';
const KEY_UPLOADED = 'keyUploaded';
const MODE = 'mode';

const save = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to save item in local storage:', error);
  }
};

const load = (key: string): string => {
  try {
    return localStorage.getItem(key) || '';
  } catch (error) {
    console.warn('localStorage.getItem failed:', error);
    return '';
  }
};

const remove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('localStorage.removeItem failed:', error);
  }
};

export const getKeyUploaded = (): boolean => {
  return load(KEY_UPLOADED) === 'true';
};

export const saveKeyUploaded = (): void => {
  return save(KEY_UPLOADED, 'true');
};

export const removeKeyUploaded = (): void => {
  return remove(KEY_UPLOADED);
};

export const getConfigUploaded = (): boolean => {
  return load(CONFIG_UPLOADED) === 'true';
};

export const saveConfigUploaded = (): void => {
  return save(CONFIG_UPLOADED, 'true');
};

export const removeConfigUploaded = (): void => {
  return remove(CONFIG_UPLOADED);
};

export const getMode = (): string => {
  return load(MODE);
};

export const saveMode = (mode: string): void => {
  return save(MODE, mode);
};
