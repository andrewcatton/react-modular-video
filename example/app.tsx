import React from "react";
import ReactDOM from "react-dom";
import {
  Player,
  PlayerState,
  PlayPause,
  ControlBar,
  FullScreenToggle,
  TimeDisplay,
  TimeDisplayType,
  TimeSkip,
  FrameSkip,
  PlaybackRate,
  VolumeControl,
  ProgressBar,
  ControlRow,
  ControlCol,
  Control
} from "react-modular-video";
import styled from "styled-components";
import { MdInfo } from "react-icons/md";

const video = require("./sample.mp4");

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => (props.active ? "blue" : "gray")};
`;

export interface AppProps {}
export interface AppState {
  showProgressBar: boolean;
  showPlayPause: boolean;
  showVolume: boolean;
  showPlaybackRate: boolean;
  showSkip: boolean;
  showFrameSkip: boolean;
  showTime: boolean;
  showFullscreen: boolean;
  scrub: boolean;
  rates: string;
  skipAmount: 5 | 10 | 30;
  hideMute: boolean;
  hideVolume: boolean;
  alwaysShowSlider: boolean;
  loop: boolean;
  hideControlsDelay: number;
  neverHideControlsUnlessFullscreen: boolean;
  enableDoubleClickSkip: boolean;
  disableDoubleClickFullscreen: boolean;
  disableInitialOverlay: boolean;
  disableKeyboardControls: boolean;
  showCustomOne: boolean;
  showCustomTwo: boolean;
  showCustomSliders: boolean;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      showProgressBar: true,
      showPlayPause: true,
      showVolume: true,
      showPlaybackRate: false,
      showSkip: false,
      showFrameSkip: false,
      showTime: true,
      showFullscreen: true,
      scrub: false,
      rates: "",
      skipAmount: 10,
      hideMute: false,
      hideVolume: false,
      alwaysShowSlider: false,
      loop: false,
      hideControlsDelay: 3000,
      neverHideControlsUnlessFullscreen: false,
      enableDoubleClickSkip: false,
      disableDoubleClickFullscreen: false,
      disableInitialOverlay: false,
      disableKeyboardControls: false,
      showCustomOne: false,
      showCustomTwo: false,
      showCustomSliders: false
    };
  }
  public render() {
    let rates: number[] | undefined;
    try {
      rates = this.state.rates
        .split(",")
        .map(rate => parseFloat(rate.trim()))
        .filter(rate => rate > 0);
    } catch (e) {
      console.log("e :", e);
    }
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ width: "50%", overflow: "auto", padding: "10px" }}>
          <div>
            <h2>General Player Settings</h2>
            <ToggleButton
              active={this.state.loop}
              onClick={() => this.setState({ loop: !this.state.loop })}
            >
              Loop Video
            </ToggleButton>
            <ToggleButton
              active={this.state.neverHideControlsUnlessFullscreen}
              onClick={() =>
                this.setState({
                  neverHideControlsUnlessFullscreen: !this.state
                    .neverHideControlsUnlessFullscreen
                })
              }
            >
              Always show controls when not in fullscreen.
            </ToggleButton>
            <h4>
              Hide controls delay. (in ms, negative or 0 disables hiding
              completely)
            </h4>
            <input
              onChange={e => {
                let time: number;
                try {
                  time = parseFloat(e.target.value);
                  this.setState({ hideControlsDelay: time });
                } catch (e) {
                  console.log("e :", e);
                }
              }}
            />
            <ToggleButton
              active={this.state.enableDoubleClickSkip}
              onClick={() =>
                this.setState({
                  enableDoubleClickSkip: !this.state.enableDoubleClickSkip
                })
              }
            >
              Enable double click to skip (player edges)
            </ToggleButton>
            <ToggleButton
              active={this.state.disableDoubleClickFullscreen}
              onClick={() =>
                this.setState({
                  disableDoubleClickFullscreen: !this.state
                    .disableDoubleClickFullscreen
                })
              }
            >
              Disable double click to fullscreen
            </ToggleButton>
            <ToggleButton
              active={this.state.disableKeyboardControls}
              onClick={() =>
                this.setState({
                  disableKeyboardControls: !this.state.disableKeyboardControls
                })
              }
            >
              Disable keyboard controls
            </ToggleButton>
            <ToggleButton
              active={this.state.disableInitialOverlay}
              onClick={() =>
                this.setState({
                  disableInitialOverlay: !this.state.disableInitialOverlay
                })
              }
            >
              Disable inital play overlay
            </ToggleButton>
          </div>
          <div>
            <h2>Play/Pause Controls</h2>
            <ToggleButton
              active={this.state.showPlayPause}
              onClick={() =>
                this.setState({ showPlayPause: !this.state.showPlayPause })
              }
            >
              Toggle Play/Pause ToggleButton
            </ToggleButton>
          </div>
          <div>
            <h2>Progress Bar Controls</h2>
            <ToggleButton
              active={this.state.showProgressBar}
              onClick={() =>
                this.setState({ showProgressBar: !this.state.showProgressBar })
              }
            >
              Toggle Progress Bar
            </ToggleButton>
            <ToggleButton
              active={this.state.scrub}
              onClick={() => this.setState({ scrub: !this.state.scrub })}
            >
              Toggle Scrubbing
            </ToggleButton>
          </div>
          <div>
            <h2>Volume Slider Controls</h2>
            <ToggleButton
              active={this.state.showVolume}
              onClick={() =>
                this.setState({ showVolume: !this.state.showVolume })
              }
            >
              Toggle Volume Slider
            </ToggleButton>
            <ToggleButton
              active={this.state.hideMute}
              onClick={() =>
                this.setState({
                  hideMute: !this.state.hideMute,
                  hideVolume:
                    this.state.hideMute === false
                      ? false
                      : this.state.hideVolume
                })
              }
            >
              Hide Mute Button
            </ToggleButton>
            <ToggleButton
              active={this.state.hideVolume}
              onClick={() =>
                this.setState({
                  hideVolume: !this.state.hideVolume,
                  hideMute:
                    this.state.hideVolume === false
                      ? false
                      : this.state.hideMute
                })
              }
            >
              Hide Volume Slider
            </ToggleButton>
            <ToggleButton
              active={this.state.alwaysShowSlider}
              onClick={() =>
                this.setState({
                  alwaysShowSlider: !this.state.alwaysShowSlider
                })
              }
            >
              Disable Volume Slider Animation
            </ToggleButton>
          </div>
          <div>
            <h2>Playback Rate Controls</h2>
            <ToggleButton
              active={this.state.showPlaybackRate}
              onClick={() =>
                this.setState({
                  showPlaybackRate: !this.state.showPlaybackRate
                })
              }
            >
              Toggle Playback Rate Menu
            </ToggleButton>
            <h4>Custom Rates (comma separated positive values, spaces OK)</h4>
            <input
              value={this.state.rates}
              onChange={e => this.setState({ rates: e.target.value })}
            />
          </div>
          <div>
            <h2>Skip Controls</h2>
            <ToggleButton
              active={this.state.showSkip}
              onClick={() => this.setState({ showSkip: !this.state.showSkip })}
            >
              Toggle Skip Buttons
            </ToggleButton>
            <ToggleButton
              active={true}
              onClick={() =>
                this.setState({
                  skipAmount:
                    this.state.skipAmount === 5
                      ? 10
                      : this.state.skipAmount === 10
                      ? 30
                      : 5
                })
              }
            >
              {`Change Skip Amount (Current: ${this.state.skipAmount})`}
            </ToggleButton>
            <ToggleButton
              active={this.state.showFrameSkip}
              onClick={() =>
                this.setState({ showFrameSkip: !this.state.showFrameSkip })
              }
            >
              Toggle Frame Skip Buttons
            </ToggleButton>
          </div>
          <div>
            <h2>Time Display Controls</h2>
            <ToggleButton
              active={this.state.showTime}
              onClick={() => this.setState({ showTime: !this.state.showTime })}
            >
              Toggle Time Display
            </ToggleButton>
          </div>
          <div>
            <h2>Fullscreen display controls</h2>
            <ToggleButton
              active={this.state.showFullscreen}
              onClick={() =>
                this.setState({ showFullscreen: !this.state.showFullscreen })
              }
            >
              Toggle Fullscreen Button
            </ToggleButton>
          </div>
          <div>
            <h2>Customization Examples</h2>
            <ToggleButton
              active={this.state.showCustomTwo}
              onClick={() =>
                this.setState({ showCustomTwo: !this.state.showCustomTwo })
              }
            >
              Toggle Custom Dummy Component
            </ToggleButton>
            <ToggleButton
              active={this.state.showCustomOne}
              onClick={() =>
                this.setState({ showCustomOne: !this.state.showCustomOne })
              }
            >
              Toggle Custom Volume Component
            </ToggleButton>
            <ToggleButton
              active={this.state.showCustomSliders}
              onClick={() =>
                this.setState({
                  showCustomSliders: !this.state.showCustomSliders
                })
              }
            >
              Toggle Custom Slider Component
            </ToggleButton>
          </div>
        </div>
        <div style={{ width: "50%" }}>
          <Player
            fluid
            framerate={15}
            src={video}
            loop={this.state.loop}
            hideControlsDelay={this.state.hideControlsDelay}
            neverHideControlsUnlessFullscreen={
              this.state.neverHideControlsUnlessFullscreen
            }
            enableDoubleClickSkip={this.state.enableDoubleClickSkip}
            disableDoubleClickFullscreen={
              this.state.disableDoubleClickFullscreen
            }
            disableInitialOverlay={this.state.disableInitialOverlay}
            disableKeyboardControls={this.state.disableKeyboardControls}
            render={(props: PlayerState, player: Player) => (
              <ControlBar>
                <ControlRow align="flex-start">
                  {this.state.showPlayPause && (
                    <PlayPause
                      isPlaying={props.playing}
                      togglePlay={player.togglePlay}
                    />
                  )}
                  {this.state.showProgressBar && (
                    <ProgressBar
                      seeking={props.seeking}
                      duration={props.duration}
                      currentTime={props.currentTime}
                      buffered={props.buffered}
                      setCurrentTime={player.seek}
                      scrub={this.state.scrub}
                    />
                  )}
                  {this.state.showPlaybackRate && (
                    <PlaybackRate
                      setRate={(rate: number) => (player.playbackRate = rate)}
                      rate={props.playbackRate}
                      rates={rates}
                    />
                  )}
                  {this.state.showSkip && (
                    <>
                      <TimeSkip
                        amount={this.state.skipAmount}
                        skip={player.skip}
                      />
                      <TimeSkip
                        reverse
                        amount={this.state.skipAmount}
                        skip={player.skip}
                      />
                    </>
                  )}
                  {this.state.showFrameSkip && (
                    <>
                      <FrameSkip frameRate={15} reverse skip={player.skip} />
                      <FrameSkip frameRate={15} skip={player.skip} />
                    </>
                  )}
                  {this.state.showTime && (
                    <TimeDisplay
                      duration={props.duration}
                      currentTime={props.currentTime}
                      displayType={TimeDisplayType.ELAPSED}
                      secondaryDisplayType={TimeDisplayType.TOTAL}
                    />
                  )}
                  {this.state.showVolume && (
                    <VolumeControl
                      muted={props.muted}
                      volumeLevel={player.volume}
                      setVolume={(volume: number) => (player.volume = volume)}
                      mute={() => (player.muted = !player.muted)}
                    />
                  )}
                  {this.state.showFullscreen && (
                    <FullScreenToggle
                      isFullscreen={props.isFullscreen}
                      toggleFullscreen={player.toggleFullscreen}
                    />
                  )}
                  {this.state.showCustomOne && (
                    <Control>
                      <button onClick={() => alert("You clicked a button!")}>
                        <MdInfo size="100%" />
                      </button>
                    </Control>
                  )}
                  {this.state.showCustomTwo && (
                    <Control>
                      <input
                        value={player.volume * 100}
                        onChange={e => {
                          let volumeToSet = player.volume / 100;
                          try {
                            volumeToSet = parseFloat(e.target.value) / 100;
                          } catch (e) {
                            console.log("e :", e);
                          }
                          player.volume = volumeToSet;
                        }}
                      />
                    </Control>
                  )}
                </ControlRow>
              </ControlBar>
            )}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
