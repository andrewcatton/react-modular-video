export type ProgressDragEvent =
  | React.MouseEvent<HTMLDivElement>
  | React.TouchEvent<HTMLDivElement>;

export type SliderHandle = {
  position: number;
  onDrag?: (position: number) => void;
  onDragEnd?: (position: number) => void;
};

export type SliderFill = {
  color: string;
  size: number;
  position: number;
  order: number;
};
