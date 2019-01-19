import { ReactEventHandler } from "react";

export type VideoEvent = React.SyntheticEvent<HTMLVideoElement, Event>;
export type VideoEventHandler = ReactEventHandler<HTMLVideoElement>;

export function throttle(callback, limit) {
  let wait = false;
  return () => {
    if (!wait) {
      callback(...arguments);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
}

export function createHandler(
  prop?: VideoEventHandler,
  callback?: (event: VideoEvent) => void
) {
  return (event: VideoEvent) => {
    callback && callback(event);
    prop && prop(event);
  };
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds / 60) % 60);
  const secs = Math.floor(seconds % 60);
  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}:`;
    formatted += `${mins < 10 ? "0" : ""}${mins}:`;
  } else {
    formatted += `${mins}:`;
  }
  formatted += `${secs < 10 ? "0" : ""}${secs}`;
  return formatted;
}
