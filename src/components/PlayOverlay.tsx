import React from "react";
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
  MdFastForward,
  MdFastRewind,
  MdVolumeDown,
  MdVolumeUp
} from "react-icons/md";
import styled from "styled-components";
import { IconType } from "../Player";

export interface PlayOverlayProps {
  play: () => void;
  playing: boolean;
  skip?: (time: number) => void;
  amount?: number;
  fullscreen?: () => void;
  disableDoubleClickFullscreen?: boolean;
  enableDoubleClickSkip?: boolean;
  loading: boolean;

  showIcon: boolean;
  icon?: IconType;
  setIcon: (showIcon: boolean, icon?: IconType) => void;
  setFadeIconTimer: () => void;

  hideCursor: boolean;
}

export interface PlayOverlayState {
  skipping: boolean;
  firstPlay: boolean;
}

const Overlay = styled.button<{ hideCursor: boolean }>`
  width: 100%;
  height: 100%;
  position: absolute;
  background: transparent;
  border: none;
  bottom: 0;
  padding: 0;
  z-index: 2;
  ${({ hideCursor }) =>
    hideCursor &&
    `
    cursor: none;
  `}
  &:focus {
    outline: none;
  }
`;

const OverlayIcon = styled.div`
  @keyframes fadeOut {
    0% {
      opacity: 0.5;
      width: 75px;
      height: 75px;
    }
    to {
      opacity: 0;
      width: 125px;
      height: 125px;
    }
  }
  margin: auto;

  opacity: 0.5;
  width: 75px;
  height: 75px;
  pointer-events: none;
  animation: none;
  &.animate {
    animation: fadeOut 0.8s linear 1 normal forwards;
  }
`;

const OverlayLoadingIcon = styled.div`
  margin: auto;
  opacity: 0.5;
  width: 75px;
  height: 75px;
  pointer-events: none;
`;

const Edge = styled.div`
  height: 100%;
  flex: 1;
  /* background: red;
  opacity: 0.2; */
  background: transparent;
`;

const Center = styled.div`
  height: 100%;
  flex: 2;
  /* /* background: blue; */
  /* opacity: 0.2; */
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ClickArea = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export default class PlayOverlay extends React.Component<
  PlayOverlayProps,
  PlayOverlayState
> {
  skipTimer?: NodeJS.Timeout;
  constructor(props) {
    super(props);
    this.state = {
      skipping: false,
      firstPlay: true
    };
  }

  setSkipTimer = () =>
    setTimeout(() => {
      this.setState({
        skipping: false
      });
      this.skipTimer = undefined;
    }, 500);

  playToggle = (edge: boolean, reverse: boolean) => {
    if (edge && this.state.skipping) {
      this.skip(reverse);
    } else {
      if (!this.state.firstPlay) {
        this.props.setIcon(
          true,
          this.props.playing ? IconType.PAUSE : IconType.PLAY
        );
        this.props.setFadeIconTimer();
      }
      this.props.play();
    }
  };

  skip = (reverse?: boolean) => {
    this.props.setIcon(true, reverse ? IconType.REWIND : IconType.FORWARD);
    this.setState({
      skipping: true
    });
    this.props.setFadeIconTimer();
    this.skipTimer = this.setSkipTimer();
    if (this.props.skip && this.props.amount) {
      this.props.skip((reverse ? -1 : 1) * this.props.amount);
    }
  };

  //Reset CSS3 animation b/c react does not rerender overlay component
  componentDidUpdate(prevProps: PlayOverlayProps) {
    if (prevProps.icon !== this.props.icon) {
      this.iconRef && this.iconRef.classList.remove("animate");
      setTimeout(() => {
        this.iconRef && this.iconRef.classList.add("animate");
      }, 1);
    }
    if (this.state.firstPlay && this.props.playing) {
      this.setState({ firstPlay: false });
    }
  }

  getIcon = () => {
    switch (this.props.icon) {
      case IconType.PAUSE:
        return <MdPauseCircleFilled size={"100%"} />;
      case IconType.PLAY:
        return <MdPlayCircleFilled size={"100%"} />;
      case IconType.FORWARD:
        return <MdFastForward size={"100%"} />;
      case IconType.REWIND:
        return <MdFastRewind size={"100%"} />;
      case IconType.VOLUME_DOWN:
        return <MdVolumeDown size={"100%"} />;
      case IconType.VOLUME_UP:
        return <MdVolumeUp size={"100%"} />;
    }
  };
  iconRef?: HTMLDivElement;
  setIconRef = (element: HTMLDivElement) => {
    this.iconRef = element;
  };

  public render() {
    const canFullscreen =
      this.props.fullscreen && !this.props.disableDoubleClickFullscreen;
    const canSkip =
      this.props.enableDoubleClickSkip && this.props.skip && this.props.amount;
    return (
      <Overlay hideCursor={this.props.hideCursor}>
        <ClickArea>
          <Edge
            onClick={() => this.playToggle(true, true)}
            onDoubleClick={
              canSkip
                ? () => this.skip(true)
                : canFullscreen
                ? this.props.fullscreen
                : undefined
            }
          />
          <Center
            onClick={() => this.playToggle(false, false)}
            onDoubleClick={canFullscreen ? this.props.fullscreen : undefined}
          >
            {!this.state.firstPlay && this.props.showIcon ? (
              <OverlayIcon className="animate" innerRef={this.setIconRef}>
                {this.getIcon()}
              </OverlayIcon>
            ) : this.props.loading && this.props.playing ? (
              <OverlayLoadingIcon>
                <Loader />
              </OverlayLoadingIcon>
            ) : null}
          </Center>
          <Edge
            onClick={() => this.playToggle(true, false)}
            onDoubleClick={
              canSkip
                ? () => this.skip(false)
                : canFullscreen
                ? this.props.fullscreen
                : undefined
            }
          />
        </ClickArea>
      </Overlay>
    );
  }
}

const Loader = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 7px solid white;
  border-right: 7px solid transparent;
  border-left: 7px solid transparent;
  animation: load 1s ease infinite;
  border-radius: 100%;
  @keyframes load {
    to {
      transform: rotate(360deg);
    }
  }
`;
export function Loading() {
  return <Loader />;
}
