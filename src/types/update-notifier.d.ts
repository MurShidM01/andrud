declare module 'update-notifier' {
  interface UpdateInfo {
    name: string;
    version: string;
    latest: string;
  }

  interface UpdateNotifier {
    update: UpdateInfo | null;
    notify(options?: NotifyOptions): void;
  }

  interface NotifyOptions {
    defer?: boolean;
    isGlobal?: boolean;
    isPersisted?: boolean;
    suppressForScope?: boolean;
    updateConfig?: {
      behavior?: string;
      excludePrerelease?: boolean;
    };
  }

  interface UpdateNotifierOptions {
    pkg: { name: string; version: string };
    callback?: (update: UpdateNotifier) => void;
    debounceThreshold?: number;
    updateConfig?: {
      checkInterval?: number;
    };
  }

  function updateNotifier(options: UpdateNotifierOptions): UpdateNotifier;
  export default updateNotifier;
}
