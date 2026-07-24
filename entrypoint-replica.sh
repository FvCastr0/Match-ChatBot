#!/bin/bash
set -e

# Aguarda ate o container Master estar pronto e acessivel
until PGPASSWORD=replica_password psql -h postgres-chatbot-primary -U replicator -d chatbot -c '\q'; do
  echo "Aguardando o Postgres Primary (Master) inicializar..."
  sleep 2
done

# Se a pasta de dados estiver vazia (primeira execucao), realiza o pg_basebackup
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Iniciando copia de backup base a partir do Primary..."
    rm -rf "$PGDATA"/*
    PGPASSWORD=replica_password pg_basebackup -h postgres-chatbot-primary -D "$PGDATA" -U replicator -v -P -R
    echo "Copia concluida com sucesso!"
fi

exec docker-entrypoint.sh "$@"
