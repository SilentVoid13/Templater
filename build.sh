#!/bin/bash

wasm-pack build --target web
cd www
pnpm install && pnpm build
cd ..
