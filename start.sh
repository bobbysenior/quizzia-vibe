#!/bin/bash
docker run -it \
  -v "$(pwd)":/app \
  -v mon_projet_modules:/app/node_modules \
  -w /app \
  node:lts bash
