import React from "react";
import { throttle, formatTime } from "../../utils/helpers";
import Slider, { SliderFill, SliderHandle } from "../slider/Slider";
import { Control } from "../ControlBar";

export interface ProgressBarProps {
  duration: number;
  currentTime: number;
  buffered?: TimeRanges;
  seeking: boolean;
  setCurrentTime: (time: number) => void;
  scrub?: boolean;
  fills?: SliderFill[];
  handles?: SliderHandle[];
  disableAnimate?: boolean;
}

export interface ProgressBarState {}

export class ProgressBar extends React.Component<
  ProgressBarProps,
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
      this.props.setCurrentTime(this.getTimeFromPosition(position));
    }
  };

  onDragEnd = (position: number) => {
    if (!this.props.scrub) {
      this.props.setCurrentTime(this.getTimeFromPosition(position));
    }
  };

  getTimeFromPosition = (position: number) => {
    return (position / 100) * this.props.duration;
  };

  getFormattedTime = (position: number) => {
    return formatTime(this.getTimeFromPosition(position));
  };

  public render() {
    let fills: SliderFill[] = [];
    fills.push({
      color: "#0095ff",
      size: this.props.currentTime,
      position: 0,
      order: 2
    });

    let { buffered } = this.props;
    if (buffered) {
      for (let i = 0; i < buffered.length; i++) {
        const left = buffered.start(i);
        const right = buffered.end(i);
        fills.push({
          color: "#abb1bf",
          position: left,
          size: right - left,
          order: 1
        });
      }
    }
    if (this.props.fills) {
      fills.push(...this.props.fills);
    }

    return (
      <Control flex="grow">
        <Slider
          animate={!this.props.disableAnimate}
          onDrag={this.onDrag}
          onDragEnd={this.onDragEnd}
          maxVal={this.props.duration}
          currVal={this.props.currentTime}
          seeking={this.props.seeking}
          fills={fills}
          sliders={this.props.handles}
          sliderFunc={this.getTimeFromPosition}
          toolTipDisplay={this.getFormattedTime}
          mouseToolTip
        />
      </Control>
    );
  }
}
