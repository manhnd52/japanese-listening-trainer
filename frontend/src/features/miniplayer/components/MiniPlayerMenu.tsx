"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type MiniPlayerMenuItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type MiniPlayerMenuProps = {
  items: MiniPlayerMenuItem[];
};

const MiniPlayerMenu = ({ items }: MiniPlayerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !(event.target instanceof Node && menuRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="text-brand-400 hover:text-brand-600 rounded transition-colors"
        aria-label="Open mini player options"
      >
        <span className="text-lg leading-none">⋮</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white border border-brand-200 rounded-xl shadow-xl flex flex-col overflow-hidden text-sm">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(false);
                item.onClick();
              }}
              className="flex items-center gap-3 px-3 py-2 text-left text-brand-700 hover:bg-brand-50 transition-colors"
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniPlayerMenu;
