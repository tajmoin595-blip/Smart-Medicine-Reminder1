import { getSettings } from './storage';

// Audio Synthesizer for gentle healthcare chime alerts using Web Audio API
export const playReminderSound = () => {
  try {
    const settings = getSettings();
    const volume = (settings.reminderVolume ?? 80) / 100;
    if (volume <= 0) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Gentle 2-tone healthcare chime (E5 -> B5)
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3 * volume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(659.25, now, 0.6); // E5
    playNote(987.77, now + 0.25, 0.9); // B5
  } catch (err) {
    console.warn('Could not play reminder chime:', err);
  }
};

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const triggerBrowserNotification = (title: string, body: string, icon?: string) => {
  const settings = getSettings();
  if (!settings.browserNotificationsEnabled) return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
        tag: 'medicare-reminder'
      });
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  }

  playReminderSound();
};
