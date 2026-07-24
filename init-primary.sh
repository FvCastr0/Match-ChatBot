#!/bin/bash
set -e

# Criar usuario de replicacao no Master
psql -v ON_ERROR_STOP=1 --username "$POSTGRESQL_USERNAME" --dbname "$POSTGRESQL_DATABASE" <<-EOSQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replica_password';
EOSQL

# Adicionar regra no pg_hba.conf para permitir conexoes de replicacao
echo "host replication replicator 0.0.0.0/0 md5" >> "$BITNAMI_ROOT_DIR/postgresql/conf/pg_hba.conf"
