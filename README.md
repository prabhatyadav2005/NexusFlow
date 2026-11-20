# ⚡ NexusFlow — Visual IoT Telemetry & Rule Engine

NexusFlow is a real-time, no-code IoT telemetry and dynamic rule engine built on the MERN stack[cite: 1, 5]. Instead of hardcoding alert thresholds or data filters on the backend, operators visually wire together sensor data sources, mathematical filters, and alert triggers on an interactive drag-and-drop canvas[cite: 1, 2]. The backend dynamically compiles the visual graph into live **RxJS Observable streams** that evaluate high-frequency telemetry stored in **MongoDB Time-Series collections** in real time[cite: 1, 2].

---

## 🚀 Key Features

- **No-Code Visual Graph Builder (React & React Flow):** Drag-and-drop node canvas allowing operators to build logic trees (`Data Sources` $\rightarrow$ `Math/Condition Filters` $\rightarrow$ `Action Triggers`) and serialize graphs into clean JSON[cite: 1, 2].
- **Dynamic RxJS Stream Compiler (Node.js & RxJS):** Translates frontend JSON graphs into concurrent, in-memory reactive data pipelines without server restarts[cite: 1, 2].
- **High-Throughput Time-Series Storage (MongoDB 5.0+):** Utilizes native MongoDB Time-Series collections optimized for high-velocity, append-only hardware sensor ingestion (5,000+ writes/sec)[cite: 1, 2].
- **Live Telemetry & Glowing Wire Feedback (Socket.io & Recharts):** Streams live sensor metrics to real-time dashboards and illuminates connection wires on the canvas whenever data flows through active rules[cite: 2].
- **Outbound Webhooks & Alerting:** Triggers external webhooks or mock SMS notifications instantaneously when anomaly thresholds evaluate to true[cite: 1, 2].

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, React Flow, Socket.io-client, Recharts / Chart.js, Tailwind CSS, Lucide Icons[cite: 1, 2] |
| **Backend** | Node.js, Express.js, RxJS (Reactive Extensions), Socket.io[cite: 1, 2] |
| **Database** | MongoDB 5.0+ (Native Time-Series Collections) |

---

## 🏗️ System Architecture

```text
[IoT Hardware / Simulator]
        │  (High-Frequency HTTP / WebSocket Telemetry)
        ▼
[Express Ingestion API] ──────► [MongoDB Time-Series Collection]
        │
        │  (In-Memory Telemetry Bus)
        ▼
[RxJS Stream Compiler Engine] ◄── (JSON Graph from React Flow UI)
        │
        ├──► [Outbound Webhooks / Mock SMS Alerts]
        └──► [Socket.io Live Stream] ──► [React Dashboard & Glowing Canvas Wires]
