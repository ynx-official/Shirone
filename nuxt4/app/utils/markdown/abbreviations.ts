let instance = 0;

/** Enhance only this rendered article; all listeners and timers follow its lifetime. */
export function initAbbreviations(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const prefix = `abbr-${++instance}`;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active: HTMLElement | undefined;
  const entries = [
    ...root.querySelectorAll<HTMLElement>("abbr[data-abbreviation-expansion]"),
  ].map((term, index) => {
    const originalId = term.getAttribute("aria-describedby") || "";
    const tip = root.querySelector<HTMLElement>(
      `[id="${CSS.escape(originalId)}"]`,
    );
    return { term, tip, originalId, id: `${prefix}-${index}` };
  });
  function close() {
    clearTimeout(timer);
    if (active?.matches(":popover-open")) active.hidePopover();
    active = undefined;
  }
  for (const { term, tip, id } of entries) {
    if (!tip || typeof tip.showPopover !== "function") continue;
    // Repeated Markdown renderers must not share tooltip IDs or CSS anchors.
    tip.id = id;
    term.setAttribute("aria-describedby", id);
    term.style.setProperty("anchor-name", `--${id}`);
    tip.style.setProperty("--m3-abbr-anchor", `--${id}`);
    term.removeAttribute("title");
    const open = () => {
      close();
      if (!tip.isConnected) return;
      tip.showPopover();
      active = tip;
      if (!CSS.supports("position-area", "block-start")) {
        const rect = term.getBoundingClientRect();
        const width = tip.getBoundingClientRect().width;
        tip.style.left = `${Math.max(width / 2 + 12, Math.min(innerWidth - width / 2 - 12, rect.x + rect.width / 2))}px`;
        tip.style.top = `${rect.top > tip.offsetHeight + 16 ? rect.top - tip.offsetHeight / 2 - 8 : rect.bottom + tip.offsetHeight / 2 + 8}px`;
      }
    };
    term.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType !== "mouse") return;
        clearTimeout(timer);
        timer = setTimeout(open, 300);
      },
      { signal },
    );
    term.addEventListener(
      "pointerleave",
      (event) => {
        if (event.pointerType === "mouse") close();
      },
      { signal },
    );
    term.addEventListener("focus", open, { signal });
    term.addEventListener("blur", close, { signal });
    term.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType !== "touch") return;
        event.preventDefault();
        if (active === tip) close();
        else open();
      },
      { signal },
    );
    term.dataset.enhanced = "true";
  }
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") close();
    },
    { signal },
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest("abbr[data-abbreviation-expansion]")
      )
        close();
    },
    { signal },
  );
  return () => {
    close();
    controller.abort();
    for (const { term, tip, originalId } of entries) {
      if (!tip) continue;
      tip.id = originalId;
      term.setAttribute("aria-describedby", originalId);
      term.setAttribute("title", term.dataset.abbreviationExpansion || "");
      term.style.setProperty("anchor-name", `--${originalId}`);
      tip.style.setProperty("--m3-abbr-anchor", `--${originalId}`);
      delete term.dataset.enhanced;
    }
  };
}
