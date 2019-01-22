import * as React from "react";
import {
  MdForward5,
  MdForward10,
  MdForward30,
  MdReplay5,
  MdReplay10,
  MdReplay30
} from "react-icons/md";
import { Control } from "../ControlBar";

export interface TimeSkipProps {
  amount: 5 | 10 | 30;
  reverse?: boolean;
  skip: (time: number) => void;
  forwardIcon?: JSX.Element;
  replayIcon?: JSX.Element;
}

function getReplayIcon(amount: number) {
  switch (amount) {
    case 5:
      return <MdReplay5 />;
    case 10:
      return <MdReplay10 />;
    case 30:
      return <MdReplay30 />;
  }
}
function getForwardIcon(amount: number) {
  switch (amount) {
    case 5:
      return <MdForward5 />;
    case 10:
      return <MdForward10 />;
    case 30:
      return <MdForward30 />;
  }
}
export function TimeSkip(props: TimeSkipProps) {
  return (
    <Control>
      <button
        onKeyDown={e => e.stopPropagation()}
        onClick={() => props.skip((props.reverse ? -1 : 1) * props.amount)}
      >
        {props.reverse
          ? props.replayIcon
            ? props.replayIcon
            : getReplayIcon(props.amount)
          : props.forwardIcon
          ? props.forwardIcon
          : getForwardIcon(props.amount)}
      </button>
    </Control>
  );
}
