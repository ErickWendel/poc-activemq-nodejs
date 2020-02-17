# Proof of Concept - ActiveMQ

This project is something to show how ActiveMQ would work with Node.js. 

There are two files:
- `sender` who sends 1000 messages per second to an Queue
- `receiver` who receive each individual message.


## Running
- Run `docker-compose up --build` and it'll install and configure the apps.

## Accessing ActiveMQ Dashboard

- Accessing `http://localhost:8161/admin/` you'd find the dashboard. After clicking in this link, use the default user `activemq` and default password `activemq`.