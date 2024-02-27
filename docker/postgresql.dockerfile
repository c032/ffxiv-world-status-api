FROM postgres:16.1-alpine3.19

COPY ../migrations/*.sql /docker-entrypoint-initdb.d/
COPY ../docker/migrations/*.sql /docker-entrypoint-initdb.d/
