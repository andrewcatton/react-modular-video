import React from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { Control } from "../ControlBar";
export interface FullScreenToggleProps {
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function FullScreenToggle(props: FullScreenToggleProps) {
  return (
    <Control>
      <button
        onKeyDown={e => e.stopPropagation()}
        onClick={props.toggleFullscreen}
      >
        {props.isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
      </button>
    </Control>
  );
}
