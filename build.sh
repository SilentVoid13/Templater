#!/bin/bash

wasm-pack build --target web
cd www
pnpm build
cd ..
