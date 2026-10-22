import React from "react";
import { MENU_ROOM_ASSETS, type MenuRoom } from "../assets/coreAssets";

export function MenuRoomBackground({ room }: { room: MenuRoom }) {
  const asset = MENU_ROOM_ASSETS[room];
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="menu-room-background" aria-hidden="true" style={styles.root}>
      <img src={asset.poster} alt="" style={styles.media} />
      {!reducedMotion && (
        <video
          key={asset.video}
          className="menu-room-video"
          src={asset.video}
          poster={asset.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={styles.media}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#03070a" },
  media: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" },
};
