import { useEffect, useRef } from 'react';
import styles from '@/styles/VideoPlayer.module.css';

export default function VideoPlayer({ title, streamUrl, subtitles = [], onProgress }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handler = () => {
      if (!onProgress) return;
      onProgress({
        currentTime: video.currentTime,
        duration: video.duration
      });
    };
    video.addEventListener('timeupdate', handler);
    return () => {
      video.removeEventListener('timeupdate', handler);
    };
  }, [onProgress]);

  return (
    <div className={styles.player}>
      <video ref={videoRef} controls preload="metadata" className={styles.video}>
        <source src={streamUrl} />
        {subtitles.map((track) => (
          <track key={track.url} label={track.label} kind="subtitles" srcLang={track.lang} src={track.url} default={track.default} />
        ))}
      </video>
      <div className={styles.meta}>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
