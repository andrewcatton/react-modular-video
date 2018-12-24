import React, { ReactEventHandler } from "react";
import fullscreen from "./utils/fullscreen";
import {
  throttle,
  VideoEvent,
  VideoEventHandler,
  createHandler
} from "./utils/helpers";

export interface PlayerProps {
  loop?: boolean;
  poster?: string;
  preload?: string;
  src: string;
  autoPlay?: boolean;
  playsInline?: boolean;
  muted?: boolean;
  crossOrigin?: string;
  videoId?: string;
  startTime?: number;

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
  onResize?: () => void;
}

export interface PlayerState {
  isFullscreen: boolean;
  controlsVisible: boolean;
}

export default class Player extends React.Component<PlayerProps, PlayerState> {
  rootElementRef!: HTMLDivElement;
  controlsHideTimer?: number;

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
      isFullscreen: false,
      controlsVisible: true
    };
    this.handleProgress = throttle(this.handleProgress, 250);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    fullscreen.addEventListener(this.handleFullScreenChange);
  }

  componentWillUnmount() {
    // Remove event listener
    window.removeEventListener("resize", this.handleResize);
    fullscreen.removeEventListener(this.handleFullScreenChange);
    if (this.controlsHideTimer) {
      window.clearTimeout(this.controlsHideTimer);
    }
  }

  componentDidUpdate(prevProps: PlayerProps, prevState: PlayerState) {
    if (this.state.isFullscreen !== prevState.isFullscreen) {
      this.handleResize();
    }
    this.forceUpdate(); // re-render
  }

  handleFullScreenChange() {
    this.setState({ isFullscreen: !this.state.isFullscreen });
  }

  startControlsTimer() {
    clearTimeout(this.controlsHideTimer);
    this.controlsHideTimer = setTimeout(() => {
      this.setState({ controlsVisible: false });
    }, 3000);
  }

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
  togglePlay() {
    if (this.videoRef.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  // seek video by time
  seek(time) {
    try {
      this.videoRef.currentTime = time;
    } catch (e) {
      // console.log(e, 'Video is not ready.')
    }
  }

  // jump forward x seconds
  forward(seconds) {
    this.seek(this.videoRef.currentTime + seconds);
  }

  // jump back x seconds
  replay(seconds) {
    this.forward(-seconds);
  }

  // enter or exist full screen
  toggleFullscreen() {
    if (fullscreen.enabled) {
      if (fullscreen.isFullscreen) {
        fullscreen.exit();
      } else {
        fullscreen.request(this.rootElementRef);
      }
    }
  }

  // Fired when the user agent
  // begins looking for media data
  // handleLoadStart = createHandler(this.props.onLoadStart);

  handleLoadStart(event: VideoEvent) {
    if (this.props.onLoadStart) {
      this.props.onLoadStart(event);
    }
  }

  // A handler for events that
  // signal that waiting has ended
  handleCanPlay(event: VideoEvent) {
    if (this.props.onCanPlay) {
      this.props.onCanPlay(event);
    }
  }

  // A handler for events that
  // signal that waiting has ended
  handleCanPlayThrough(event: VideoEvent) {
    if (this.props.onCanPlayThrough) {
      this.props.onCanPlayThrough(event);
    }
  }

  // A handler for events that
  // signal that waiting has ended
  handlePlaying(event: VideoEvent) {
    if (this.props.onPlaying) {
      this.props.onPlaying(event);
    }
  }

  // Fired whenever the media has been started
  handlePlay(event: VideoEvent) {
    if (this.props.onPlay) {
      this.props.onPlay(event);
    }
  }

  // Fired whenever the media has been paused
  handlePause(event: VideoEvent) {
    if (this.props.onPause) {
      this.props.onPause(event);
    }
  }

  // Fired when the duration of
  // the media resource is first known or changed
  handleDurationChange(event: VideoEvent) {
    if (this.props.onDurationChange) {
      this.props.onDurationChange(event);
    }
  }

  // Fired while the user agent
  // is downloading media data
  handleProgress(event: VideoEvent) {
    if (this.props.onProgress) {
      this.props.onProgress(event);
    }
  }

  // Fired when the end of the media resource
  // is reached (currentTime == duration)
  handleEnded(event: VideoEvent) {
    const { loop, onEnded } = this.props;
    if (loop) {
      this.seek(0);
      this.play();
    } else if (!this.videoRef.paused) {
      this.pause();
    }

    if (this.props.onEnded) {
      this.props.onEnded(event);
    }
  }

  // Fired whenever the media begins waiting
  handleWaiting(event: VideoEvent) {
    if (this.props.onWaiting) {
      this.props.onWaiting(event);
    }
  }

  // Fired whenever the player
  // is jumping to a new time
  handleSeeking(event: VideoEvent) {
    if (this.props.onSeeking) {
      this.props.onSeeking(event);
    }
  }

  // Fired when the player has
  // finished jumping to a new time
  handleSeeked(event: VideoEvent) {
    if (this.props.onSeeked) {
      this.props.onSeeked(event);
    }
  }

  // Handle Fullscreen Change
  handleFullscreenChange() {}

  // Fires when the browser is
  // intentionally not getting media data
  handleSuspend(event: VideoEvent) {
    if (this.props.onSuspend) {
      this.props.onSuspend(event);
    }
  }

  // Fires when the loading of an audio/video is aborted
  handleAbort(event: VideoEvent) {
    if (this.props.onAbort) {
      this.props.onAbort(event);
    }
  }

  // Fires when the current playlist is empty
  handleEmptied(event: VideoEvent) {
    if (this.props.onEmptied) {
      this.props.onEmptied(event);
    }
  }

  // Fires when the browser is trying to
  // get media data, but data is not available
  handleStalled(event: VideoEvent) {
    if (this.props.onStalled) {
      this.props.onStalled(event);
    }
  }

  // Fires when the browser has loaded
  // meta data for the audio/video
  handleLoadedMetaData(event: VideoEvent) {
    const { onLoadedMetadata, startTime } = this.props;

    if (startTime && startTime > 0) {
      this.videoRef.currentTime = startTime;
    }

    if (this.props.onLoadedMetadata) {
      this.props.onLoadedMetadata(event);
    }
  }

  // Fires when the browser has loaded
  // the current frame of the audio/video
  handleLoadedData(event: VideoEvent) {
    if (this.props.onLoadedData) {
      this.props.onLoadedData(event);
    }
  }

  // Fires when the current
  // playback position has changed
  handleTimeUpdate(event: VideoEvent) {
    if (this.props.onTimeUpdate) {
      this.props.onTimeUpdate(event);
    }
  }

  /**
   * Fires when the playing speed of the audio/video is changed
   */
  handleRateChange(event: VideoEvent) {
    if (this.props.onRateChange) {
      this.props.onRateChange(event);
    }
  }

  // Fires when the volume has been changed
  handleVolumeChange(event: VideoEvent) {
    if (this.props.onVolumeChange) {
      this.props.onVolumeChange(event);
    }
  }

  // Fires when an error occurred
  // during the loading of an audio/video
  handleError(event: VideoEvent) {
    if (this.props.onError) {
      this.props.onError(event);
    }
  }

  handleResize() {
    if (this.props.onResize) {
      this.props.onResize();
    }
  }

  handleKeypress() {}

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
      videoId
    } = this.props;

    return (
      <div ref={this.setRootElementRef}>
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
        >
          {/* {this.renderChildren()} */}
        </video>
      </div>
    );
  }
}
