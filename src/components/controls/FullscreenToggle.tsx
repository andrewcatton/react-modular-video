import React from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { Control } from "../ControlBar";
export interface FullScreenToggleProps {
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  fullscreenIcon?: JSX.Element;
  exitIcon?: JSX.Element;
}

export function FullScreenToggle(props: FullScreenToggleProps) {
  return (
    <Control>
      <button
        onKeyDown={e => e.stopPropagation()}
        onClick={props.toggleFullscreen}
      >
        {props.isFullscreen ? (
          props.exitIcon ? (
            props.exitIcon
          ) : (
            <MdFullscreenExit />
          )
        ) : props.fullscreenIcon ? (
          props.fullscreenIcon
        ) : (
          <MdFullscreen />
        )}
      </button>
    </Control>
  );
}
