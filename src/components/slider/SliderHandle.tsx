import styled from "styled-components";

export const RangeHandle = styled.div.attrs<{
  position: number;
  expand: boolean;
}>({
  style: ({ position }) => ({
    marginLeft: position + "%"
  })
})`
  position: absolute;
  z-index: 4;
  border-radius: 100%;
  // transition: margin-left 0.1s ease;
  opacity: ${({ expand }) => (expand ? 1 : 0)};

  display: flex;
  justify-content: center;
  align-items: center;
  left: -5px;
  width: 10px;
  height: 100%;
`;

export const RangeHandleCircle = styled.div<{
  expand: boolean;
  fillColor?: string;
  borderColor?: string;
}>`
  height: ${({ expand }) => (expand ? "10px" : 0)};
  width: ${({ expand }) => (expand ? "10px" : 0)};
  border-radius: 100%;
  background: ${({ fillColor }) => fillColor || "white"};
  border: 1px solid ${({ borderColor }) => borderColor || "white"};
  flex: 0 0 auto;
  transition: width 0.2s ease, height 0.2s ease;
`;

export const RangeHandleTip = styled.div<{ invert?: boolean }>`
  position: absolute;
  background: ${({ invert }) => (invert ? "#000" : "#fff")};
  color: ${({ invert }) => (invert ? "#fff" : "#000")};
  padding: 2px 5px;
  border-radius: 4px;
  bottom: 12px;
  opacity: 0.8;
`;

export const HoverHandle = styled.div.attrs<{
  position: number;
  expand: boolean;
}>({
  style: props => ({
    marginLeft: props.position + "%"
  })
})`
  position: absolute;
  z-index: 4;
  border-radius: 100%;
  // transition: margin-left 0.1s ease;
  opacity: ${props => (props.expand ? 1 : 0)};

  display: flex;
  justify-content: center;
  align-items: center;
  left: -5px;
  width: 10px;
  height: 100%;
`;

export const HoverHandleInner = styled.div<{ expand: boolean }>`
  height: ${props => (props.expand ? "10px" : 0)};
  width: ${props => (props.expand ? "1px" : 0)};
  border-radius: 0;
  opacity: 0.5;
  background: black;
  border: none;
  flex: 0 0 auto;
`;
