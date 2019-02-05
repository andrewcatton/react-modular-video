import styled from "styled-components";

export const RangeFill = styled.div.attrs<{
  size: number;
  position: number;
  color: string;
  order: number;
}>({
  style: ({ size, position }) => ({
    width: size + "%",
    marginLeft: position + "%"
  })
})`
  position: absolute;

  height: 100%;
  background-color: ${({ color }) => color};
  z-index: ${({ order }) => order};
`;

export const RangeFillCrop = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  overflow: hidden;
  border-radius: 4px;
`;
