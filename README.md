# PUBGM HUD

<div align="center">

<img src="./assets/logo.png" alt="PUBG Mobile HUD" width="150" style="margin-bottom: 16px;" />

</div>

PUBG Mobile HUD is a tool that allows you to have Scoring Table and Team Eliminations for your PUBG Mobile Esports event livestreams.

## Features

- Scoring Table
- Team Eliminations
- [Lottie](https://github.com/airbnb/lottie-web) animation files support with [PUBGMHUD Sync](https://github.com/TheSkieNex/pubgmhud-sync) (will be built in the admin panel in the future)
- Custom Endpoints

## Demo

You can view one of the tournament livestreams that we used this HUD in [here](https://www.youtube.com/watch?v=hWk8kSeInWQ).

## Installation

1. Clone the repository
2. Run `npm install`
3. Run `cd frontend && npm install`

## Usage

### API
```bash
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

Then you can use [External API](https://github.com/TheSkieNex/pubgmhud-external-api) to send the data to the HUD.

## Custom Endpoints

Current version of the HUD has no custom endpoints, but you can add your own, you can check the `prod-example` branch and see how we used it in production.

## Hosting

You can host the HUD on your own domain. You will need to set environment variables in the `.env` file in both this base directory and `frontend` directory, based on the `.env.example` files. Then you will need to install Docker if not already installed (You can use `scripts/install-docker.sh` to install it on Ubuntu). Then you can run `docker compose up -d` to start the services.

## License

For the license, see the [LICENSE](LICENSE) file.