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
import { IconType, Player, PlayerState } from "../Player";

export interface PlayOverlayProps {
  player: Player;
  playerState: PlayerState;

  amount?: number;
  disableDoubleClickFullscreen?: boolean;
  enableDoubleClickSkip?: boolean;
  loading: boolean;

  showIcon: boolean;
  icon?: IconType;
  setIcon: (showIcon: boolean, icon?: IconType) => void;
  setFadeIconTimer: () => void;

  hideCursor: boolean;
  loadingIcon?: JSX.Element;
  pauseIcon?: JSX.Element;
  playIcon?: JSX.Element;
  forwardIcon?: JSX.Element;
  rewindIcon?: JSX.Element;
  volumeDownIcon?: JSX.Element;
  volumeUpIcon?: JSX.Element;

  setOverlayRef?: (el: HTMLDivElement) => void;
  setOverlayCenterRef?: (el: HTMLDivElement) => void;
  setOverlayLeftRef?: (el: HTMLDivElement) => void;
  setOverlayRightRef?: (el: HTMLDivElement) => void;
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
    const {
      setIcon,
      setFadeIconTimer,
      player: { play },
      playerState: { playing }
    } = this.props;

    if (edge && this.state.skipping) {
      this.skip(reverse);
    } else {
      if (!this.state.firstPlay) {
        setIcon(true, playing ? IconType.PAUSE : IconType.PLAY);
        setFadeIconTimer();
      }
      play();
    }
  };

  skip = (reverse?: boolean) => {
    const {
      setIcon,
      setFadeIconTimer,
      amount,
      player: { skip }
    } = this.props;
    setIcon(true, reverse ? IconType.REWIND : IconType.FORWARD);
    this.setState({
      skipping: true
    });
    setFadeIconTimer();
    this.skipTimer = this.setSkipTimer();
    if (skip && amount) {
      skip((reverse ? -1 : 1) * amount);
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
    if (this.state.firstPlay && this.props.playerState.playing) {
      this.setState({ firstPlay: false });
    }
  }

  getIcon = () => {
    const {
      icon,
      pauseIcon,
      playIcon,
      forwardIcon,
      rewindIcon,
      volumeDownIcon,
      volumeUpIcon
    } = this.props;

    switch (icon) {
      case IconType.PAUSE:
        return pauseIcon ? pauseIcon : <MdPauseCircleFilled size={"100%"} />;
      case IconType.PLAY:
        return playIcon ? playIcon : <MdPlayCircleFilled size={"100%"} />;
      case IconType.FORWARD:
        return forwardIcon ? forwardIcon : <MdFastForward size={"100%"} />;
      case IconType.REWIND:
        return rewindIcon ? rewindIcon : <MdFastRewind size={"100%"} />;
      case IconType.VOLUME_DOWN:
        return volumeDownIcon ? volumeDownIcon : <MdVolumeDown size={"100%"} />;
      case IconType.VOLUME_UP:
        return volumeUpIcon ? volumeUpIcon : <MdVolumeUp size={"100%"} />;
    }
  };
  iconRef?: HTMLDivElement;
  setIconRef = (element: HTMLDivElement) => {
    this.iconRef = element;
  };

  public render() {
    const {
      amount,
      hideCursor,
      loading,
      showIcon,
      loadingIcon,
      disableDoubleClickFullscreen,
      enableDoubleClickSkip,
      playerState: { playing },
      player: { skip, toggleFullscreen },
      setOverlayCenterRef,
      setOverlayLeftRef,
      setOverlayRef,
      setOverlayRightRef
    } = this.props;

    const canFullscreen = toggleFullscreen && !disableDoubleClickFullscreen;
    const canSkip = enableDoubleClickSkip && skip && amount;
    return (
      <Overlay
        className="rmv__overlay"
        innerRef={setOverlayRef}
        hideCursor={hideCursor}
      >
        <ClickArea className="rmv__overlay__inner">
          <Edge
            className="rmv__overlay__left rmv__overlay__edge"
            innerRef={setOverlayLeftRef}
            onClick={() => this.playToggle(true, true)}
            onDoubleClick={
              canSkip
                ? () => this.skip(true)
                : canFullscreen
                ? toggleFullscreen
                : undefined
            }
          />
          <Center
            className="rmv__overlay__right"
            innerRef={setOverlayCenterRef}
            onClick={() => this.playToggle(false, false)}
            onDoubleClick={canFullscreen ? toggleFullscreen : undefined}
          >
            {!this.state.firstPlay && showIcon ? (
              <OverlayIcon
                className="rmv__overlay__icon rmv__icon animate"
                innerRef={this.setIconRef}
              >
                {this.getIcon()}
              </OverlayIcon>
            ) : loading && playing ? (
              <OverlayLoadingIcon className="rmv__overlay__icon rmv__icon">
                {loadingIcon ? (
                  <Spin className="rmv__overlay__loader">{loadingIcon}</Spin>
                ) : (
                  <Loader className="rmv__overlay__loader" />
                )}
              </OverlayLoadingIcon>
            ) : null}
          </Center>
          <Edge
            className="rmv__overlay__right rmv__overlay__edge"
            innerRef={setOverlayRightRef}
            onClick={() => this.playToggle(true, false)}
            onDoubleClick={
              canSkip
                ? () => this.skip(false)
                : canFullscreen
                ? toggleFullscreen
                : undefined
            }
          />
        </ClickArea>
      </Overlay>
    );
  }
}

const Spin = styled.div`
  animation: load 1s ease infinite;
  @keyframes load {
    to {
      transform: rotate(359deg);
    }
  }
`;

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
      transform: rotate(359deg);
    }
  }
`;
export function Loading() {
  return <Loader />;
}
