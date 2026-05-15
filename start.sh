#!/bin/bash
docker run -it \
  --user $(id -u):$(id -g) \
  -v "$(pwd)":/app \
  -v mon_projet_modules:/app/node_modules \
  -v mon_projet_globals:/usr/local/lib/node_modules \
  -w /app \
  node:lts bash
