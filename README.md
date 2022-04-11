# SolidGraph

SolidGraph lets you build applications with SolidJs and [Wundergraph](https://wundergraph.com/).

## What is Wundergraph ?

Wundergraph is the best Developer Experience to build Serverless APIs :

- Server-Side-Only Compile-Time GraphQL API Layer
- Auto-Generated TypeSafe Clients
- OpenID Connect-based Authentication with RBAC
- S3 integration for File Uploads

## Solidgraph compostion

The Solidgraph library is composed of two files:
[hooks.ts](https://github.com/verdavaine/solidgraph/blob/master/src/lib/hooks.ts) and [provider.tsx](https://github.com/verdavaine/solidgraph/blob/master/src/lib/provider.tsx)

## License

The Soligraph library is under [MIT](https://choosealicense.com/licenses/mit/) license.

# Realtime chat example

This example available [online](https://solidgraph.ovh/) demonstrates how SolidGraph lets you easily build a SolidJs application with Realtime subscription.

The code that might interest you the most can be found in [index.tsx](https://github.com/verdavaine/solidgraph/blob/master/src/pages/index.tsx)

## Features

Features:

- Authentication
- Authorization
- Realtime Updates
- Cross Tab Login/Logout
- typesafe generated Typescript Client

## Prerequisites

Make sure you have docker compose installed. Alternatively, you can use any PostgreSQL database available on localhost.

## Getting Started

Install the dependencies and run the example:

```bash
yarn global add @wundergraph/wunderctl@latest
yarn
yarn dev
```

## Cleanup

```bash
docker-compose rm -v -f
```

# Questions ?

Read the [SolidGraph Quickstart Guide](https://api.solidgraph.ovh/docs/)

Read the [Wundergraph Docs](https://wundergraph.com/docs).
