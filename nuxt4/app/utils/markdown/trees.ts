export function initTrees(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const dialogs = new Set<HTMLDialogElement>();
  function choose(button: HTMLElement) {
    const tree = button.closest(".m3-code-tree");
    const path = button.dataset.fileTarget;
    if (!tree || !path) return;
    tree.querySelectorAll<HTMLElement>("[data-file-target]").forEach((b) => {
      b.classList.toggle("m3-code-tree__file-btn--active", b === button);
      b.closest("[role=treeitem]")?.setAttribute(
        "aria-selected",
        String(b === button),
      );
    });
    tree.querySelectorAll<HTMLElement>("[data-file-path]").forEach((panel) => {
      panel.hidden = panel.dataset.filePath !== path;
      panel.classList.toggle("hidden", panel.hidden);
    });
  }
  function keyboard(event: KeyboardEvent) {
    if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
    const button = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-file-target]",
    );
    if (!button) return;
    event.preventDefault();
    const list = [
      ...button
        .closest(".m3-code-tree")!
        .querySelectorAll<HTMLElement>("[data-file-target]"),
    ];
    const next =
      list[
        (list.indexOf(button) +
          (event.key === "ArrowDown" ? 1 : -1) +
          list.length) %
          list.length
      ];
    next?.focus();
    if (next) choose(next);
  }
  function click(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>("[data-file-target]");
    if (button) choose(button);
    const expand = target.closest<HTMLElement>(".m3-code-tree__expand-btn");
    if (!expand) return;
    const current = expand.closest("dialog");
    if (current) {
      current.close();
      return;
    }
    const tree = expand.closest<HTMLElement>(".m3-code-tree");
    if (!tree) return;
    const placeholder = document.createComment("code-tree");
    tree.before(placeholder);
    const dialog = document.createElement("dialog");
    dialog.className = "panel";
    dialog.style.cssText = "max-width:95vw;width:1100px;max-height:90vh";
    dialog.append(tree);
    document.body.append(dialog);
    dialogs.add(dialog);
    dialog.addEventListener(
      "close",
      () => {
        placeholder.replaceWith(tree);
        dialog.remove();
        dialogs.delete(dialog);
        if (root.isConnected) expand.focus();
      },
      { once: true },
    );
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) dialog.close();
        else click(event);
      },
      { signal },
    );
    dialog.addEventListener("keydown", keyboard, { signal });
    dialog.showModal();
  }
  root.addEventListener("click", click, { signal });
  root.addEventListener("keydown", keyboard, { signal });
  return () => {
    dialogs.forEach((dialog) => dialog.close());
    controller.abort();
  };
}
