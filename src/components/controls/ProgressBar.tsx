import React from "react";
import { throttle, formatTime } from "../../utils/helpers";
import { Control } from "../ControlBar";
import { ControlProps } from "./Types";
import classnames from "classnames";
import { SliderFill, SliderHandle, Slider } from "../slider";

export interface ProgressBarProps {
  scrub?: boolean;
  extraFills?: SliderFill[];
  extraHandles?: SliderHandle[];
  disableAnimate?: boolean;
  bufferedFillOrder?: number;
  bufferedFillColor?: string;
  progressFillOrder?: number;
  progressFillColor?: string;
  handleFillColor?: string;
  handleBorderColor?: string;
  backgroundFillColor?: string;
  disableMainSlider?: boolean;
  disableBufferBar?: boolean;
  disableMouseTooltip?: boolean;
}

export interface ProgressBarState {}

export class ProgressBar extends React.Component<
  ProgressBarProps & ControlProps,
  ProgressBarState
> {
  constructor(props) {
    super(props);
    if (this.props.scrub) {
      this.onDrag = throttle(this.onDrag, 100);
    }
    this.state = {};
  }

  onDrag = (position: number) => {
    if (this.props.scrub) {
      this.props.player.seek(this.getTimeFromPosition(position));
    }
  };

  onDragEnd = (position: number) => {
    if (!this.props.scrub) {
      this.props.player.seek(this.getTimeFromPosition(position));
    }
  };

  getTimeFromPosition = (position: number) => {
    return (position / 100) * this.props.playerState.duration;
  };

  getFormattedTime = (position: number) => {
    return formatTime(this.getTimeFromPosition(position));
  };

  render() {
    const {
      className,
      extraFills,
      extraHandles,
      disableMainSlider,
      disableBufferBar,
      disableAnimate,
      progressFillColor,
      backgroundFillColor,
      bufferedFillColor,
      bufferedFillOrder,
      handleFillColor,
      handleBorderColor,
      disableMouseTooltip,
      progressFillOrder,
      playerState: { currentTime, buffered, duration, seeking }
    } = this.props;

    let fills: SliderFill[] = [];
    if (!disableMainSlider) {
      fills.push({
        color: progressFillColor ? progressFillColor : "#0095ff",
        size: currentTime,
        position: 0,
        order: progressFillOrder ? progressFillOrder : 2
      });
    }

    if (buffered && !disableBufferBar) {
      for (let i = 0; i < buffered.length; i++) {
        const left = buffered.start(i);
        const right = buffered.end(i);
        fills.push({
          color: bufferedFillColor ? bufferedFillColor : "#abb1bf",
          position: left,
          size: right - left,
          order: bufferedFillOrder ? bufferedFillOrder : 1
        });
      }
    }

    if (extraFills) {
      fills.push(...extraFills);
    }

    return (
      <Control
        flex="grow"
        className={classnames(className, "rmv__progress-bar rmv__control")}
      >
        <Slider
          classNamePrefix="rmv__progress-bar"
          backgroundFillColor={backgroundFillColor}
          handleFillColor={handleFillColor}
          handleBorderColor={handleBorderColor}
          disableMainSlider={disableMainSlider}
          disableAnimate={disableAnimate}
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}
          maxVal={duration}
          currVal={currentTime}
          seeking={seeking}
          fills={fills}
          sliders={extraHandles}
          sliderFunc={this.getTimeFromPosition}
          toolTipDisplay={
            this.props.disableMouseTooltip ? undefined : this.getFormattedTime
          }
        />
      </Control>
    );
  }
}
