import * as React from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { Control } from "../ControlBar";
import { ControlButtonProps } from "./Types";
import classnames from "classnames";

export interface FrameSkipProps {
  reverse?: boolean;
  skipIcon?: JSX.Element;
  framerate?: number;
}

export function FrameSkip({
  className,
  setContainerRef,
  reverse,
  skipIcon,
  setButtonRef,
  framerate,
  player: { skip }
}: FrameSkipProps & ControlButtonProps) {
  return (
    <Control
      className={classnames(className, "frame-skip rmv__control")}
      innerRef={setContainerRef}
    >
      <button
        className="frame-skip__button rmv__button"
        ref={setButtonRef}
        onKeyDown={e => e.stopPropagation()}
        onClick={() => skip((reverse ? -1 : 1) * (1 / (framerate || 29.97)))}
      >
        {skipIcon ? (
          skipIcon
        ) : reverse ? (
          <MdSkipPrevious className="frame-skip__icon  rmv__icon" />
        ) : (
          <MdSkipNext className="frame-skip__icon  rmv__icon" />
        )}
      </button>
    </Control>
  );
}
