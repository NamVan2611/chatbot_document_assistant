#!/bin/bash
# Script to install dependencies with Python 3.13 compatibility fixes

echo "Updating pip, setuptools, and wheel..."
python -m pip install --upgrade pip setuptools wheel

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Installation complete!"


