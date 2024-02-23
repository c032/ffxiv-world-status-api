# `api.c032.dev`

## Features

### FFXIV

#### Prometheus

##### `GET /ffxiv/prometheus`

Returns information about FFXIV servers in Prometheus format.

> Note: Only one world is being returned currently, so it's not really
> that useful at this moment. I will remove this notice when I include
> more data in the response.

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
