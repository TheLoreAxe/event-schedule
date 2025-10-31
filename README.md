# Tradeshow Event Schedule Display (Internal)

**Carolina One only** — A full-screen, vertical TV display showing today’s tradeshow schedule. Events are pulled live from our internal Google Sheet and update automatically.

---

## What It Shows

- **Default View**: Full-day schedule graphic with all events, times, and locations  
- **10 Minutes Before Any Event**: Switches to a **large countdown timer**  
- **Event Start**: Briefly displays **"Event Beginning Now"**  
- **5 Minutes In**: Updates to **"Event In Progress"**  
- **After**: Returns to the **main schedule view**

Runs 24/7 on dedicated hallway TVs in **portrait mode**.
![schedule (Large)](https://github.com/user-attachments/assets/da876dee-30eb-490f-ae3f-080660b988a3)



---

## Key Behaviors

- Auto-refreshes from the **internal event sheet** every 30 seconds  
- Handles multiple events per day with smooth transitions  
- Uses **local device time** — keep display clocks synced  
- No interaction needed — fully automated

---

## Display Notes

- **Orientation**: Portrait (1080x1920)  
- **Hardware**: Assigned mini PCs (kiosk mode, auto-launch)  
- **Network**: Connected to internal WiFi (sheet access via service account)  
- **Branding**: Uses official tradeshow graphics and colors

---
