import { useEffect, useState, useRef } from "react";
import "./App.css";

const SHEET_ID = "1_ORYmMRQkNPiFEWZRnII9ob3-0poadLy_83OBSw0U1Q";
const API_KEY = "AIzaSyDdUVN3znMFnQ9LPvRfq42pwny7RZ9xBDI";
const RANGE = "Sheet1!A:C"; // A = event, B = time, C = image base name

interface EventItem {
  time: string;   // "13:30"
  image: string;  // from col C
}

export default function EventDisplay() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [display, setDisplay] = useState<{ sub: string; bg: string } | null>(
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
          ([, time, image]: [string, string, string]) => ({
            time: time || "",
            image: (image || "schedule") + ".jpg",
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
        setDisplay({ sub: "", bg: "schedule.jpg" });
        return;
      }

      const diff = (active.date.getTime() - now.getTime()) / 1000;
      if (diff > 0) {
        const mins = Math.floor(diff / 60);
        const secs = Math.floor(diff % 60);
        setDisplay({
          sub: `Starts in ${mins}:${secs.toString().padStart(2, "0")}`,
          bg: active.image,
        });
      } else {
        const past = -diff;
        if (past <= 180) {
          setDisplay({ sub: "Starting Now", bg: active.image });
        } else if (past <= 600) {
          setDisplay({ sub: "In Progress", bg: active.image });
        } else {
          setDisplay({ sub: "", bg: "schedule.jpg" });
        }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [events]);

  // Render
  return (
    <div
      className="event"
      style={{
        backgroundImage: `url(${display?.bg || "schedule.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {display?.sub && (
        <p className="event-sub">{display.sub}</p>
      )}
    </div>
  );
}
