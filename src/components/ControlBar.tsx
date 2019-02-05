import * as React from "react";
import styled from "styled-components";

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  padding-top: 5px;
  padding-bottom: 5px;
`;

export const Control = styled.div<{ flex?: "grow" | "no-shrink" }>`
  flex: ${props =>
    props.flex
      ? props.flex === "grow"
        ? "1 0 auto"
        : "0 0 auto"
      : "0 1 auto"};
  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    border: none;
    color: white;

    svg {
      fill: white;
      width: 20px;
      height: 20px;
    }
    &:hover,
    &:focus {
      outline: none;
      transform: scale(1.2);
    }
  }
`;

export const ControlRow = styled.div<{
  align?: "flex-start" | "flex-end" | "center";
}>`
  display: flex;
  flex-direction: row;
  justify-content: ${props => (props.align ? props.align : "space-between")};
  padding-left: 10px;
  padding-right: 10px;
  align-items: center;
  ${Control} {
    margin-right: 5px;
  }
  ${Control}:last-child {
    margin-right: 0px;
  }
`;

export const ControlCol = styled.div<{ flex?: "grow" | "no-shrink" }>`
  flex: ${props =>
    props.flex
      ? props.flex === "grow"
        ? "1 0 auto"
        : "0 0 auto"
      : "0 1 auto"};
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  padding-bottom: 5px;
`;

export interface ControlBarProps {
  children: any;
  setControlBarRef: (el: HTMLDivElement) => void;
}

export const ControlBar = (props: ControlBarProps) => {
  return (
    <Controls className="rmv__control-bar" innerRef={props.setControlBarRef}>
      {props.children}
    </Controls>
  );
};
