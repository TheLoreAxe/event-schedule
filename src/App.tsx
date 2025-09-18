import { useEffect, useState, useRef } from "react";
import "./App.css";

const SHEET_ID = "1_ORYmMRQkNPiFEWZRnII9ob3-0poadLy_83OBSw0U1Q";
const API_KEY = "AIzaSyDdUVN3znMFnQ9LPvRfq42pwny7RZ9xBDI";
const RANGE = "Sheet1!A:B"; // event in A, time in B

interface EventItem {
  name: string;
  time: string; // "13:30"
}

export default function EventDisplay() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [display, setDisplay] = useState<{ text: string; sub: string } | null>(
    null
  );
  const latestRequestId = useRef(0);

  // Fetch events from Google Sheets
  useEffect(() => {
    const fetchEvents = async () => {
      const requestId = ++latestRequestId.current;
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const json = await res.json();
        if (requestId !== latestRequestId.current) return;
        if (!json.values) return;

        const rows = json.values.slice(1);
        const processed: EventItem[] = rows.map(
          ([name, time]: [string, string]) => ({
            name: name || "",
            time: time || "",
          })
        );
        setEvents(processed);
      } catch (err) {
        console.warn("Failed to fetch events", err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const active = events
        .map((e) => {
          const [h, m] = e.time.split(":").map(Number);
          const dt = new Date();
          dt.setHours(h, m, 0, 0);
          return { ...e, date: dt };
        })
        .find((e) => {
          const diff = (e.date.getTime() - now.getTime()) / 1000;
          return diff <= 600 && diff >= -600;
        });

      if (!active) {
        setDisplay(null);
        return;
      }

      const diff = (active.date.getTime() - now.getTime()) / 1000;
      if (diff > 0) {
        const mins = Math.floor(diff / 60);
        const secs = Math.floor(diff % 60);
        setDisplay({
          text: active.name,
          sub: `Starts in ${mins}:${secs.toString().padStart(2, "0")}`,
        });
      } else {
        const past = -diff;
        if (past <= 180) {
          setDisplay({ text: active.name, sub: "Starting Now" });
        } else if (past <= 600) {
          setDisplay({ text: active.name, sub: "In Progress" });
        } else {
          setDisplay(null);
        }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [events]);

  // Render
  if (!display) {
    return <div className="background full-schedule"></div>;
  }

  return (
    <div className="background empty-schedule">
      <div className="event-info">
        <h1 className="event-title">{display.text}</h1>
        <p className="event-sub">{display.sub}</p>
      </div>
    </div>
  );
}
