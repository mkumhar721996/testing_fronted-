---
id: ADR-0001
category: component
title: Web App
status: accepted
superseded_by: null
component_id: comp_web_app
responsibility: Browser-based web application that users interact with; framework
  not yet chosen.
kind: web_ui
split_reason: A web UI is its own runtime and client, separate from any server-side
  code.
talks_to:
- component_id: comp_backend_api
  interaction: sync
  evidence: one backend API
- component_id: comp_identity_provider
  interaction: sync
  evidence: Sign-in only, with a managed identity provider
rule: All user-facing browser UI lives in the Web App component and is not mixed into
  server-side code.
evidence:
- type: human
  ref: want to create Web application
basis: stated
---

## Context

The draft recorded none for this component.

## Decision

**Rule.** All user-facing browser UI lives in the Web App component and is not mixed into server-side code.

Browser-based web application that users interact with; framework not yet chosen.

Kept separate because A web UI is its own runtime and client, separate from any server-side code..

## Talks to

- **Backend API** (sync) — one backend API
- **Identity Provider** (sync) — Sign-in only, with a managed identity provider

## Alternatives considered

The draft recorded none for this component.

## Consequences

The draft recorded none for this component.

## Evidence

Basis: stated.
- human: want to create Web application
