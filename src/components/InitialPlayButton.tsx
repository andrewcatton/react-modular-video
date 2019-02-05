import React from "react";
import { MdPlayCircleFilled } from "react-icons/md";
import styled from "styled-components";

const Overlay = styled.button`
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0, 0, 0, 0);
  border: none;
  padding: 0;
  z-index: 2;
  bottom: 0;
  cursor: pointer;
`;

interface InitialPlayButtonProps {
  icon?: JSX.Element;
}

export function InitialPlayButton(props: InitialPlayButtonProps) {
  return (
    <Overlay className="rmv__initial-overlay">
      {props.icon ? (
        props.icon
      ) : (
        <MdPlayCircleFilled
          className="rmv__initial-overlay__icon rmv__icon"
          size={80}
        />
      )}
    </Overlay>
  );
}
