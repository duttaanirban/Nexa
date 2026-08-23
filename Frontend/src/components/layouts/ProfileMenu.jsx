import { useEffect, useRef, useState } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

const USER = {
  name: "Mira Kapoor",
  role: "Frontend Lead",
  initials: "MK",
};

const MENU_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account-settings", label: "Account settings", icon: Settings },
  { id: "sign-out", label: "Sign out", icon: LogOut, destructive: true },
];

/**
 * ProfileMenu
 *
 * Self-contained trigger + dropdown for the current user. Not a
 * generic dropdown abstraction — the trigger markup, user data, and
 * menu items are specific to this profile menu.
 *
 * State: a single `isOpen` boolean. No other component state.
 *
 * Behavior:
 * - Click the trigger to toggle the menu.
 * - Click a menu item to run its (currently no-op) action and close.
 * - Click outside, press Escape, or select an item closes the menu
 *   and returns focus to the trigger.
 * - ArrowUp/ArrowDown move focus between menu items while open.
 *
 * Usage (inside Navbar.jsx, in place of the existing profile button):
 *   import ProfileMenu from "./ProfileMenu";
 *   <ProfileMenu />
 */
export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleItemSelect = () => {
    // Actions are placeholders — wire up real behavior later.
    // eslint-disable-next-line no-console
    closeMenu();
  };

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  // Close on Escape; arrow-key navigation between items while open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const items = itemRefs.current.filter(Boolean);
        if (items.length === 0) return;

        const currentIndex = items.indexOf(document.activeElement);
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + direction + items.length) % items.length;

        items[nextIndex].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          {USER.initials}
        </div>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          {USER.name}
        </span>
        <ChevronDown
          size={14}
          className={`hidden text-slate-400 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          <div className="flex items-center gap-3 px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {USER.initials}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-slate-900">
                {USER.name}
              </p>
              <p className="truncate text-xs text-slate-500">{USER.role}</p>
            </div>
          </div>

          <div className="my-1 h-px bg-slate-100" role="separator" />

          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                type="button"
                role="menuitem"
                onClick={handleItemSelect}
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
                  item.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}