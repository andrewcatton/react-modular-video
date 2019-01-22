import React from "react";
import styled from "styled-components";
import { formatTime } from "src/utils/helpers";

export type ProgressDragEvent =
  | React.MouseEvent<HTMLDivElement>
  | React.TouchEvent<HTMLDivElement>;

export type SliderFill = {
  color: string;
  size: number;
  position: number;
  order: number;
};

export type SliderHandle = {
  style: "bar" | "cirlce";
  position: number;
  onDrag?: (position: number) => void;
  onDragEnd?: (position: number) => void;
};

export interface SliderProps {
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
  mouseToolTip?: boolean;
  sliderFunc?: (pos: number) => number;
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
  width: ${props => (props.width ? props.width : "100%")};
  position: relative;
  background: aliceblue;
  border: none;
  margin-top: 5px;
  margin-bottom: 5px;

  height: ${props => (props.expand ? "8px" : "4px")};

  transition: height 0.2s ease;
  cursor: pointer;

  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 4px;
`;

const RangeSliderRail = styled.div`
  position: relative;
  width: calc(100% - 4px);

  height: 100%;
  background: transparent;
  left: 2px;
`;

const RangeFill = styled.div.attrs<{
  size: number;
  position: number;
  color: string;
  order: number;
}>({
  style: props => ({
    width: props.size + "%",
    marginLeft: props.position + "%"
  })
})`
  position: absolute;

  height: 100%;
  background-color: ${props => props.color};
  z-index: ${props => props.order};
  // transition: width 0.1s ease;
`;

const RangeHandle = styled.div.attrs<{ position: number; expand: boolean }>({
  style: props => ({
    marginLeft: props.position + "%"
  })
})`
  position: absolute;
  z-index: 999;
  border-radius: 100%;
  // transition: margin-left 0.1s ease;
  opacity: ${props => (props.expand ? 1 : 0)};

  display: flex;
  justify-content: center;
  align-items: center;
  left: -5px;
  width: 10px;
  height: 100%;
`;

const RangeHandleCircle = styled.div<{ expand: boolean }>`
  height: ${props => (props.expand ? "10px" : 0)};
  width: ${props => (props.expand ? "10px" : 0)};
  border-radius: 100%;
  background: white;
  border: 1px solid #f1f1f1;
  flex: 0 0 auto;
  transition: width 0.2s ease, height 0.2s ease;
`;

const RangeHandleBar = styled.div<{ expand: boolean }>`
  height: ${props => (props.expand ? "10px" : 0)};
  width: ${props => (props.expand ? "2px" : 0)};
  background: black;
  border: none;
  flex: 0 0 auto;
  cursor: col-resize;
  transition: width 0.2s ease, height 0.2s ease;

  &:before {
    content: "";
    width: 6px;
    height: 2px;
    position: absolute;
    left: 2px;
    background: black;
    top: -1px;
  }
  &:after {
    content: "";
    width: 6px;
    height: 2px;
    position: absolute;
    left: 2px;
    background: black;
    bottom: -1px;
  }
`;

const RangeHandleTip = styled.div<{ invert?: boolean }>`
  position: absolute;
  background: ${props => (props.invert ? "#000" : "#fff")};
  color: ${props => (props.invert ? "#fff" : "#000")};
  padding: 2px 5px;
  border-radius: 4px;
  bottom: 12px;
  opacity: 0.8;
`;

const HoverHandle = styled.div.attrs<{ position: number; expand: boolean }>({
  style: props => ({
    marginLeft: props.position + "%"
  })
})`
  position: absolute;
  z-index: 999;
  border-radius: 100%;
  // transition: margin-left 0.1s ease;
  opacity: ${props => (props.expand ? 1 : 0)};

  display: flex;
  justify-content: center;
  align-items: center;
  left: -5px;
  width: 10px;
  height: 100%;
`;

const HoverHandleInner = styled.div<{ expand: boolean }>`
  height: ${props => (props.expand ? "10px" : 0)};
  width: ${props => (props.expand ? "1px" : 0)};
  border-radius: 0;
  opacity: 0.5;
  background: black;
  border: none;
  flex: 0 0 auto;
`;

export default class Slider extends React.Component<SliderProps, SliderState> {
  sliderRef!: HTMLDivElement;
  setSliderRef = (el: HTMLDivElement) => {
    this.sliderRef = el;
  };
  sliderRailRef!: HTMLDivElement;
  setSliderRailRef = (el: HTMLDivElement) => {
    this.sliderRailRef = el;
  };
  handleRef!: HTMLDivElement;
  setHandleRef = (el: HTMLDivElement) => {
    this.handleRef = el;
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
      return (this.props.currVal / this.props.maxVal) * 100;
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
      return (slider.position / this.props.maxVal) * 100;
    } else {
      return 0;
    }
  };

  getFillPos = (pos: number) => {
    return (pos / this.props.maxVal) * 100;
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
    const handlePos = this.getHandlePosition();

    const extraHandlePoses = this.props.sliders
      ? this.props.sliders.map((slider, i) =>
          this.getExtraHandlePosition(slider, i)
        )
      : [];
    let grabbed = this.state.grab;
    if (!grabbed) {
      this.state.grabs &&
        this.state.grabs.forEach(val => {
          if (val) {
            grabbed = true;
          }
        });
    }
    const expand = !this.props.animate || this.state.expand || grabbed;
    return (
      <RangeSlider
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        expand={expand}
        innerRef={this.setSliderRef}
        onMouseDown={this.handleSliderStart}
        onMouseUp={this.handleEnd}
        onTouchStart={this.handleSliderStart}
        onTouchEnd={this.handleEnd}
        width={this.props.width}
      >
        <RangeSliderRail innerRef={this.setSliderRailRef}>
          {this.props.mouseToolTip && !this.state.grab && this.state.expand && (
            <HoverHandle expand={expand} position={this.state.hoverX}>
              {this.props.toolTipDisplay && (
                <RangeHandleTip invert>
                  {this.props.toolTipDisplay(this.state.hoverX)}
                </RangeHandleTip>
              )}
              <HoverHandleInner expand={expand} />
            </HoverHandle>
          )}

          {this.props.sliders &&
            this.props.sliders.map((slider, index) => {
              const RangeHandleInner =
                slider.style === "bar" ? RangeHandleBar : RangeHandleCircle;
              return (
                <RangeHandle
                  key={index}
                  expand={expand}
                  innerRef={el => this.setExtraSliderRef(el, index)}
                  position={extraHandlePoses[index]}
                  onMouseDown={e => this.handleExtraSliderStart(e, index)}
                  onMouseUp={e => this.handleExtraEnd(e, index)}
                  onTouchStart={e => this.handleExtraSliderStart(e, index)}
                  onTouchEnd={e => this.handleExtraEnd(e, index)}
                >
                  {this.state.grabs[index] && this.props.toolTipDisplay && (
                    <RangeHandleTip>
                      {this.props.toolTipDisplay(extraHandlePoses[index])}
                    </RangeHandleTip>
                  )}
                  <RangeHandleInner expand={expand} />
                </RangeHandle>
              );
            })}
          <RangeHandle
            expand={expand}
            innerRef={this.setHandleRef}
            position={handlePos}
            onMouseDown={this.handleHandleStart}
            onMouseUp={this.handleEnd}
            onTouchStart={this.handleHandleStart}
            onTouchEnd={this.handleEnd}
          >
            {this.state.grab && this.props.toolTipDisplay && (
              <RangeHandleTip>
                {this.props.toolTipDisplay(handlePos)}
              </RangeHandleTip>
            )}
            <RangeHandleCircle expand={expand} />
          </RangeHandle>
        </RangeSliderRail>

        {this.props.fills &&
          this.props.fills.map((fill, index) => {
            return (
              <RangeFill
                order={fill.order}
                color={fill.color}
                key={index}
                size={this.getFillPos(fill.size)}
                position={this.getFillPos(fill.position)}
              />
            );
          })}
      </RangeSlider>
    );
  }
}
