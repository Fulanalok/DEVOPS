#!/bin/bash

echo "Gerando .env com UID e GID do usuário atual..."

echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env

echo "Arquivo .env criado com sucesso:"
cat .env

echo "Iniciando os containers com docker-compose..."
docker-compose up --build
