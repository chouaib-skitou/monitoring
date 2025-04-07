# 🧠 Node.js Monitoring & Logging Stack (Prometheus + Grafana + ELK)

This project provides a complete observability stack for a Node.js app using:

- 📊 **Prometheus + Grafana** for metrics monitoring
- 📆 **Filebeat + Logstash + Elasticsearch + Kibana (ELK)** for structured JSON log ingestion and visualization

---

## 📁 Project Structure

```
monitoring/
├── analytics-app/         # Node.js app with Prometheus metrics and JSON logs
├── logs/                  # Folder to store app logs (mounted)
├── filebeat/              # Filebeat config
│   └── filebeat.yml
├── logstash/              # Logstash config
│   └── logstash.conf
├── prometheus/            # Prometheus config
│   └── prometheus.yml
├── docker-compose.yml     # Full stack setup
└── README.md              # You're here
```

---

## 🚀 How to Run

### 1. Clone the repo

```bash
git clone https://github.com/chouaib-skitou/monitoring-stack.git
cd monitoring-stack
```

### 2. Build and start all services

```bash
docker-compose down -v
docker-compose up --build
```

---

## 🌐 Services & URLs

| Service         | URL                              |
|----------------|----------------------------------|
| Node.js App     | http://localhost:3000            |
| Prometheus      | http://localhost:9090            |
| Grafana         | http://localhost:3001            |
| Kibana          | http://localhost:5601            |
| Elasticsearch   | http://localhost:9200            |
| Metrics Endpoint| http://localhost:3000/metrics    |

---

## 📊 Monitoring Setup (Prometheus + Grafana)

- Metrics are exposed at `/metrics` using `prom-client`
- Prometheus scrapes these metrics
- Grafana connects to Prometheus for dashboarding

---

## 📆 Logging Setup (Filebeat + Logstash + Elasticsearch + Kibana)

- The Node.js app logs structured JSON to `logs/app.log`
- Filebeat reads logs and forwards to Logstash
- Logstash parses JSON and sends it to Elasticsearch
- Kibana allows querying and visualizing the logs

---

## 🧪 Verify It Works

- Visit the app: [http://localhost:3000](http://localhost:3000)
- Check metrics in Prometheus: [http://localhost:9090](http://localhost:9090)
- View dashboards in Grafana: [http://localhost:3001](http://localhost:3001)
- See logs in Kibana: [http://localhost:5601](http://localhost:5601)

Create a data view `docker-logs-*` with `@timestamp` field in Kibana to view logs.

---


