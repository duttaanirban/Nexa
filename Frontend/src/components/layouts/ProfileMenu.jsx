import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useCurrentUser } from "../../context/useCurrentUser";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MENU_ITEMS = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "account-settings",
    label: "Account settings",
    icon: Settings,
  },
  {
    id: "sign-out",
    label: "Sign out",
    icon: LogOut,
    destructive: true,
  },
];

export default function ProfileMenu() {
  const { user, loading } = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleItemSelect = async (item) => {
    if (item.id === "profile") {
      navigate("/settings?section=profile");
      closeMenu();
      return;
    }

    if (item.id === "account-settings") {
      navigate("/settings?section=account");
      closeMenu();
      return;
    }

    if (item.id === "sign-out") {
      closeMenu();

      try {
        await logout();
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
      }

      return;
  }

    closeMenu();
  };

  /*
   * Close on outside click.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
  }, [isOpen]);

  /*
   * Keyboard navigation.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        const items =
          itemRefs.current.filter(Boolean);

        if (items.length === 0) return;

        const currentIndex =
          items.indexOf(document.activeElement);

        const direction =
          event.key === "ArrowDown" ? 1 : -1;

        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex +
                direction +
                items.length) %
              items.length;

        items[nextIndex].focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [isOpen]);

  /*
   * Move focus into menu when opened.
   */
  useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const displayInitials = loading
    ? "..."
    : user?.initials || "?";

  const displayName = loading
    ? "Loading..."
    : user?.name || "User";

  const displayRole =
    user?.role || "No role specified";

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
          {displayInitials}
        </div>

        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          {displayName}
        </span>

        <ChevronDown
          size={14}
          className={`hidden text-slate-400 transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {/* User information */}
          <div className="flex items-center gap-3 px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              {displayInitials}
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {displayRole}
              </p>
            </div>
          </div>

          <div
            className="my-1 h-px bg-slate-100"
            role="separator"
          />

          {/* Menu items */}
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                onClick={() =>
                  handleItemSelect(item)
                }
                className={[
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                  item.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                />

                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}