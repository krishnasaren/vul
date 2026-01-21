// These are messages shown to the user upon login.

export const enum Message {
  Connected = 'connected',
  Disconnected = 'disconnected',
  KeyDeleted = 'key-deleted',
  ConfigUploaded = 'config-uploaded',
}

export const StatusMessageMap: Record<string, string> = {
  [Message.Connected]:
      'You are now connected to Google Workspace. Enter your bearer token to continue.',
  [Message.KeyDeleted]: 'Your Google Service Account Key was removed.',
  [Message.ConfigUploaded]:
      'Your Google Workspace configuration was updated. Enter your bearer token to continue.',
  [Message.Disconnected]: 'You have been disconnected from Google Workspace.',
};
