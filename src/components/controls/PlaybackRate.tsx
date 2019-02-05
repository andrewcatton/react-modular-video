import * as React from "react";
import { Control } from "../ControlBar";
import styled from "styled-components";
import { ControlButtonProps } from "./Types";
import classnames from "classnames";

export interface PlaybackRateProps {
  opaque?: boolean;
  rates?: number[];
  setMenuRef?: (el: HTMLDivElement) => void;
}

export interface PlaybackRateState {
  menuOpen: boolean;
}

const RATES = [0.5, 1, 1.5, 2];

const RateMenu = styled.div<{ opaque?: boolean }>`
  position: absolute;
  bottom: calc(100% + 6px);
  width: 100%;
  background: ${({ opaque }) => (opaque ? "black" : "rgba(0, 0, 0, 0.5)")};
  button {
    width: 100%;
  }
  z-index: 998;
  button:hover,
  button:focus {
    background: ${({ opaque }) =>
      opaque ? "rgb(180, 180, 180)" : "rgba(180, 180, 180, 0.5)"};
  }
`;

const RateControl = styled(Control)`
  position: relative;
  button {
    &:hover,
    &:focus {
      transform: none;
    }
    font-size: 16px;
  }
`;

export class PlaybackRate extends React.Component<
  PlaybackRateProps & ControlButtonProps,
  PlaybackRateState
> {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false
    };
  }

  ref!: HTMLDivElement;
  setRef = (element: HTMLDivElement) => {
    this.ref = element;
    if (this.props.setContainerRef) {
      this.props.setContainerRef(element);
    }
  };

  componentWillMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  handleClick = (e: Event) => {
    if (this.ref.contains(e.target as Node)) {
      return;
    }
    this.setState({ menuOpen: false });
  };

  render() {
    const {
      rates,
      setButtonRef,
      setMenuRef,
      opaque,
      className,
      playerState: { playbackRate }
    } = this.props;
    let {
      player: { setPlaybackRate }
    } = this.props;
    const displayRates = rates && rates.length > 0 ? rates : RATES;
    return (
      <RateControl
        className={classnames(className, "playback-rate rmv__control")}
        innerRef={this.setRef}
        flex="no-shrink"
      >
        <RateMenu
          className="playback-rate__menu rmv__menu"
          innerRef={setMenuRef}
          opaque={opaque}
        >
          {this.state.menuOpen &&
            displayRates.map((rate, index) => {
              if (rate <= 0) return null;
              return (
                <button
                  className="playback-rate__menu__button rmv__menu__button"
                  onClick={() => setPlaybackRate(rate)}
                  key={index}
                >
                  {rate}x
                </button>
              );
            })}
        </RateMenu>
        <button
          className="playback-rate__button rmv__button"
          ref={setButtonRef}
          onKeyDown={e => e.stopPropagation()}
          onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}
        >
          Rate: {playbackRate}x
        </button>
      </RateControl>
    );
  }
}
