import React from "react";
import { MENU_ROOM_ASSETS, type MenuRoom } from "../assets/coreAssets";

export function MenuRoomBackground({ room }: { room: MenuRoom }) {
  const asset = MENU_ROOM_ASSETS[room];
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);

  React.useEffect(() => setVideoReady(false), [asset.video]);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="menu-room-background" aria-hidden="true" style={styles.root}>
      <img src={asset.poster} crossOrigin="anonymous" alt="" style={styles.media} />
      {!reducedMotion && (
        <video
          key={asset.video}
          className="menu-room-video"
          src={asset.video}
          crossOrigin="anonymous"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={() => setVideoReady(true)}
          style={{ ...styles.media, ...styles.video, opacity: videoReady ? 1 : 0 }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#03070a" },
  media: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" },
  video: { transition: "opacity 420ms ease-out", willChange: "opacity" },
};
