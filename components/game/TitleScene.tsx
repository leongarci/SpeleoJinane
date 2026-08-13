"use client";

import { PixelButton } from "./PixelButton";

type Props = {
  onPlay: () => void;
};

export function TitleScene({ onPlay }: Props) {
  return (
    <div className="scene">
      <div
        className="scene-bg"
        style={{ backgroundImage: "url(/assets/title-bg.png)" }}
      />
      <div className="scene-shade title-shade" />
      <div className="title-layout">
        <p className="kicker">Tellure · Alsace</p>
        <h1 className="title-name">Jinane</h1>
        <p className="title-sub">une aventure t&apos;attend</p>
        <div className="title-portraits">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/jinane-happy.png" alt="Jinane" className="title-hero" />
        </div>
        <PixelButton onClick={onPlay}>Jouer</PixelButton>
        <p className="from">une invitation de Léon</p>
      </div>
    </div>
  );
}
