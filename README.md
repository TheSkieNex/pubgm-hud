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

## Installation

1. Clone the repository
2. Run `npm install`
3. Run `cd frontend && npm install`

## Usage

### API
```bash
npm run start
```

### Frontend
```bash
cd frontend
npm run dev
```

Then you can use [External API](https://github.com/TheSkieNex/pubgmhud-external-api) to send the data to the HUD.

## Custom Endpoints

Current version of the HUD has no custom endpoints, but you can add your own by adding a new endpoint to the `src/routers/custom.ts` file. For the example you can check the `prod-example` branch and see how we used it in production.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.