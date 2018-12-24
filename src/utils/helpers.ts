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

export function createHandler(prop?: VideoEventHandler) {
  return (event: VideoEvent) => {
    if (prop) {
      prop(event);
    }
  };
}
