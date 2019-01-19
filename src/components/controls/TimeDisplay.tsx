import * as React from "react";
import { Control } from "../ControlBar";
import styled from "styled-components";
import { formatTime } from "src/utils/helpers";

export enum TimeDisplayType {
  ELAPSED = "elapsed",
  REMAINING = "remaining",
  TOTAL = "total"
}

export interface TimeDisplayProps {
  currentTime: number;
  duration: number;

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

export function TimeDisplay(props: TimeDisplayProps) {
  let currentTime = Math.floor(props.currentTime);
  let duration = Math.floor(props.duration);
  return (
    <Control flex="no-shrink">
      <Span>
        {getTimeDisplay(props.displayType, currentTime, duration)}
        {props.secondaryDisplayType && (props.separator || " / ")}
        {props.secondaryDisplayType &&
          getTimeDisplay(props.secondaryDisplayType, currentTime, duration)}
      </Span>
    </Control>
  );
}
