# Parolo - Discord Bot

## Overview
A Discord bot that sends a daily word in Italian (or any language) to configured channels across multiple servers.

## Features
- Daily word — sends a random translated word every day at a scheduled time
- Reveal interaction — users react to reveal the translation
- Per-server config — each server sets its own channel via `/config-daily-word`

## Project Architecture
- **Language**: Node.js 20
- **Framework**: discord.js v14
- **Entry point**: `src/index.js`
- **Commands**: `src/commands/` (slash commands)
- **Data**: `src/data/` (JSON config files)
- **Utilities**: `src/other/` (scheduled tasks)

## Environment Variables
- `TOKEN` — Discord bot token (secret)
- `CLIENT_ID` — Discord application/client ID (secret)

## Running
- Workflow "Discord Bot" runs `node src/index.js`
- To register slash commands: `node src/deploy-commands.js`
