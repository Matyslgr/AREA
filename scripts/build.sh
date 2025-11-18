#!/bin/bash

# This file is responsible for building the project. It is used in the CI pipeline.
# Replace the example build commands with the commands required for your project.

echo "⚠️ build.sh is not yet configured. Add build logic here."
exit 0



# =========================
# EXAMPLES OF BUILD METHODS
# =========================

# --- CMake (C/C++) ---
# Generate build files in 'build/' folder
# cmake -S . -B build
# Compile all targets using all CPU cores
# cmake --build build -j$(nproc)

# --- Makefile (C/C++) ---
# Compile using a Makefile in the project root
# make
# Compile a specific target
# make my_program
# Clean build
# make clean

# --- Python ---
# Install dependencies in a virtual environment
# python3 -m venv venv
# source venv/bin/activate
# pip install --upgrade pip
# pip install -r requirements.txt

# --- Haskell ---
# Compile using Stack
# stack setup
# stack build
# stack test
