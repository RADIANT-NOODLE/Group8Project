import React, { useEffect, useState, useCallback } from "react";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../../services/notificationApi.js";
import "./Notifications.css";

const CATEGORY_LABELS = {
  complaint_update: "Complaint",
  work_order_update: "Work Order",
  announcement: "Announcement",
  approval: "Approval",
  system: "System",
};

function categoryBadge(cat) {
  return CATEGORY_LABELS[cat] ?? cat;
}

export default function Notifications() {
  const [data, setData] = useState({ total: 0, unread: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications(100);
      setData(res);
    } catch (e) {
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markRead([id]);
      setData((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        items: prev.items.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n
        ),
      }));
    } catch {
      /* silent */
    }
  };

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await markAllRead();
      setData((prev) => ({
        ...prev,
        unread: 0,
        items: prev.items.map((n) => ({ ...n, is_read: true })),
      }));
    } catch {
      /* silent */
    } finally {
      setMarking(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          {data.unread > 0 && (
            <span className="notifications-badge">{data.unread} unread</span>
          )}
        </div>
        {data.unread > 0 && (
          <button
            className="btn-mark-all"
            onClick={handleMarkAll}
            disabled={marking}
          >
            {marking ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {loading && <p className="notifications-status">Loading…</p>}
      {error && <p className="notifications-error">{error}</p>}

      {!loading && !error && data.items.length === 0 && (
        <div className="notifications-empty">
          <span className="notifications-empty-icon">🔔</span>
          <p>You have no notifications yet.</p>
        </div>
      )}

      <ul className="notifications-list">
        {data.items.map((n) => (
          <li
            key={n.notification_id}
            className={`notification-item${n.is_read ? " read" : " unread"}`}
            onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
          >
            <div className="notification-top">
              <span className={`notif-category notif-cat-${n.category}`}>
                {categoryBadge(n.category)}
              </span>
              <span className="notif-time">{formatDate(n.created_at)}</span>
              {!n.is_read && <span className="notif-dot" aria-label="Unread" />}
            </div>
            <p className="notif-title">{n.title}</p>
            <p className="notif-body">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
