import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useDismissablePopup } from "../useDismissablePopup";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const Popup = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const popupRef = { current: document.createElement("div") };
  const triggerRef = { current: document.createElement("button") };
  useDismissablePopup(popupRef, triggerRef, isOpen, setIsOpen);
  return null;
};

const pressEscape = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

describe("useDismissablePopup", () => {
  const roots: Root[] = [];

  const mount = (isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    const root = createRoot(document.createElement("div"));
    roots.push(root);
    act(() => root.render(<Popup isOpen={isOpen} setIsOpen={setIsOpen} />));
    return root;
  };

  afterEach(() => {
    act(() => roots.splice(0).forEach((root) => root.unmount()));
  });

  it("closes a single open popup on Escape", () => {
    const close = vi.fn();
    mount(true, close);
    act(pressEscape);
    expect(close).toHaveBeenCalledWith(false);
  });

  it("ignores Escape while closed", () => {
    const close = vi.fn();
    mount(false, close);
    act(pressEscape);
    expect(close).not.toHaveBeenCalled();
  });

  it("closes only the most recently opened popup per Escape", () => {
    const first = vi.fn();
    const second = vi.fn();
    mount(true, first);
    const secondRoot = mount(true, second);

    act(pressEscape);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();

    act(() => secondRoot.unmount());
    act(pressEscape);
    expect(first).toHaveBeenCalledTimes(1);
  });
});
