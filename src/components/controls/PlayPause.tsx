import React from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { Control } from "../ControlBar";
export interface PlayPauseProps {
  togglePlay: () => void;
  isPlaying: boolean;
}

export function PlayPause(props: PlayPauseProps) {
  return (
    <Control>
      <button onKeyDown={e => e.stopPropagation()} onClick={props.togglePlay}>
        {props.isPlaying ? <MdPause /> : <MdPlayArrow />}
      </button>
    </Control>
  );
}
