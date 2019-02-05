import React from "react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { Control } from "../ControlBar";
import { ControlProps } from "./Types";
import classnames from "classnames";

export interface FullScreenToggleProps {
  fullscreenIcon?: JSX.Element;
  exitIcon?: JSX.Element;
  setButtonRef?: () => HTMLButtonElement;
}

export function FullScreenToggle({
  className,
  setContainerRef,
  setButtonRef,
  exitIcon,
  fullscreenIcon,
  player: { toggleFullscreen },
  playerState: { isFullscreen }
}: FullScreenToggleProps & ControlProps) {
  return (
    <Control
      innerRef={setContainerRef}
      className={classnames(className, "rmv__fullscreen-toggle rmv__control")}
    >
      <button
        ref={setButtonRef}
        onKeyDown={e => e.stopPropagation()}
        onClick={toggleFullscreen}
        className="rmv__fullscreen-toggle__button rmv__button"
      >
        {isFullscreen ? (
          exitIcon ? (
            exitIcon
          ) : (
            <MdFullscreenExit className="rmv__fullscreen-toggle__icon rmv__icon" />
          )
        ) : fullscreenIcon ? (
          fullscreenIcon
        ) : (
          <MdFullscreen className="rmv__fullscreen-toggle__icon rmv__icon" />
        )}
      </button>
    </Control>
  );
}
