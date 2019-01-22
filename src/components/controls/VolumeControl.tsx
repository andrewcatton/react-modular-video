import React from "react";
import {
  MdVolumeMute,
  MdVolumeDown,
  MdVolumeUp,
  MdVolumeOff
} from "react-icons/md";
import { Control } from "../ControlBar";
import Slider from "../slider/Slider";
import styled from "styled-components";

export interface VolumeControlProps {
  volumeLevel: number;
  muted: boolean;
  mute: () => void;
  setVolume: (volume: number) => void;
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
  opacity: ${props => (props.open ? 1 : 0)};
  width: ${props => (props.open ? VOLUME_WIDTH + 5 : 0)}px;
  transition: all 0.5s ease;
  padding-left: ${props => (props.open ? 5 : 0)}px;
`;

export class VolumeControl extends React.Component<
  VolumeControlProps,
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
  }

  getIcon() {
    const {
      volumeDownIcon,
      volumeOffIcon,
      volumeMuteIcon,
      volumeUpIcon
    } = this.props;
    if (this.props.muted) {
      return volumeOffIcon ? volumeOffIcon : <MdVolumeOff />;
    } else {
      if (this.props.showVolumeVariations) {
        if (this.props.volumeLevel > 0.8) {
          return volumeUpIcon ? volumeUpIcon : <MdVolumeUp />;
        } else if (this.props.volumeLevel > 0.4) {
          return volumeDownIcon ? volumeDownIcon : <MdVolumeDown />;
        } else {
          return volumeMuteIcon ? volumeMuteIcon : <MdVolumeMute />;
        }
      } else {
        return volumeUpIcon ? volumeUpIcon : <MdVolumeUp />;
      }
    }
  }

  onDrag = (position: number) => {
    !this.state.grab && this.setState({ grab: true });
    this.props.setVolume(this.getVolumeFromPosition(position));
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

  public render() {
    let fill = {
      color: "#0095ff",
      size: this.props.volumeLevel,
      position: 0,
      order: 1
    };

    const menuOpen =
      this.state.menuOpen ||
      this.props.alwaysShowVolumeSlider === true ||
      this.props.hideMuteButton === true;
    const menuHidden =
      this.state.menuHidden &&
      !this.props.alwaysShowVolumeSlider &&
      !this.props.hideMuteButton;
    return (
      <VolumeControlRow
        flex="no-shrink"
        onMouseOver={this.openMenu}
        onMouseLeave={this.closeMenu}
      >
        {!this.props.hideMuteButton && (
          <button
            onKeyDown={e => e.stopPropagation()}
            onClick={this.props.mute}
          >
            {this.getIcon()}
          </button>
        )}

        {!this.props.hideVolumeSlider && (
          <AnimateMenu open={this.state.grab || menuOpen}>
            {!menuHidden && (
              <Slider
                onDrag={this.onDrag}
                onDragEnd={this.onDragEnd}
                maxVal={1}
                currVal={this.props.volumeLevel}
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
