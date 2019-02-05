import * as React from "react";
import { Control } from "../ControlBar";
import styled from "styled-components";
import { formatTime } from "src/utils/helpers";
import { ControlProps } from "./Types";
import classnames from "classnames";

export enum TimeDisplayType {
  ELAPSED = "elapsed",
  REMAINING = "remaining",
  TOTAL = "total"
}

export interface TimeDisplayProps {
  displayType: TimeDisplayType;
  secondaryDisplayType?: TimeDisplayType;
  separator?: string;
}

function getTimeDisplay(
  displayType: TimeDisplayType,
  currentTime: number,
  duration: number
) {
  switch (displayType) {
    case TimeDisplayType.ELAPSED:
      return formatTime(currentTime);
    case TimeDisplayType.REMAINING:
      return formatTime(duration - currentTime);
    case TimeDisplayType.TOTAL:
      return formatTime(duration);
  }
}

const Span = styled.span`
  color: white;
  pointer-events: none;
`;

export function TimeDisplay({
  className,
  setContainerRef,
  separator,
  displayType,
  secondaryDisplayType,
  playerState: { duration, currentTime }
}: TimeDisplayProps & ControlProps) {
  let roundedCurrentTime = Math.floor(currentTime);
  let roundedDuration = Math.floor(duration);
  return (
    <Control
      innerRef={setContainerRef}
      className={classnames(className, "time-display rmv__control")}
      flex="no-shrink"
    >
      <Span className="time-display__span rmv__span">
        {getTimeDisplay(displayType, roundedCurrentTime, roundedDuration)}
        {secondaryDisplayType && (separator || " / ")}
        {secondaryDisplayType &&
          getTimeDisplay(
            secondaryDisplayType,
            roundedCurrentTime,
            roundedDuration
          )}
      </Span>
    </Control>
  );
}
