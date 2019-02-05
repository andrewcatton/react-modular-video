import { PlayerState, Player, PlayerProps } from "src/Player";

export type ControlProps = {
  className?: string;
  setContainerRef?: (el: HTMLDivElement) => void;
  playerState: PlayerState;
  player: Player;
};

export type ControlButtonProps = {
  setButtonRef?: (el: HTMLButtonElement) => void;
} & ControlProps;
