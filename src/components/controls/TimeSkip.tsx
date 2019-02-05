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
import { ControlButtonProps } from "./Types";
import classnames from "classnames";

export interface TimeSkipProps {
  amount: 5 | 10 | 30;
  reverse?: boolean;
  skipIcon?: JSX.Element;
}

function getReplayIcon(amount: number) {
  switch (amount) {
    case 5:
      return <MdReplay5 className="rmv__time-skip__icon rmv__icon" />;
    case 10:
      return <MdReplay10 className="rmv__time-skip__icon rmv__icon" />;
    case 30:
      return <MdReplay30 className="rmv__time-skip__icon rmv__icon" />;
  }
}
function getForwardIcon(amount: number) {
  switch (amount) {
    case 5:
      return <MdForward5 className="rmv__time-skip__icon rmv__icon" />;
    case 10:
      return <MdForward10 className="rmv__time-skip__icon rmv__icon" />;
    case 30:
      return <MdForward30 className="rmv__time-skip__icon rmv__icon" />;
  }
}
export function TimeSkip({
  className,
  setContainerRef,
  setButtonRef,
  skipIcon,
  reverse,
  amount,
  player: { skip }
}: TimeSkipProps & ControlButtonProps) {
  return (
    <Control
      className={classnames(className, "rmv__time-skip rmv__control")}
      innerRef={setContainerRef}
    >
      <button
        className="rmv__time-skip__button rmv__button"
        ref={setButtonRef}
        onKeyDown={e => e.stopPropagation()}
        onClick={() => skip((reverse ? -1 : 1) * amount)}
      >
        {skipIcon
          ? skipIcon
          : reverse
          ? getReplayIcon(amount)
          : getForwardIcon(amount)}
      </button>
    </Control>
  );
}
