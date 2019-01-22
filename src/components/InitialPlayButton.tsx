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
    <Overlay>
      {props.icon ? props.icon : <MdPlayCircleFilled size={80} />}
    </Overlay>
  );
}
