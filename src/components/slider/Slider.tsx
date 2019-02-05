import React from "react";
import styled from "styled-components";
import classnames from "classnames";
import { RangeFillCrop, RangeFill } from "./SliderFill";
import {
  HoverHandle,
  RangeHandleTip,
  HoverHandleInner,
  RangeHandle,
  RangeHandleCircle
} from "./SliderHandle";
import { ProgressDragEvent, SliderFill, SliderHandle } from "./Types";

export interface SliderProps {
  classNamePrefix?: string;
  disableMainSlider?: boolean;
  onDrag?: (position: number) => void;
  onDragEnd?: (position: number) => void;
  minVal?: number;
  maxVal: number;
  currVal: number;
  fills?: SliderFill[];
  sliders?: SliderHandle[];
  seeking?: boolean;
  animate?: boolean;
  width?: string;
  toolTipDisplay?: (position: number) => string;
  sliderFunc?: (pos: number) => number;
  backgroundFillColor?: string;
  handleFillColor?: string;
  handleBorderColor?: string;

  setSliderOuterRef?: (el: HTMLDivElement) => void;
  setSliderRailRef?: (el: HTMLDivElement) => void;
  setSliderHandleRef?: (el: HTMLDivElement) => void;
}

export interface SliderState {
  grab: boolean;
  grabPos: number;
  expand: boolean;
  grabs: boolean[];
  grabPoses: number[];
  hoverX: number;
}

const RangeSlider = styled.div<{ expand: boolean; width?: string }>`
  width: ${({ width }) => (width ? width : "100%")};
  position: relative;
  background: aliceblue;
  border: none;
  margin-top: 5px;
  margin-bottom: 5px;

  height: ${({ expand }) => (expand ? "8px" : "4px")};

  transition: height 0.2s ease;
  cursor: pointer;

  display: flex;
  align-items: center;
  border-radius: 4px;
`;

const RangeSliderRail = styled.div`
  position: relative;
  width: calc(100% - 4px);

  height: 100%;
  background: transparent;
  left: 2px;
`;

export class Slider extends React.Component<SliderProps, SliderState> {
  sliderOuterRef!: HTMLDivElement;
  setSliderOuterRef = (el: HTMLDivElement) => {
    this.sliderOuterRef = el;
    if (this.props.setSliderOuterRef) {
      this.props.setSliderOuterRef(el);
    }
  };
  sliderRailRef!: HTMLDivElement;
  setSliderRailRef = (el: HTMLDivElement) => {
    this.sliderRailRef = el;
    if (this.props.setSliderRailRef) {
      this.props.setSliderRailRef(el);
    }
  };
  handleRef!: HTMLDivElement;
  setHandleRef = (el: HTMLDivElement) => {
    this.handleRef = el;
    if (this.props.setSliderHandleRef) {
      this.props.setSliderHandleRef(el);
    }
  };

  extraSliderRefs: HTMLDivElement[];
  setExtraSliderRef = (el: HTMLDivElement, i: number) => {
    this.extraSliderRefs[i] = el;
  };

  constructor(props) {
    super(props);
    this.state = {
      grab: false,
      grabPos: 0,
      expand: false,
      grabs: [],
      grabPoses: [],
      hoverX: 0
    };
    this.extraSliderRefs = [];
  }

  componentDidUpdate(prevProps: SliderProps, prevState: SliderState) {
    if (this.state.grab && !this.props.seeking && prevProps.seeking) {
      this.setState({ grab: false });
    }
  }

  isTouch = (
    event: ProgressDragEvent
  ): event is React.TouchEvent<HTMLDivElement> => {
    return (event as React.TouchEvent).touches !== undefined;
  };

  getGrabPosition = (e: ProgressDragEvent) => {
    let clientX: number;
    if (this.isTouch(e)) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const sliderRect = this.sliderRailRef.getBoundingClientRect();
    const sliderLeft = sliderRect.left;
    const sliderWidth = sliderRect.width;

    const position = ((clientX - sliderLeft) / sliderWidth) * 100;
    return Math.max(Math.min(position, 100), 0);
  };

  extraDrag?: Function;
  extraEnd?: Function;
  handleExtraSliderStart = (e: ProgressDragEvent, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    this.extraDrag = e => this.handleExtraDrag(e as any, i);
    this.extraEnd = e => this.handleExtraEnd(e as any, i);

    document.addEventListener("mousemove", this.extraDrag as any);
    document.addEventListener("mouseup", this.extraEnd as any);
    let grabs = [...this.state.grabs];
    grabs[i] = true;
    this.setState({ grabs });
  };

  handleHandleStart = (e: ProgressDragEvent) => {
    document.addEventListener("mousemove", this.handleDrag as any);
    document.addEventListener("mouseup", this.handleEnd as any);
    this.setState({ grab: true });
  };

  handleSliderStart = (e: ProgressDragEvent) => {
    document.addEventListener("mousemove", this.handleDrag as any);
    document.addEventListener("mouseup", this.handleEnd as any);
    this.setState({ grab: true });
    this.handleDrag(e);
  };

  handleExtraDrag = (e: ProgressDragEvent, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    let grabPos = this.getGrabPosition(e);
    let grabPoses = [...this.state.grabPoses];
    grabPoses[i] = grabPos;
    this.setState({ grabPoses });
    if (this.props.sliders) {
      let slider = this.props.sliders[i];
      if (slider.onDrag && this.props.sliderFunc) {
        let val = this.props.sliderFunc(grabPos);
        slider.onDrag(val);
      }
    }
  };

  handleDrag = (e: ProgressDragEvent) => {
    e.preventDefault();
    let grabPos = this.getGrabPosition(e);
    this.setState({ grabPos });
    if (this.props.onDrag) {
      this.props.onDrag(grabPos);
    }
  };

  handleExtraEnd = (e: ProgressDragEvent, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    document.removeEventListener("mousemove", this.extraDrag as any);
    document.removeEventListener("mouseup", this.extraEnd as any);
    if (this.props.sliders) {
      let slider = this.props.sliders[i];
      if (slider.onDragEnd && this.props.sliderFunc) {
        slider.onDragEnd(this.props.sliderFunc(this.state.grabPoses[i]));
      }
    }
    let grabs = [...this.state.grabs];
    grabs[i] = false;
    this.setState({ grabs });
  };

  handleEnd = (e: ProgressDragEvent) => {
    document.removeEventListener("mousemove", this.handleDrag as any);
    document.removeEventListener("mouseup", this.handleEnd as any);
    if (this.props.onDragEnd) {
      this.props.onDragEnd(this.state.grabPos);
    }
  };

  getHandlePosition = () => {
    if (this.state.grab) {
      return this.state.grabPos;
    } else if (
      this.props.currVal !== undefined &&
      this.props.maxVal !== undefined &&
      this.props.maxVal > 0
    ) {
      const val = (this.props.currVal / this.props.maxVal) * 100;
      return Math.max(Math.min(val, 100), 0);
    } else {
      return 0;
    }
  };

  getExtraHandlePosition = (slider: SliderHandle, i: number) => {
    if (this.state.grabs[i] && this.state.grabPoses[i]) {
      return this.state.grabPoses[i];
    } else if (
      slider.position !== undefined &&
      this.props.maxVal !== undefined &&
      this.props.maxVal > 0
    ) {
      const val = (slider.position / this.props.maxVal) * 100;
      return Math.max(Math.min(val, 100), 0);
    } else {
      return 0;
    }
  };

  getFillPos = (pos: number) => {
    let calcPos = (pos / this.props.maxVal) * 100;
    return Math.max(Math.min(calcPos, 100), 0);
  };

  getFillSize = (size: number, pos: number) => {
    let calcPos = (pos / this.props.maxVal) * 100;
    let calcSize = (size / this.props.maxVal) * 100;

    return Math.max(Math.min(calcSize, 100 - calcPos), 0);
  };

  handleMouseOver = (e: React.MouseEvent) => {
    this.expand();
    document.addEventListener("mousemove", this.handleMouseMove, false);
  };

  handleMouseLeave = (e: React.MouseEvent) => {
    this.collapse();
    document.removeEventListener("mousemove", this.handleMouseMove, false);
  };

  handleMouseMove = (e: MouseEvent) => {
    const clientX = e.clientX;

    const sliderRect = this.sliderRailRef.getBoundingClientRect();
    const sliderLeft = sliderRect.left;
    const sliderWidth = sliderRect.width;

    const position = ((clientX - sliderLeft) / sliderWidth) * 100;
    const hoverX = Math.max(Math.min(position, 100), 0);
    this.setState({ hoverX });
  };

  expand = () => this.setState({ expand: true });
  collapse = () => this.setState({ expand: false });

  public render() {
    const {
      classNamePrefix,
      sliders,
      animate,
      width,
      handleBorderColor,
      handleFillColor,
      toolTipDisplay,
      fills,
      disableMainSlider
    } = this.props;

    const className = classNamePrefix + "__slider";
    const { grab, grabs, expand, hoverX } = this.state;

    const handlePos = this.getHandlePosition();

    const extraHandlePoses = sliders
      ? sliders.map((slider, i) => this.getExtraHandlePosition(slider, i))
      : [];
    let grabbed = grab;
    if (!grabbed) {
      grabs &&
        grabs.forEach(val => {
          if (val) {
            grabbed = true;
          }
        });
    }
    const isExpanded = !animate || expand || grabbed;
    return (
      <RangeSlider
        className={classnames("rmv__slider", className)}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        expand={isExpanded}
        innerRef={this.setSliderOuterRef}
        onMouseDown={this.handleSliderStart}
        onMouseUp={this.handleEnd}
        onTouchStart={this.handleSliderStart}
        onTouchEnd={this.handleEnd}
        width={width}
      >
        <RangeSliderRail
          className={classnames("rmv__slider__rail", className + "__rail")}
          innerRef={this.setSliderRailRef}
        >
          {!grab && isExpanded && (
            <HoverHandle
              className={classnames(
                "rmv__slider__hover",
                className + "__hover"
              )}
              expand={isExpanded}
              position={hoverX}
            >
              {toolTipDisplay && (
                <RangeHandleTip
                  className={classnames(
                    "rmv__slider__tool-tip",
                    className + "__tool-tip"
                  )}
                  invert
                >
                  {toolTipDisplay(hoverX)}
                </RangeHandleTip>
              )}
              <HoverHandleInner
                className={classnames(
                  "rmv__slider__hover__inner",
                  className + "__hover__inner"
                )}
                expand={isExpanded}
              />
            </HoverHandle>
          )}

          {sliders &&
            sliders.map((slider, index) => {
              return (
                <RangeHandle
                  className={classnames(
                    "rmv__slider__handle",
                    "rmv__slider__handle-extra",
                    className + "__handle",
                    className + "__handle-extra"
                  )}
                  key={index}
                  expand={isExpanded}
                  innerRef={el => this.setExtraSliderRef(el, index)}
                  position={extraHandlePoses[index]}
                  onMouseDown={e => this.handleExtraSliderStart(e, index)}
                  onMouseUp={e => this.handleExtraEnd(e, index)}
                  onTouchStart={e => this.handleExtraSliderStart(e, index)}
                  onTouchEnd={e => this.handleExtraEnd(e, index)}
                >
                  {grabs[index] && toolTipDisplay && (
                    <RangeHandleTip
                      className={classnames(
                        "rmv__slider__tool-tip",
                        className + "__tool-tip"
                      )}
                    >
                      {toolTipDisplay(extraHandlePoses[index])}
                    </RangeHandleTip>
                  )}
                  <RangeHandleCircle
                    fillColor={handleFillColor}
                    borderColor={handleBorderColor}
                    className={classnames(
                      "rmv__slider__handle__inner",
                      "rmv__slider__handle__inner-extra",
                      className + "__handle__inner",
                      className + "__handle__inner-extra"
                    )}
                    expand={isExpanded}
                  />
                </RangeHandle>
              );
            })}
          {!disableMainSlider && (
            <RangeHandle
              className={classnames(
                "rmv__slider__handle-main",
                "rmv__slider__handle",
                className + "__handle-main",
                className + "__handle"
              )}
              expand={isExpanded}
              innerRef={this.setHandleRef}
              position={handlePos}
              onMouseDown={this.handleHandleStart}
              onMouseUp={this.handleEnd}
              onTouchStart={this.handleHandleStart}
              onTouchEnd={this.handleEnd}
            >
              {grab && toolTipDisplay && (
                <RangeHandleTip
                  className={classnames(
                    "rmv__slider__tool-tip",
                    className + "__tool-tip"
                  )}
                >
                  {toolTipDisplay(handlePos)}
                </RangeHandleTip>
              )}
              <RangeHandleCircle
                className={classnames(
                  "rmv__slider__handle__inner",
                  "rmv__slider__handle__inner-main",
                  className + "__handle__inner",
                  className + "__handle__inner-main"
                )}
                expand={isExpanded}
              />
            </RangeHandle>
          )}
        </RangeSliderRail>
        <RangeFillCrop
          className={classnames(
            "rmv__slider__fill-crop",
            className + "__fill-crop"
          )}
        >
          {fills &&
            fills.map((fill, index) => {
              return (
                <RangeFill
                  className={classnames(
                    "rmv__slider__fill",
                    className + "__fill"
                  )}
                  order={fill.order}
                  color={fill.color}
                  key={index}
                  size={this.getFillSize(fill.size, fill.position)}
                  position={this.getFillPos(fill.position)}
                />
              );
            })}
        </RangeFillCrop>
      </RangeSlider>
    );
  }
}
