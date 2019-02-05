import React from "react";
import styled from "styled-components";
import { InitialPlayButton } from "./components/InitialPlayButton";
import fullscreen from "./utils/fullscreen";
import {
  createHandler,
  throttle,
  VideoEvent,
  VideoEventHandler
} from "./utils/helpers";
import PlayOverlay from "./components/PlayOverlay";

export interface PlayerProps {
  poster?: string;
  preload?: string;
  src: string;
  autoPlay?: boolean;
  crossOrigin?: string;
  videoId?: string;
  playsInline?: boolean;
  framerate?: number;

  fluid?: boolean;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;

  playbackRate?: number;
  startTime?: number;
  muted?: boolean;
  volume?: number;

  onLoadStart?: VideoEventHandler;
  onWaiting?: VideoEventHandler;
  onCanPlay?: VideoEventHandler;
  onCanPlayThrough?: VideoEventHandler;
  onPlaying?: VideoEventHandler;
  onEnded?: VideoEventHandler;
  onSeeking?: VideoEventHandler;
  onSeeked?: VideoEventHandler;
  onPlay?: VideoEventHandler;
  onPause?: VideoEventHandler;
  onProgress?: VideoEventHandler;
  onDurationChange?: VideoEventHandler;
  onError?: VideoEventHandler;
  onSuspend?: VideoEventHandler;
  onAbort?: VideoEventHandler;
  onEmptied?: VideoEventHandler;
  onStalled?: VideoEventHandler;
  onLoadedMetadata?: VideoEventHandler;
  onLoadedData?: VideoEventHandler;
  onTimeUpdate?: VideoEventHandler;
  onRateChange?: VideoEventHandler;
  onVolumeChange?: VideoEventHandler;
  subscribeToStateChange?: (state: PlayerState) => void;

  onResize?: () => void;
  render: (props: PlayerState, player: Player) => JSX.Element;

  loop?: boolean;
  hideControlsDelay?: number;
  hideControls?: boolean;
  neverHideControlsUnlessFullscreen?: boolean;
  disableDoubleClickFullscreen?: boolean;
  enableDoubleClickSkip?: boolean;
  disableInitialOverlay?: boolean;
  disableKeyboardControls?: boolean;
  disableOverlay?: boolean;

  initialOverlayIcon?: JSX.Element;
  loadingIcon?: JSX.Element;
  pauseIcon?: JSX.Element;
  playIcon?: JSX.Element;
  forwardIcon?: JSX.Element;
  rewindIcon?: JSX.Element;
  volumeDownIcon?: JSX.Element;
  volumeUpIcon?: JSX.Element;
}

export interface PlayerState {
  isFullscreen: boolean;
  controlsVisible: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  muted: boolean;
  volume: number;
  buffered?: TimeRanges;
  seeking: boolean;
  waiting: boolean;
  playing: boolean;
  ended: boolean;
  hasStarted: boolean;

  showIcon: boolean;
  icon?: IconType;
}

type VideoDivProps = {
  fluid?: boolean;
  fullscreen?: boolean;
};

const VideoDiv = styled.div<VideoDivProps>`
  position: relative;

  ${({ fluid }) =>
    fluid &&
    `width: 100%;
    max-width: 100%;
    height: 0;`}

  ${({ fullscreen }) =>
    fullscreen &&
    `
    width: 100% !important;
    height: 100% !important;
    // Undo any aspect ratio padding for fluid layouts
    padding-top: 0 !important;`}

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export enum IconType {
  "PAUSE",
  "PLAY",
  "FORWARD",
  "REWIND",
  "LOADING",
  "VOLUME_UP",
  "VOLUME_DOWN"
}

export class Player extends React.Component<PlayerProps, PlayerState> {
  rootElementRef!: HTMLDivElement;
  controlsHideTimer?: NodeJS.Timer;
  fadeIconTimer?: NodeJS.Timer | null;

  getStyle() {
    const { fluid, width, height, aspectRatio } = this.props;

    let ratioMultiplier: number;
    // The aspect ratio is either used directly or to calculate width and height.
    if (
      aspectRatio !== undefined &&
      aspectRatio !== "auto" &&
      aspectRatio.includes(":")
    ) {
      // Use any aspectRatio that's been specifically set
      const parts = aspectRatio.split(":");
      ratioMultiplier = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else if (this.videoRef && this.videoRef.videoWidth) {
      // Otherwise try to get the aspect ratio from the video metadata
      ratioMultiplier = this.videoRef.videoWidth / this.videoRef.videoHeight;
    } else {
      // Or use a default. The video element's is 2:1, but 16:9 is more common.
      ratioMultiplier = 16 / 9;
    }
    ratioMultiplier = 1 / ratioMultiplier;

    let videoWidth: number;
    if (
      width !== undefined &&
      typeof width === "string" &&
      !width.includes("%")
    ) {
      // Use any width that's been specifically set using "px"
      videoWidth = parseFloat(width.replace("px", ""));
    } else if (width !== undefined && typeof width !== "string") {
      // Use any width that's been specifically set as a number
      videoWidth = width;
    } else if (
      height !== undefined &&
      typeof height === "string" &&
      !height.includes("%")
    ) {
      // Or calulate the width from the aspect ratio if a height has been set using "px"
      videoWidth = parseFloat(height.replace("px", "")) / ratioMultiplier;
    } else if (height !== undefined && typeof height !== "string") {
      // Or calulate the width from the aspect ratio if a height has been set as a number
      videoWidth = height / ratioMultiplier;
    } else {
      // Or use the video's metadata, or use a default of 400px
      videoWidth = (this.videoRef && this.videoRef.videoWidth) || 400;
    }

    let videoHeight: number;
    if (
      height !== undefined &&
      typeof height === "string" &&
      !height.includes("%")
    ) {
      // Use any height that's been specifically set using "px"
      videoHeight = parseFloat(height.replace("px", ""));
    } else if (height !== undefined && typeof height !== "string") {
      // Or calulate the width from the aspect ratio if a height has been set as a number
      videoHeight = height;
    } else {
      // Otherwise calculate the height from the ratio and the width
      videoHeight = videoWidth * ratioMultiplier;
    }

    if (fluid) {
      return {
        paddingTop: `${ratioMultiplier * 100}%`
      };
    } else {
      return {
        width:
          typeof width === "string" && width.includes("%")
            ? width
            : `${videoWidth}px`,
        height:
          typeof height === "string" && height.includes("%")
            ? height
            : `${videoHeight}px`
      };
    }
  }

  setRootElementRef = (element: HTMLDivElement) => {
    this.rootElementRef = element;
  };
  videoRef!: HTMLVideoElement;
  setVideoRef = (element: HTMLVideoElement) => {
    this.videoRef = element;
  };

  constructor(props) {
    super(props);

    this.state = {
      hasStarted: false,
      ended: false,
      waiting: false,
      seeking: false,
      isFullscreen: false,
      controlsVisible: true,
      playing: false,
      duration: 0,
      playbackRate: this.props.playbackRate || 1,
      muted: this.props.muted || false,
      currentTime: this.props.startTime || 0,
      volume: this.props.volume || 1,
      showIcon: false
    };
    this.handleStateChange(this.state);
    this.handleProgress = throttle(this.handleProgress, 250);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    fullscreen.addEventListener(this.handleFullScreenChange);
    this.forceUpdate();
  }

  componentWillUnmount() {
    // Remove event listener
    window.removeEventListener("resize", this.handleResize);
    fullscreen.removeEventListener(this.handleFullScreenChange);
    if (this.controlsHideTimer) {
      clearTimeout(this.controlsHideTimer);
    }
  }

  componentDidUpdate(prevProps: PlayerProps, prevState: PlayerState) {
    if (this.state.isFullscreen !== prevState.isFullscreen) {
      this.handleResize();
    }
  }

  handleStateChange = (state: PlayerState) => {
    if (this.props.subscribeToStateChange) {
      this.props.subscribeToStateChange(state);
    }
  };

  // Handle Fullscreen Change
  handleFullScreenChange = () => {
    this.setState({ isFullscreen: !this.state.isFullscreen });
  };

  getTimeFromPosition = (position: number) => {
    return (position / 100) * this.state.duration;
  };

  startControlsTimer = () => {
    this.setState({ controlsVisible: true });
    if (
      this.props.hideControlsDelay !== undefined &&
      this.props.hideControlsDelay <= 0
    ) {
      return;
    }
    if (this.controlsHideTimer) {
      clearTimeout(this.controlsHideTimer);
    }
    let hideTime = 3000;
    if (this.props.hideControlsDelay && this.props.hideControlsDelay > 0) {
      hideTime = this.props.hideControlsDelay;
    }
    this.controlsHideTimer = setTimeout(() => {
      this.setState({ controlsVisible: false });
    }, hideTime);
  };

  setPlaybackRate = (rate: number) => {
    this.videoRef.playbackRate = rate;
  };

  mute = () => {
    this.videoRef.muted = true;
  };

  unmute = () => {
    this.videoRef.muted = false;
  };

  toggleMute = () => {
    this.videoRef.muted = !this.videoRef.muted;
  };

  setVolume = (val: number) => {
    if (val > 1) {
      val = 1;
    }
    if (val < 0) {
      val = 0;
    }
    this.videoRef.volume = val;
  };

  getVideoWidth = () => {
    return this.videoRef.videoWidth;
  };

  getVideoHeight = () => {
    return this.videoRef.videoHeight;
  };

  play = () => {
    const promise = this.videoRef.play();
    if (promise !== undefined) {
      promise.catch(error => {}).then(() => {});
    }
  };

  pause = () => {
    this.videoRef.pause();
  };

  load = () => {
    this.videoRef.load();
  };

  // TODO: Implement
  // addTextTrack = (kind: TextTrackKind, label?: string, language?: string) => {
  //   this.videoRef.addTextTrack(kind, label, language);
  // }

  // TODO: Implement
  // canPlayType = (type: string) => {
  //   this.videoRef.canPlayType(type);
  // }

  togglePlay = () => {
    if (this.videoRef.paused) {
      this.play();
    } else {
      this.pause();
    }
  };

  seek = (time: number) => {
    try {
      this.videoRef.currentTime = time;
    } catch (e) {
      console.log(e, "Video is not ready.");
    }
  };

  skip = (seconds: number) => {
    this.seek(this.videoRef.currentTime + seconds);
  };

  toggleFullscreen = () => {
    if (fullscreen.enabled) {
      if (fullscreen.isFullscreen) {
        fullscreen.exit();
      } else {
        fullscreen.request(this.rootElementRef);
      }
    }
  };

  updatePlayer = (event: VideoEvent, state?: Partial<PlayerState>) => {
    this.setState(
      {
        playbackRate: this.videoRef.playbackRate,
        muted: this.videoRef.muted,
        volume: this.videoRef.volume,
        currentTime: this.videoRef.currentTime,
        duration: this.videoRef.duration,
        buffered: this.videoRef.buffered,
        ...(state as PlayerState)
      },
      () => this.handleStateChange(this.state)
    );
  };

  handleLoadStart = createHandler(this.props.onLoadStart, this.updatePlayer);

  handleCanPlay = createHandler(this.props.onCanPlay, e =>
    this.updatePlayer(e, { waiting: false })
  );

  handleCanPlayThrough = createHandler(this.props.onCanPlayThrough, e =>
    this.updatePlayer(e, { waiting: false })
  );

  handlePlaying = createHandler(this.props.onPlaying, e =>
    this.updatePlayer(e, { waiting: false })
  );

  handlePlay = createHandler(this.props.onPlay, e =>
    this.updatePlayer(e, {
      ended: false,
      playing: true,
      waiting: false,
      hasStarted: true
    })
  );

  handlePause = createHandler(this.props.onPause, e =>
    this.updatePlayer(e, { playing: false })
  );

  handleDurationChange = createHandler(
    this.props.onDurationChange,
    this.updatePlayer
  );

  handleProgress = createHandler(this.props.onProgress, this.updatePlayer);

  handleEnded = createHandler(this.props.onEnded, e => {
    const { loop } = this.props;
    if (loop) {
      this.seek(0);
      this.play();
    } else if (!this.videoRef.paused) {
      this.pause();
    }
  });

  handleWaiting = createHandler(this.props.onWaiting, e =>
    this.updatePlayer(e, { waiting: true })
  );

  handleSeeking = createHandler(this.props.onSeeking, event =>
    this.setState({ seeking: true })
  );

  handleSeeked = createHandler(this.props.onSeeked, event =>
    this.setState({ seeking: false })
  );

  handleSuspend = createHandler(this.props.onSuspend, this.updatePlayer);

  handleAbort = createHandler(this.props.onAbort, this.updatePlayer);

  handleEmptied = createHandler(this.props.onEmptied, this.updatePlayer);

  handleStalled = createHandler(this.props.onStalled, this.updatePlayer);

  handleLoadedMetaData = createHandler(this.props.onLoadedMetadata, event => {
    const { startTime } = this.props;
    if (startTime && startTime > 0) {
      this.videoRef.currentTime = startTime;
    }
    this.updatePlayer(event);
  });

  handleLoadedData = createHandler(this.props.onLoadedData, this.updatePlayer);

  handleTimeUpdate = createHandler(this.props.onTimeUpdate, this.updatePlayer);

  handleRateChange = createHandler(this.props.onRateChange, this.updatePlayer);

  handleVolumeChange = createHandler(
    this.props.onVolumeChange,
    this.updatePlayer
  );

  handleError = createHandler(this.props.onError, this.updatePlayer);

  handleResize = () => this.props.onResize && this.props.onResize();

  handleMouseDown = () => {
    this.startControlsTimer();
  };

  handleMouseMove = () => {
    this.startControlsTimer();
  };

  handleKeyDown = (e: React.KeyboardEvent) => {
    const { volume } = this.videoRef;
    if (!this.props.disableKeyboardControls) {
      this.startControlsTimer();

      switch (e.keyCode) {
        case 32:
          //SPACEBAR
          this.togglePlay();
          this.setState({
            showIcon: true,
            icon: this.state.playing ? IconType.PAUSE : IconType.PLAY
          });
          this.setFadeIconTimer();
          break;
        case 39:
          //ARROW RIGHT
          this.skip(10);
          this.setState({
            showIcon: true,
            icon: IconType.FORWARD
          });
          this.setFadeIconTimer();

          break;
        case 37:
          //ARROW LEFT
          this.skip(-10);
          this.setState({
            showIcon: true,
            icon: IconType.REWIND
          });
          this.setFadeIconTimer();
          break;
        case 38:
          //ARROW UP
          this.setVolume(volume + volume * 0.1);
          this.setState({
            showIcon: true,
            icon: IconType.VOLUME_UP
          });
          this.setFadeIconTimer();
          break;
        case 40:
          //ARROW DOWN
          this.setVolume(volume - volume * 0.1);
          this.setState({
            showIcon: true,
            icon: IconType.VOLUME_DOWN
          });
          this.setFadeIconTimer();
          break;
      }
    }
  };

  setIcon = (showIcon: boolean, icon?: IconType) => {
    this.setState({
      showIcon,
      icon
    });
  };

  setFadeIconTimer = () => {
    if (this.fadeIconTimer) {
      // previous animation is not finished
      clearTimeout(this.fadeIconTimer); // cancel it
      this.fadeIconTimer = null;
    }
    this.fadeIconTimer = setTimeout(() => {
      this.setState({ showIcon: false });
      this.fadeIconTimer = undefined;
    }, 500);
  };

  public render() {
    const {
      loop,
      poster,
      preload,
      src,
      autoPlay,
      playsInline,
      muted,
      crossOrigin,
      videoId,
      fluid
    } = this.props;

    const hideCursor = !this.state.controlsVisible && this.state.isFullscreen;

    return (
      <VideoDiv
        innerRef={this.setRootElementRef}
        className="rmv"
        fluid={fluid}
        fullscreen={this.state.isFullscreen}
        style={this.getStyle()}
        onTouchStart={this.handleMouseDown}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onKeyDown={this.handleKeyDown}
      >
        {!this.props.hideControls &&
          this.videoRef &&
          (this.props.disableInitialOverlay || this.state.hasStarted) &&
          (!this.state.playing ||
            ((this.props.neverHideControlsUnlessFullscreen &&
              !this.state.isFullscreen) ||
              this.state.controlsVisible)) &&
          this.props.render(this.state, this)}

        {!this.props.disableInitialOverlay &&
          this.videoRef &&
          !this.state.hasStarted && (
            <InitialPlayButton icon={this.props.initialOverlayIcon} />
          )}

        {!this.props.disableOverlay && this.videoRef && (
          <PlayOverlay
            togglePlay={this.togglePlay}
            skip={this.skip}
            toggleFullscreen={this.toggleFullscreen}
            playerState={this.state}
            pauseIcon={this.props.pauseIcon}
            playIcon={this.props.playIcon}
            forwardIcon={this.props.forwardIcon}
            rewindIcon={this.props.rewindIcon}
            volumeDownIcon={this.props.volumeDownIcon}
            volumeUpIcon={this.props.volumeUpIcon}
            hideCursor={hideCursor}
            amount={10}
            disableDoubleClickFullscreen={
              this.props.disableDoubleClickFullscreen
            }
            enableDoubleClickSkip={this.props.enableDoubleClickSkip}
            icon={this.state.icon}
            showIcon={this.state.showIcon}
            setIcon={this.setIcon}
            setFadeIconTimer={this.setFadeIconTimer}
          />
        )}
        <video
          className="rmv__video"
          id={videoId}
          crossOrigin={crossOrigin}
          ref={this.setVideoRef}
          muted={muted}
          preload={preload}
          loop={loop}
          playsInline={playsInline}
          autoPlay={autoPlay}
          poster={poster}
          src={src}
          onLoadStart={this.handleLoadStart}
          onWaiting={this.handleWaiting}
          onCanPlay={this.handleCanPlay}
          onCanPlayThrough={this.handleCanPlayThrough}
          onPlaying={this.handlePlaying}
          onEnded={this.handleEnded}
          onSeeking={this.handleSeeking}
          onSeeked={this.handleSeeked}
          onPlay={this.handlePlay}
          onPause={this.handlePause}
          onProgress={this.handleProgress}
          onDurationChange={this.handleDurationChange}
          onError={this.handleError}
          onSuspend={this.handleSuspend}
          onAbort={this.handleAbort}
          onEmptied={this.handleEmptied}
          onStalled={this.handleStalled}
          onLoadedMetadata={this.handleLoadedMetaData}
          onLoadedData={this.handleLoadedData}
          onTimeUpdate={this.handleTimeUpdate}
          onRateChange={this.handleRateChange}
          onVolumeChange={this.handleVolumeChange}
        />
      </VideoDiv>
    );
  }
}
