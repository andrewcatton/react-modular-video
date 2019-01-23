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
  width?: number;
  height?: number;
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
  neverHideControlsUnlessFullscreen?: boolean;
  disableDoubleClickFullscreen?: boolean;
  enableDoubleClickSkip?: boolean;
  disableInitialOverlay?: boolean;
  disableKeyboardControls?: boolean;

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

  getStyleString(value) {
    if (typeof value === "string") {
      if (value === "auto") {
        return "auto";
      } else if (value.match(/\d+%/)) {
        return value;
      }
    } else if (typeof value === "number") {
      return `${value}px`;
    }
  }

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
    if (width !== undefined) {
      // Use any width that's been specifically set
      videoWidth = width;
    } else if (height !== undefined) {
      // Or calulate the width from the aspect ratio if a height has been set
      videoWidth = height / ratioMultiplier;
    } else {
      // Or use the video's metadata, or use a default of 400px
      videoWidth = (this.videoRef && this.videoRef.videoWidth) || 400;
    }

    let videoHeight: number;
    if (height !== undefined) {
      // Use any height that's been specifically set
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
        width: this.getStyleString(videoWidth),
        height: this.getStyleString(videoHeight)
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

  get playbackRate() {
    return this.videoRef && this.videoRef.playbackRate;
  }

  // set playback rate
  // speed of video
  set playbackRate(rate) {
    this.videoRef.playbackRate = rate;
  }

  get muted() {
    return this.videoRef.muted;
  }

  set muted(val) {
    this.videoRef.muted = val;
  }

  get volume() {
    return this.videoRef.volume;
  }

  set volume(val) {
    if (val > 1) {
      val = 1;
    }
    if (val < 0) {
      val = 0;
    }
    this.videoRef.volume = val;
  }

  // video width
  get videoWidth() {
    return this.videoRef.videoWidth;
  }

  // video height
  get videoHeight() {
    return this.videoRef.videoHeight;
  }

  // play the video
  play() {
    const promise = this.videoRef.play();
    if (promise !== undefined) {
      promise.catch(error => {}).then(() => {});
    }
  }

  // pause the video
  pause() {
    this.videoRef.pause();
  }

  // Change the video source and re-load the video:
  load() {
    this.videoRef.load();
  }

  // Add a new text track to the video
  addTextTrack(kind: TextTrackKind, label?: string, language?: string) {
    this.videoRef.addTextTrack(kind, label, language);
  }

  // Check if your browser can play different types of video:
  canPlayType(type: string) {
    this.videoRef.canPlayType(type);
  }

  // toggle play
  togglePlay = () => {
    if (this.videoRef.paused) {
      this.play();
    } else {
      this.pause();
    }
  };

  // seek video by time
  seek = (time: number) => {
    try {
      this.videoRef.currentTime = time;
    } catch (e) {
      console.log(e, "Video is not ready.");
    }
  };

  // jump x seconds
  skip = (seconds: number) => {
    this.seek(this.videoRef.currentTime + seconds);
  };

  // enter or exist full screen
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
        muted: this.muted,
        volume: this.volume,
        currentTime: this.videoRef.currentTime,
        duration: this.videoRef.duration,
        buffered: this.videoRef.buffered,
        ...(state as PlayerState)
      },
      () => this.handleStateChange(this.state)
    );
  };

  // Fired when the user agent
  // begins looking for media data
  handleLoadStart = createHandler(this.props.onLoadStart, this.updatePlayer);

  // A handler for events that
  // signal that waiting has ended
  handleCanPlay = createHandler(this.props.onCanPlay, e =>
    this.updatePlayer(e, { waiting: false })
  );

  // A handler for events that
  // signal that waiting has ended
  handleCanPlayThrough = createHandler(this.props.onCanPlayThrough, e =>
    this.updatePlayer(e, { waiting: false })
  );

  // A handler for events that
  // signal that waiting has ended
  handlePlaying = createHandler(this.props.onPlaying, e =>
    this.updatePlayer(e, { waiting: false })
  );

  // Fired whenever the media has been started
  handlePlay = createHandler(this.props.onPlay, e =>
    this.updatePlayer(e, {
      ended: false,
      playing: true,
      waiting: false,
      hasStarted: true
    })
  );

  // Fired whenever the media has been paused
  handlePause = createHandler(this.props.onPause, e =>
    this.updatePlayer(e, { playing: false })
  );

  // Fired when the duration of
  // the media resource is first known or changed
  handleDurationChange = createHandler(
    this.props.onDurationChange,
    this.updatePlayer
  );

  // Fired while the user agent
  // is downloading media data
  handleProgress = createHandler(this.props.onProgress, this.updatePlayer);

  // Fired when the end of the media resource
  // is reached (currentTime == duration)
  handleEnded = createHandler(this.props.onEnded, e => {
    const { loop } = this.props;
    if (loop) {
      this.seek(0);
      this.play();
    } else if (!this.videoRef.paused) {
      this.pause();
    }
  });

  // Fired whenever the media begins waiting
  handleWaiting = createHandler(this.props.onWaiting, e =>
    this.updatePlayer(e, { waiting: false })
  );

  // Fired whenever the player
  // is jumping to a new time
  handleSeeking = createHandler(this.props.onSeeking, event =>
    this.setState({ seeking: true })
  );

  // Fired when the player has
  // finished jumping to a new time
  handleSeeked = createHandler(this.props.onSeeked, event =>
    this.setState({ seeking: false })
  );

  // Fires when the browser is
  // intentionally not getting media data
  handleSuspend = createHandler(this.props.onSuspend, this.updatePlayer);

  // Fires when the loading of an audio/video is aborted
  handleAbort = createHandler(this.props.onAbort, this.updatePlayer);

  // Fires when the current playlist is empty
  handleEmptied = createHandler(this.props.onEmptied, this.updatePlayer);

  // Fires when the browser is trying to
  // get media data, but data is not available
  handleStalled = createHandler(this.props.onStalled, this.updatePlayer);

  // Fires when the browser has loaded
  // meta data for the audio/video
  handleLoadedMetaData = createHandler(this.props.onLoadedMetadata, event => {
    const { startTime } = this.props;
    if (startTime && startTime > 0) {
      this.videoRef.currentTime = startTime;
    }
    this.updatePlayer(event);
  });

  // Fires when the browser has loaded
  // the current frame of the audio/video
  handleLoadedData = createHandler(this.props.onLoadedData, this.updatePlayer);

  // Fires when the current
  // playback position has changed
  handleTimeUpdate = createHandler(this.props.onTimeUpdate, this.updatePlayer);

  /**
   * Fires when the playing speed of the audio/video is changed
   */
  handleRateChange = createHandler(this.props.onRateChange, this.updatePlayer);

  // Fires when the volume has been changed
  handleVolumeChange = createHandler(
    this.props.onVolumeChange,
    this.updatePlayer
  );

  // Fires when an error occurred
  // during the loading of an audio/video
  handleError = createHandler(this.props.onError, this.updatePlayer);

  handleResize = () => this.props.onResize && this.props.onResize();

  handleMouseDown = () => {
    this.startControlsTimer();
  };

  handleMouseMove = () => {
    this.startControlsTimer();
  };

  handleKeyDown = (e: React.KeyboardEvent) => {
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
          this.volume = this.volume + this.volume * 0.1;
          this.setState({
            showIcon: true,
            icon: IconType.VOLUME_UP
          });
          this.setFadeIconTimer();
          break;
        case 40:
          //ARROW DOWN
          this.volume = this.volume - this.volume * 0.1;
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
      <div ref={this.setRootElementRef}>
        <VideoDiv
          fluid={fluid}
          fullscreen={this.state.isFullscreen}
          style={this.getStyle()}
          onTouchStart={this.handleMouseDown}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onKeyDown={this.handleKeyDown}
        >
          {this.videoRef &&
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
          {this.videoRef && (
            <PlayOverlay
              loadingIcon={this.props.loadingIcon}
              pauseIcon={this.props.pauseIcon}
              playIcon={this.props.playIcon}
              forwardIcon={this.props.forwardIcon}
              rewindIcon={this.props.rewindIcon}
              volumeDownIcon={this.props.volumeDownIcon}
              volumeUpIcon={this.props.volumeUpIcon}
              hideCursor={hideCursor}
              loading={this.state.waiting}
              playing={this.state.playing}
              play={this.togglePlay}
              skip={this.skip}
              amount={10}
              fullscreen={this.toggleFullscreen}
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
      </div>
    );
  }
}
