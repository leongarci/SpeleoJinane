"use client";

type Props = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mute-btn"
      aria-label={muted ? "Activer le son" : "Couper le son"}
    >
      {muted ? "♪ off" : "♪ on"}
    </button>
  );
}
