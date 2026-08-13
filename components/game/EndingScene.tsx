"use client";

import { PixelButton } from "./PixelButton";
import { parcoursById } from "@/lib/parcours";
import { formatDateFr } from "@/lib/dates";
import type { Rsvp } from "@/lib/types";

type Props = {
  rsvp: Rsvp;
  onReplay: () => void;
};

export function EndingScene({ rsvp, onReplay }: Props) {
  const coming = rsvp.coming === true;
  const parcours = rsvp.duration ? parcoursById(rsvp.duration) : null;
  const day = rsvp.date ? Number(rsvp.date.slice(-2)) : null;

  return (
    <div className="scene">
      <div
        className="scene-bg"
        style={{
          backgroundImage: coming
            ? "url(/assets/cave-bg.png)"
            : "url(/assets/beach-bg.png)",
        }}
      />
      <div className="scene-shade" />
      <div className="story-layout">
        <div className={`portrait ${coming ? "portrait-leon" : "portrait-jinane"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coming ? "/assets/leon-spelunker.png" : "/assets/jinane-idle.png"}
            alt=""
          />
        </div>
        <div className="dialogue">
          {coming ? (
            <>
              <p>C&apos;est noté.</p>
              {parcours ? (
                <p>
                  {parcours.hours} · {parcours.title}
                </p>
              ) : null}
              {day ? <p>{formatDateFr(String(day))}</p> : null}
              <p>Léon a reçu ton message. On va briller comme l&apos;argent de la mine.</p>
            </>
          ) : (
            <>
              <p>Pas de spéléo, pas de souci.</p>
              <p>L&apos;important c&apos;était de te le demander.</p>
              <p>Léon a bien reçu ta réponse. Je t&apos;embrasse.</p>
            </>
          )}
          <p className="hint">Tellure · Sainte-Marie-aux-Mines</p>
        </div>
        <PixelButton variant="ghost" onClick={onReplay}>
          Rejouer
        </PixelButton>
      </div>
    </div>
  );
}
