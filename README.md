# `website-api`

## Features

### FFXIV

#### Prometheus

##### `GET /ffxiv/metrics`

Returns information about FFXIV servers in Prometheus format.

#### JSON

##### `GET /ffxiv/worlds`

Returns information about all known FFXIV worlds.

##### `GET /ffxiv/worlds/:groupname`

Returns information about all FFXIV worlds belonging to a specific group
(datacenter).

##### `GET /ffxiv/worlds/:groupname/:worldname`

Returns information about a specific FFXIV world.

## Assumptions

### FFXIV

The FFXIV data is not real-time; it is updated periodically by a
background job.

## Development

### Start server

```sh
docker compose up --abort-on-container-exit --build
```

### Request

```sh
curl 'http://localhost:3000/ffxiv/worlds'
```

## Testing

### Unit tests

```sh
npm run test
```

### E2E tests

`docker compose` is required.

```sh
npm run test:e2e
```

## License

MPL 2.0.
