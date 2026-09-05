"use client";

import { useEffect, useRef } from "react";

export function useInputFocus<T extends HTMLInputElement | HTMLTextAreaElement>() {
  const inputRef = useRef<T>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLInputElement
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return inputRef;
}
