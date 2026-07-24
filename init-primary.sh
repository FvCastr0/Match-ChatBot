#!/bin/sh
set -e

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Criar usuario de replicacao no Master usando o admin/superuser
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-'EOSQL'
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
      CREATE USER replicator WITH REPLICATION PASSWORD 'replica_password';
   END IF;
END
$$;
EOSQL

HBA_CONF="$PGDATA/pg_hba.conf"
RULE="host replication replicator 0.0.0.0/0 scram-sha-256"

if ! grep -q "$RULE" "$HBA_CONF"; then
    echo "$RULE" >> "$HBA_CONF"
fi
