# ConnectTheDots 🕸️  
**Bogaziçi University – SWE 573 Software Development Practice, Spring 2025**

ConnectTheDots creates colaboratory spaces such as **interactive knowledge graph** so users can explore concepts, people and their relationships visually. 
The stack is split into a Django + PostgreSQL REST API and a React front-end rendered with React Flow & Material UI— all launched with a single Docker Compose command.

> **Live demo:** http://52.202.203.12:3000/  
> *(Demo account → username: `usertest`  password: `Usertest123.`)*

---

## Why do we think it is a useful project?  
* Enriches free-form data with **Wikidata** look-ups in real time.  
* Encourages “graph thinking” via drag-and-drop editing and rich node panels.  
* A full micro-frontend + API reference project (CI → Docker → AWS EC2).

---

## High-Level Technical Architecture  

* **Frontend** — Node 23-alpine → production build → Nginx static hosting  
* **Backend**  — Python 3.13-slim & Gunicorn / Django 4.2 → JSON API  
* **Database** — PostgreSQL 15-alpine (volume-backed)  
* All services start together with `docker compose`.

---

## Quick Start
Please note that config.js must be overwritten and .env must be created accordingly.

| Step | What to Do |
|------|------------|
| 1 | Review the [Use-Case Scenarios](https://github.com/comertbatuhan/573/wiki/Comprehensive-Use-Case). |
| 2 | Browse the [UI mock-ups](https://github.com/comertbatuhan/573/wiki/mockups). |
| 3 | Browse the [Sequence Diagram](https://github.com/comertbatuhan/573/wiki/Sequence_Diagram) |
| 4 | Browse the [Wiki Page](https://github.com/comertbatuhan/573/wiki) for more!|
| 5 | (Optional) Run locally with `npm start` + `python manage.py runserver`. |
| 6 | Build & start with Docker (`docker compose up --build -d`). |
| 7 | Deploy to AWS EC2. |

References
- https://learndjango.com/ – Django tutorials
- https://reactflow.dev/ – Graph rendering
- https://www.wikidata.org/wiki/Wikidata:Main_Page – Public entity database
- https://git-scm.com/ – Version control basics
