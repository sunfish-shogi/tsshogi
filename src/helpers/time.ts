export function millisecondsToHHMMSS(ms: number): string {
  return secondsToHHMMSS(Math.floor(ms / 1e3));
}

export function millisecondsToMSS(ms: number): string {
  return secondsToMSS(Math.floor(ms / 1e3));
}

export function secondsToHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds - h * 3600) / 60);
  const s = seconds % 60;
  return (
    String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
  );
}

export function secondsToMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, " ") + ":" + String(s).padStart(2, "0");
}
