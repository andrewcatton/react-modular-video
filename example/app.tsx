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
import { MdInfo } from "react-icons/md";
import {
  Grid,
  Row,
  Col,
  Button,
  Well,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Form
} from "react-bootstrap";
import { SliderHandle, SliderFill } from "src/components/slider";

const video = require("./sample.mp4");

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
  disableAnimate: boolean;
  leftSlider: number;
  rightSlider: number;
  disableTooltip: boolean;
  disableBuffer: boolean;
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
      showCustomSliders: false,
      disableAnimate: false,
      disableTooltip: false,
      disableBuffer: false,
      leftSlider: 50,
      rightSlider: 400
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
    let handles: SliderHandle[] = [];
    let fills: SliderFill[] = [];

    if (this.state.showCustomSliders) {
      handles.push({
        position: this.state.leftSlider,
        onDrag: (pos: number) => {
          if (pos < this.state.rightSlider) {
            this.setState({
              leftSlider: pos
            });
          }
        }
      });
      handles.push({
        position: this.state.rightSlider,
        onDrag: (pos: number) => {
          if (pos > this.state.leftSlider) {
            this.setState({
              rightSlider: pos
            });
          }
        }
      });
      fills.push({
        color: "yellow",
        position: this.state.leftSlider,
        size: this.state.rightSlider - this.state.leftSlider,
        order: 1
      });
    }

    return (
      <Grid fluid style={{ height: "100vh" }}>
        <Row style={{ height: "100%" }}>
          <Col sm={12} lg={6}>
            <h2>Video Player Playground</h2>
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
              render={(playerState: PlayerState, player: Player) => (
                <ControlBar>
                  <ControlRow align="flex-start">
                    {this.state.showPlayPause && (
                      <PlayPause player={player} playerState={playerState} />
                    )}
                    {this.state.showProgressBar && (
                      <ProgressBar
                        player={player}
                        playerState={playerState}
                        scrub={this.state.scrub}
                        disableAnimate={this.state.disableAnimate}
                        disableMouseTooltip={this.state.disableTooltip}
                        disableBufferBar={this.state.disableBuffer}
                        extraHandles={handles}
                        extraFills={fills}
                      />
                    )}
                    {this.state.showPlaybackRate && (
                      <PlaybackRate
                        player={player}
                        playerState={playerState}
                        rates={rates}
                      />
                    )}
                    {this.state.showSkip && (
                      <>
                        <TimeSkip
                          amount={this.state.skipAmount}
                          player={player}
                          playerState={playerState}
                        />
                        <TimeSkip
                          reverse
                          amount={this.state.skipAmount}
                          player={player}
                          playerState={playerState}
                        />
                      </>
                    )}
                    {this.state.showFrameSkip && (
                      <>
                        <FrameSkip
                          reverse
                          player={player}
                          playerState={playerState}
                        />
                        <FrameSkip player={player} playerState={playerState} />
                      </>
                    )}
                    {this.state.showTime && (
                      <TimeDisplay
                        player={player}
                        playerState={playerState}
                        displayType={TimeDisplayType.ELAPSED}
                        secondaryDisplayType={TimeDisplayType.TOTAL}
                      />
                    )}
                    {this.state.showVolume && (
                      <VolumeControl
                        player={player}
                        playerState={playerState}
                        alwaysShowVolumeSlider={this.state.alwaysShowSlider}
                        hideMuteButton={this.state.hideMute}
                        hideVolumeSlider={this.state.hideVolume}
                      />
                    )}
                    {this.state.showFullscreen && (
                      <FullScreenToggle
                        player={player}
                        playerState={playerState}
                      />
                    )}
                    {this.state.showCustomTwo && (
                      <Control>
                        <button onClick={() => alert("You clicked a button!")}>
                          <MdInfo size="100%" />
                        </button>
                      </Control>
                    )}
                    {this.state.showCustomOne && (
                      <Control>
                        <input
                          value={player.state.volume * 100}
                          onChange={e => {
                            let volumeToSet = player.state.volume / 100;
                            try {
                              volumeToSet = parseFloat(e.target.value) / 100;
                            } catch (e) {
                              console.log("e :", e);
                            }
                            player.setVolume(volumeToSet);
                          }}
                        />
                      </Control>
                    )}
                  </ControlRow>
                </ControlBar>
              )}
            />

            {/* <Well style={{ marginTop: 10 }}>Code display coming soon!</Well> */}
          </Col>
          <Col
            sm={12}
            lg={6}
            style={{ height: "100%", overflow: "auto", paddingBottom: 20 }}
          >
            <h2>Player Settings</h2>
            <h3>Basic</h3>
            <Button
              active={this.state.disableInitialOverlay}
              onClick={() =>
                this.setState({
                  disableInitialOverlay: !this.state.disableInitialOverlay
                })
              }
            >
              Disable inital play overlay
            </Button>
            <Button
              active={this.state.loop}
              onClick={() => this.setState({ loop: !this.state.loop })}
            >
              Loop Video on end
            </Button>
            <h3>Control Bar</h3>
            <FormGroup>
              <ControlLabel>Control bar hide delay</ControlLabel>
              <FormControl
                type="text"
                value={this.state.hideControlsDelay}
                onChange={(e: any) => {
                  this.setState({ hideControlsDelay: e.target.value });
                }}
              />
              <HelpBlock>
                Enter time in ms. Negative/zero disables hide.
              </HelpBlock>
            </FormGroup>
            <Button
              active={this.state.neverHideControlsUnlessFullscreen}
              onClick={() =>
                this.setState({
                  neverHideControlsUnlessFullscreen: !this.state
                    .neverHideControlsUnlessFullscreen
                })
              }
            >
              Always show controls (except for fullscreen)
            </Button>
            <h3>Mouse/Keyboard Controls</h3>
            <Button
              active={this.state.enableDoubleClickSkip}
              onClick={() =>
                this.setState({
                  enableDoubleClickSkip: !this.state.enableDoubleClickSkip
                })
              }
            >
              Enable double click to skip (player edges)
            </Button>
            <Button
              active={this.state.disableDoubleClickFullscreen}
              onClick={() =>
                this.setState({
                  disableDoubleClickFullscreen: !this.state
                    .disableDoubleClickFullscreen
                })
              }
            >
              Disable double click to fullscreen
            </Button>
            <Button
              active={this.state.disableKeyboardControls}
              onClick={() =>
                this.setState({
                  disableKeyboardControls: !this.state.disableKeyboardControls
                })
              }
            >
              Disable keyboard controls
            </Button>
            <h3>Play/Pause Controls</h3>
            <Button
              active={this.state.showPlayPause}
              onClick={() =>
                this.setState({ showPlayPause: !this.state.showPlayPause })
              }
            >
              Toggle Play/Pause Button
            </Button>
            <h3>Progress Bar Control</h3>
            <Button
              active={this.state.showProgressBar}
              onClick={() =>
                this.setState({
                  showProgressBar: !this.state.showProgressBar
                })
              }
            >
              Toggle Progress Bar
            </Button>
            <Button
              active={this.state.scrub}
              onClick={() => this.setState({ scrub: !this.state.scrub })}
            >
              Toggle Scrubbing
            </Button>
            <Button
              active={this.state.disableAnimate}
              onClick={() =>
                this.setState({ disableAnimate: !this.state.disableAnimate })
              }
            >
              Disable hover animation
            </Button>
            <Button
              active={this.state.disableBuffer}
              onClick={() =>
                this.setState({ disableBuffer: !this.state.disableBuffer })
              }
            >
              Disable buffer bar
            </Button>
            <Button
              active={this.state.disableTooltip}
              onClick={() =>
                this.setState({ disableTooltip: !this.state.disableTooltip })
              }
            >
              Disable tooltip display
            </Button>
            <h3>Volume Slider Control</h3>
            <Button
              active={this.state.showVolume}
              onClick={() =>
                this.setState({ showVolume: !this.state.showVolume })
              }
            >
              Toggle Volume Slider
            </Button>
            <Button
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
            </Button>
            <Button
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
            </Button>
            <Button
              active={this.state.alwaysShowSlider}
              onClick={() =>
                this.setState({
                  alwaysShowSlider: !this.state.alwaysShowSlider
                })
              }
            >
              Disable Volume Slider Animation
            </Button>
            <h3>Playback Rate Controls</h3>
            <Button
              active={this.state.showPlaybackRate}
              onClick={() =>
                this.setState({
                  showPlaybackRate: !this.state.showPlaybackRate
                })
              }
            >
              Toggle Playback Rate Menu
            </Button>
            <FormGroup>
              <ControlLabel>Custom Rates</ControlLabel>
              <FormControl
                type="text"
                value={this.state.rates}
                onChange={(e: any) => this.setState({ rates: e.target.value })}
              />
              <HelpBlock>
                Enter comma separated, positive values. Spaces are OK.
              </HelpBlock>
            </FormGroup>
            <h3>Skip Controls</h3>
            <Button
              active={this.state.showSkip}
              onClick={() => this.setState({ showSkip: !this.state.showSkip })}
            >
              Toggle Skip Buttons
            </Button>
            <Button
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
            </Button>
            <Button
              active={this.state.showFrameSkip}
              onClick={() =>
                this.setState({ showFrameSkip: !this.state.showFrameSkip })
              }
            >
              Toggle Frame Skip Buttons
            </Button>

            <h3>Time Display Controls</h3>
            <Button
              active={this.state.showTime}
              onClick={() => this.setState({ showTime: !this.state.showTime })}
            >
              Toggle Time Display
            </Button>
            <h3>Fullscreen display controls</h3>
            <Button
              active={this.state.showFullscreen}
              onClick={() =>
                this.setState({ showFullscreen: !this.state.showFullscreen })
              }
            >
              Toggle Fullscreen Button
            </Button>
            <h3>Customization Examples</h3>
            <Button
              active={this.state.showCustomTwo}
              onClick={() =>
                this.setState({ showCustomTwo: !this.state.showCustomTwo })
              }
            >
              Toggle Custom Dummy Component
            </Button>
            <Button
              active={this.state.showCustomOne}
              onClick={() =>
                this.setState({ showCustomOne: !this.state.showCustomOne })
              }
            >
              Toggle Custom Volume Component
            </Button>
            <Button
              active={this.state.showCustomSliders}
              onClick={() =>
                this.setState({
                  showCustomSliders: !this.state.showCustomSliders
                })
              }
            >
              Toggle Custom Slider/Fill Component
            </Button>
            {this.state.showCustomSliders && (
              <Form inline>
                <FormGroup>
                  <ControlLabel>Left Slider</ControlLabel>
                  <FormControl
                    disabled
                    type="text"
                    value={this.state.leftSlider}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Right Slider</ControlLabel>
                  <FormControl
                    disabled
                    type="text"
                    value={this.state.rightSlider}
                  />
                </FormGroup>
              </Form>
            )}
          </Col>
        </Row>
      </Grid>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
