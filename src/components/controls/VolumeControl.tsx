import React from "react";
import {
  MdVolumeMute,
  MdVolumeDown,
  MdVolumeUp,
  MdVolumeOff
} from "react-icons/md";
import { Control } from "../ControlBar";
import styled from "styled-components";
import { ControlButtonProps } from "./Types";
import classnames from "classnames";
import { Slider, SliderFill } from "../slider";
import { throttle } from "src/utils/helpers";

export interface VolumeControlProps {
  hideMuteButton?: boolean;
  hideVolumeSlider?: boolean;
  alwaysShowVolumeSlider?: boolean;
  showVolumeVariations?: boolean;
  volumeOffIcon?: JSX.Element;
  volumeUpIcon?: JSX.Element;
  volumeDownIcon?: JSX.Element;
  volumeMuteIcon?: JSX.Element;
}

export interface VolumeControlState {
  menuOpen: boolean;
  menuHidden: boolean;
  grab: boolean;
}

const VOLUME_WIDTH = 60;

const VolumeControlRow = styled(Control)`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  padding-right: 5px;
`;

const AnimateMenu = styled.div<{ open: boolean }>`
  opacity: ${({ open }) => (open ? 1 : 0)};
  width: ${({ open }) => (open ? VOLUME_WIDTH + 5 : 0)}px;
  transition: all 0.5s ease;
  padding-left: ${({ open }) => (open ? 5 : 0)}px;
`;

export class VolumeControl extends React.Component<
  VolumeControlProps & ControlButtonProps,
  VolumeControlState
> {
  menuTimer?: NodeJS.Timer | null;

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      menuHidden: true,
      grab: false
    };
    this.onDrag = throttle(this.onDrag, 100);
  }

  getIcon() {
    const {
      volumeDownIcon,
      volumeOffIcon,
      volumeMuteIcon,
      volumeUpIcon,
      showVolumeVariations,
      playerState: { muted, volume }
    } = this.props;
    if (muted) {
      return volumeOffIcon ? (
        volumeOffIcon
      ) : (
        <MdVolumeOff volume-control="rmv__volume-control__icon rmv__icon" />
      );
    } else {
      if (showVolumeVariations) {
        if (volume > 0.8) {
          return volumeUpIcon ? (
            volumeUpIcon
          ) : (
            <MdVolumeUp volume-control="rmv__volume-control__icon rmv__icon" />
          );
        } else if (volume > 0.4) {
          return volumeDownIcon ? (
            volumeDownIcon
          ) : (
            <MdVolumeDown volume-control="rmv__volume-control__icon rmv__icon" />
          );
        } else {
          return volumeMuteIcon ? (
            volumeMuteIcon
          ) : (
            <MdVolumeMute volume-control="rmv__volume-control__icon rmv__icon" />
          );
        }
      } else {
        return volumeUpIcon ? (
          volumeUpIcon
        ) : (
          <MdVolumeUp volume-control="rmv__volume-control__icon rmv__icon" />
        );
      }
    }
  }

  onDrag = (position: number) => {
    !this.state.grab && this.setState({ grab: true });
    this.props.player.setVolume(this.getVolumeFromPosition(position));
  };

  onDragEnd = () => {
    this.setState({ grab: false });
    if (!this.state.menuOpen) {
      this.menuTimer = setTimeout(
        () => this.setState({ menuHidden: true }),
        500
      );
    }
  };

  getVolumeFromPosition = (position: number) => {
    return position / 100;
  };

  openMenu = () => {
    this.setState({ menuOpen: true, menuHidden: false });
    if (this.menuTimer) {
      clearTimeout(this.menuTimer);
    }
    this.menuTimer = null;
  };

  closeMenu = () => {
    this.setState({ menuOpen: false });
    if (!this.state.grab) {
      this.menuTimer = setTimeout(
        () => this.setState({ menuHidden: true }),
        500
      );
    }
  };

  render() {
    const {
      className,
      alwaysShowVolumeSlider,
      hideMuteButton,
      hideVolumeSlider,
      setContainerRef,
      setButtonRef,
      player: { toggleMute },
      playerState: { volume }
    } = this.props;

    let fill: SliderFill = {
      color: "#0095ff",
      size: volume,
      position: 0,
      order: 1
    };

    const menuOpen =
      this.state.menuOpen ||
      alwaysShowVolumeSlider === true ||
      hideMuteButton === true;
    const menuHidden =
      this.state.menuHidden && !alwaysShowVolumeSlider && !hideMuteButton;

    return (
      <VolumeControlRow
        innerRef={setContainerRef}
        className={classnames(className, "rmv__volume-control rmv__control")}
        flex="no-shrink"
        onMouseOver={this.openMenu}
        onMouseLeave={this.closeMenu}
      >
        {!hideMuteButton && (
          <button
            className="rmv__volume-control__button rmv__button"
            ref={setButtonRef}
            onKeyDown={e => e.stopPropagation()}
            onClick={toggleMute}
          >
            {this.getIcon()}
          </button>
        )}

        {!hideVolumeSlider && (
          <AnimateMenu
            className="rmv__volume-control__slider-outer rmv__slider-outer"
            open={this.state.grab || menuOpen}
          >
            {!menuHidden && (
              <Slider
                disableAnimate={true}
                classNamePrefix="rmv__volume-control__slider"
                onDrag={this.onDrag}
                onDragEnd={this.onDragEnd}
                maxVal={1}
                currVal={volume}
                fills={[fill]}
                width={VOLUME_WIDTH + "px"}
              />
            )}
          </AnimateMenu>
        )}
      </VolumeControlRow>
    );
  }
}
