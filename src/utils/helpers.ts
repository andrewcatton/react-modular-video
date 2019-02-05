import { ReactEventHandler } from "react";

export type VideoEvent = React.SyntheticEvent<HTMLVideoElement, Event>;
export type VideoEventHandler = ReactEventHandler<HTMLVideoElement>;

// export function throttle(callback, limit) {
//   let wait = false;
//   return () => {
//     if (!wait) {
//       callback(...arguments);
//       wait = true;
//       setTimeout(() => {
//         wait = false;
//       }, limit);
//     }
//   };
// }

export const throttle = (func: Function, limit: number) => {
  let lastFunc: NodeJS.Timer;
  let lastRan: number;
  return function() {
    //@ts-ignore
    const context: Function = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

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
