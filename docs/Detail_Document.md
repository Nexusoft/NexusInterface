# Detail Document: Core Binary and Electron IPC Hardening

## Purpose

This document records the detail-level scope for the branch after updating from the recent `Merging` branch PR merges:

- PR #15: analysis and implementation plan for repository issues
- PR #16: Core binary validation and process detection fixes
- PR #17: incremental Electron window IPC hardening

The remaining branch work focuses on preserving those merged changes while tightening validation around Core binary configuration, process lookup, privileged IPC handlers, and the Core settings UI.

## Current Problem Areas

### Core binary configuration

The wallet can use either the bundled Nexus Core binary or an override supplied by `NEXUS_CORE_BINARY_PATH`, `NEXUS_CORE_BINARY`, or the Core settings screen. The unsafe cases are malformed paths, relative paths, directories, non-executable POSIX files, and non-`.exe` Windows targets.

The branch normalizes configured paths, handles matching shell quotes and `~` home-directory prefixes, requires absolute paths, and returns structured Core binary status data for UI and startup error messages.

### Core process detection

Core shutdown and running-state detection must identify the intended Nexus Core process without matching unrelated processes by substring. The branch parses process-list output, ignores PID 1, parses Windows CSV task output, and compares commands against the configured binary path and binary name.

### Privileged Electron IPC

Renderer-accessible IPC calls must not forward arbitrary object shapes, paths, menu templates, or protocol values directly into main-process Electron APIs. The branch adds type and allowlist checks for dialog options, app path names, menu roles, virtual keyboard options, Core parameters, updater booleans, file server inputs, context menu webContents ownership, and proxy request URLs.

### Core binary settings UI

The Core settings screen needs an explicit way to choose an external Core binary without forcing users to type paths manually. The branch keeps the Core Binary Path field and adds a Browse button that writes the selected file path into the existing settings form field.

## Implementation Summary

- `src/main/core.js`
  - Adds Core binary path normalization and structured binary status reporting.
  - Validates file existence, absolute paths, file-vs-directory state, POSIX execute permission, and Windows executable extension.
  - Improves running-process lookup for Windows, macOS, and Linux.
  - Makes Core shutdown a no-op when no Core PID is found.

- `src/main/main.js`
  - Adds explicit sanitizers for renderer IPC inputs.
  - Restricts dialog, app path, menu, updater, file-server, Core, keyboard, webContents, and proxy request inputs before they reach privileged APIs.

- `src/App/Settings/Core/EmbeddedCoreSettings.tsx`
  - Adds a Browse button for `embeddedCoreBinaryPath`.
  - Updates the active form field directly when a Core binary is selected.

- `package.json` and `package-lock.json`
  - Keep the runtime requirement aligned with Node `>=22.12.0` and npm `>=10.9.0`.

- `README.md`
  - Keeps setup instructions aligned with the current Node, npm, and Electron requirements.

## Validation Expectations

- Install dependencies with `npm install`.
- Build production bundles with `npm run build`.
- Confirm the build includes the main, renderer, module preload, and window preload bundles.
- Treat existing dependency audit findings as pre-existing unless a dependency is added or updated.

## Review Notes

- The branch intentionally keeps a single PR scope because the merged base changes and the follow-up hardening overlap in Core startup, Core settings, and Electron IPC.
- No new runtime dependencies are required.
- The highest-risk areas for review are Core process matching edge cases and Electron IPC input compatibility with existing renderer callers.
