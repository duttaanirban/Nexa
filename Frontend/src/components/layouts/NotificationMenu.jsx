import { useEffect, useRef, useState } from "react";
import {
  Bell,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import { api } from "../../api/api";

/**
 * type → icon/color treatment for each notification.
 */
const TYPE_STYLES = {
  blocked: {
    icon: AlertTriangle,
    iconClass: "text-red-600",
    bgClass: "bg-red-50",
  },
  update: {
    icon: RefreshCw,
    iconClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
};

const DEFAULT_TYPE_STYLE = {
  icon: Bell,
  iconClass: "text-slate-500",
  bgClass: "bg-slate-100",
};

export default function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const hasUnread = unreadCount > 0;

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  /*
   * Load notifications from backend.
   */
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.getNotifications();

        const notificationData = response.data || [];

        setNotifications(
          notificationData.map((notification) => ({
            ...notification,
            time: notification.createdAt
              ? new Date(
                  notification.createdAt
                ).toLocaleString()
              : "",
          }))
        );
      } catch (error) {
        console.error(
          "Notification API error:",
          error
        );

        setError(
          error.message ||
            "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  /*
   * Mark one notification as read.
   */
  const markAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    }
  };

  /*
   * Mark all notifications as read.
   */
  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );
    }
  };

  /*
   * Close on outside click.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (
        !containerRef.current?.contains(
          event.target
        )
      ) {
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
   * Close on Escape.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
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

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Notification trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={
          hasUnread
            ? `View notifications, ${unreadCount} unread`
            : "View notifications"
        }
        className="relative rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <Bell size={17} />

        {hasUnread && (
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Notification dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Notifications
            </h2>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!hasUnread}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCheck
                size={13}
                aria-hidden="true"
              />

              Mark all as read
            </button>
          </div>

          <div
            className="h-px bg-slate-100"
            role="separator"
          />

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center px-6 py-10">
              <p className="text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : error ? (
            /* Error */
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Bell
                  size={16}
                  className="text-red-500"
                  aria-hidden="true"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Unable to load notifications
              </p>

              <p className="max-w-60 text-xs text-slate-500">
                {error}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                <CheckCheck
                  size={16}
                  className="text-slate-400"
                  aria-hidden="true"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                You&apos;re all caught up
              </p>

              <p className="max-w-60 text-xs text-slate-500">
                New notifications will show up here.
              </p>
            </div>
          ) : (
            /* Notifications list */
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {notifications.map(
                (notification) => {
                  const {
                    icon: Icon,
                    iconClass,
                    bgClass,
                  } =
                    TYPE_STYLES[
                      notification.type
                    ] ??
                    DEFAULT_TYPE_STYLE;

                  return (
                    <li
                      key={notification.id}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bgClass}`}
                        >
                          <Icon
                            size={14}
                            className={iconClass}
                            aria-hidden="true"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium text-slate-900">
                              {
                                notification.title
                              }
                            </span>

                            {!notification.read && (
                              <span
                                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
                                aria-label="Unread"
                              />
                            )}
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-500">
                            {
                              notification.description
                            }
                          </span>

                          <span className="mt-1 block text-xs text-slate-400">
                            {
                              notification.time
                            }
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}