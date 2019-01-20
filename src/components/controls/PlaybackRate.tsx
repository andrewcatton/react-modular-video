import * as React from "react";
import { Control } from "../ControlBar";
import styled from "styled-components";

export interface PlaybackRateProps {
  rate: number;
  setRate: (rate: number) => void;
  opaque?: boolean;
  rates?: number[];
}

export interface PlaybackRateState {
  menuOpen: boolean;
}

const RATES = [0.5, 1, 1.5, 2];

const RateMenu = styled.div<{ opaque?: boolean }>`
  position: absolute;
  bottom: calc(100% + 6px);
  width: 100%;
  background: ${props => (props.opaque ? "black" : "rgba(0, 0, 0, 0.5)")};
  button {
    width: 100%;
  }
  z-index: 998;
  button:hover,
  button:focus {
    background: ${props =>
      props.opaque ? "rgb(180, 180, 180)" : "rgba(180, 180, 180, 0.5)"};
  }
`;

const RateButton = styled.div`
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
  PlaybackRateProps,
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

  public render() {
    let rates =
      this.props.rates && this.props.rates.length > 0
        ? this.props.rates
        : RATES;
    return (
      <Control innerRef={this.setRef} flex="no-shrink">
        <RateButton>
          <RateMenu opaque={this.props.opaque}>
            {this.state.menuOpen &&
              rates.map((rate, index) => {
                if (rate <= 0) return null;
                return (
                  <button onClick={() => this.props.setRate(rate)} key={index}>
                    {rate}x
                  </button>
                );
              })}
          </RateMenu>
          <button
            onKeyDown={e => e.stopPropagation()}
            onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}
          >
            Rate: {this.props.rate}x
          </button>
        </RateButton>
      </Control>
    );
  }
}
