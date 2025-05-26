#!/bin/bash
set -e

host="$1"
user="$2"
password="$3"
database="$4"

until mysql -h "$host" -u "$user" -p"$password" -e "USE $database;" 2>/dev/null; do
  echo "Aguardando o banco $database ficar pronto..."
  sleep 2
done

exec "${@:5}"