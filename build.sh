#!/bin/bash

pkg index.js --out-path ./build --debug 

mkdir ../Website/public/downloads
mkdir ../Website/public/downloads/daemon
rm ../Website/public/downloads/daemon/*
cp build/index-linux ../Website/public/downloads/daemon/servitor-linux
cp build/index-macos ../Website/public/downloads/daemon/servitor-macos
cp build/index-win.exe ../Website/public/downloads/daemon/servitor-windows.exe
