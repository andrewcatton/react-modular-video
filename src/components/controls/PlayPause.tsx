import React from "react";
import { MdPause, MdPlayArrow } from "react-icons/md";
import { Control } from "../ControlBar";
import { ControlButtonProps } from "./Types";
import classnames from "classnames";

export interface PlayPauseProps {
  playIcon?: JSX.Element;
  pauseIcon?: JSX.Element;
}

export function PlayPause({
  playIcon,
  pauseIcon,
  setContainerRef,
  setButtonRef,
  className,
  player: { togglePlay },
  playerState: { playing }
}: PlayPauseProps & ControlButtonProps) {
  return (
    <Control
      className={classnames(className, "play-pause rmv__control")}
      innerRef={setContainerRef}
    >
      <button
        className="play-pause__button rmv__button"
        ref={setButtonRef}
        onKeyDown={e => e.stopPropagation()}
        onClick={togglePlay}
      >
        {playing ? (
          pauseIcon ? (
            pauseIcon
          ) : (
            <MdPause className="play-pause__icon rmv__icon" />
          )
        ) : playIcon ? (
          playIcon
        ) : (
          <MdPlayArrow className="play-pause__icon rmv__icon" />
        )}
      </button>
    </Control>
  );
}
