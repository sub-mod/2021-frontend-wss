#!/usr/bin/env bash
printf "\n\n######## game-server build ########\n"

IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-quay.io/redhatdemo/2021-game-server:latest}

rm -rf node_modules/

s2i build -c . registry.access.redhat.com/ubi8/nodejs-14 ${IMAGE_REPOSITORY}
