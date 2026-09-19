export function initMedia(root: HTMLElement, remoteFeatures = false) {
  const controller = new AbortController(),
    { signal } = controller;
  const observers: IntersectionObserver[] = [];
  for (const reader of root.querySelectorAll<HTMLElement>(
    "[data-audio-reader]",
  )) {
    const audio = reader.querySelector<HTMLAudioElement>("audio"),
      button = reader.querySelector<HTMLButtonElement>(
        "[data-audio-reader-toggle]",
      );
    if (!audio || !button) continue;
    const state = () => {
      reader.dataset.audioReaderState = audio.paused ? "paused" : "playing";
      button.setAttribute("aria-pressed", String(!audio.paused));
    };
    audio.addEventListener("play", state, { signal });
    audio.addEventListener("pause", state, { signal });
    button.addEventListener(
      "click",
      () => {
        if (audio.paused)
          audio.play().catch(() => (reader.dataset.audioReaderState = "error"));
        else audio.pause();
      },
      { signal },
    );
  }
  for (const kind of ["youtube", "bilibili", "acfun"])
    for (const facade of root.querySelectorAll<HTMLElement>(`[data-${kind}]`)) {
      const button = facade.querySelector<HTMLButtonElement>(
        `[data-${kind}-activate]`,
      );
      if (!button) continue;
      if (!remoteFeatures) {
        button.disabled = true;
        continue;
      }
      const activate = () => {
        if (button.disabled || !remoteFeatures) return;
        let src = "";
        if (
          kind === "youtube" &&
          /^[\w-]{11}$/.test(facade.dataset.youtubeId || "")
        )
          src = `https://www.youtube-nocookie.com/embed/${facade.dataset.youtubeId}`;
        if (
          kind === "bilibili" &&
          /^BV[\w]+$/.test(facade.dataset.bilibiliBvid || "")
        )
          src = `https://player.bilibili.com/player.html?bvid=${facade.dataset.bilibiliBvid}&page=${Number(facade.dataset.bilibiliPart) || 1}&autoplay=0`;
        if (kind === "acfun" && /^\d+$/.test(facade.dataset.acfunAcid || ""))
          src = `https://www.acfun.cn/player/ac${facade.dataset.acfunAcid}`;
        if (!src) return;
        const frame = document.createElement("iframe");
        frame.src = src;
        frame.title = facade.dataset[`${kind}Title`] || kind;
        frame.allow = "fullscreen; picture-in-picture";
        frame.allowFullscreen = true;
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.className = `m3-${kind}__player`;
        facade.querySelector(`.m3-${kind}__stage`)?.append(frame);
        button.disabled = true;
        facade.dataset[`${kind}State`] = "active";
      };
      button.addEventListener("click", activate, { signal });
      if (facade.dataset.videoPreload === "auto") {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              observer.disconnect();
              activate();
            }
          },
          { rootMargin: "240px" },
        );
        observer.observe(facade);
        observers.push(observer);
      }
    }
  return () => {
    controller.abort();
    observers.forEach((o) => o.disconnect());
    root
      .querySelectorAll<HTMLMediaElement>("audio,video")
      .forEach((a) => a.pause());
    root.querySelectorAll("iframe").forEach((f) => f.remove());
  };
}
