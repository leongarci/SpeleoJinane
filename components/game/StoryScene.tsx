"use client";

import { PixelButton } from "./PixelButton";
import type { StoryBeat } from "@/lib/story";

const BG: Record<StoryBeat["bg"], string> = {
  beach: "/assets/beach-bg.png",
  cave: "/assets/cave-bg.png",
  rappel: "/assets/rappel-bg.png",
  sky: "/assets/title-bg.png",
};

const PORTRAIT: Record<NonNullable<StoryBeat["portrait"]>, string> = {
  jinane: "/assets/jinane-idle.png",
  leon: "/assets/leon-spelunker.png",
};

type Props = {
  beat: StoryBeat;
  onNext: () => void;
};

export function StoryScene({ beat, onNext }: Props) {
  return (
    <div className="scene">
      <div
        className="scene-bg"
        style={{ backgroundImage: `url(${BG[beat.bg]})` }}
      />
      <div className="scene-shade" />
      <div className="story-layout">
        {beat.portrait ? (
          <div className={`portrait portrait-${beat.portrait}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PORTRAIT[beat.portrait]} alt="" />
          </div>
        ) : null}
        <div className="dialogue">
          {beat.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {beat.hint ? <p className="hint">{beat.hint}</p> : null}
        </div>
        <PixelButton onClick={onNext}>{beat.cta}</PixelButton>
      </div>
    </div>
  );
}
