FROM postgres:16.3-alpine3.20

COPY ../migrations/*.sql /docker-entrypoint-initdb.d/
COPY ../docker/migrations/*.sql /docker-entrypoint-initdb.d/
