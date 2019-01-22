import * as React from "react";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";
import { Control } from "../ControlBar";

export interface FrameSkipProps {
  reverse?: boolean;
  frameRate?: number;
  skip: (time: number) => void;
  forwardIcon?: JSX.Element;
  reverseIcon?: JSX.Element;
}

export function FrameSkip(props: FrameSkipProps) {
  return (
    <Control>
      <button
        onKeyDown={e => e.stopPropagation()}
        onClick={() =>
          props.skip(
            (props.reverse ? -1 : 1) * (1 / (props.frameRate || 29.97))
          )
        }
      >
        {props.reverse ? (
          props.reverseIcon ? (
            props.reverseIcon
          ) : (
            <MdSkipPrevious />
          )
        ) : props.forwardIcon ? (
          props.forwardIcon
        ) : (
          <MdSkipNext />
        )}
      </button>
    </Control>
  );
}
