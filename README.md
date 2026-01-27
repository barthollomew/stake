# Stake Frontend Build

Angular 20 and Ionic 8. RxJS for state.

## Run locally
```bash
npm install
npm start
```

## Components

Split into smart and dumb. Pages handle data, UI components just use inputs/outputs.

- `StockCardComponent` - stock info, small or large
- `InstrumentRowComponent` - ticker row with price
- `SwipeButtonComponent` - the drag gesture
- `OrderSheetComponent` - buy modal
- `ToastComponent` - success messages

## Data

App expects multiple endpoints not one big payload.

### User profile
```json
{
  "id": "user-1",
  "name": "Nathan",
  "totalEquity": 7425.19
}
```

### Holdings
```json
{
  "items": [
    {
      "id": "holding-tsla",
      "symbol": "TSLA",
      "name": "Tesla Inc",
      "shares": 3.25,
      "price": 58.91,
      "changePercent": 2.75
    }
  ]
}
```

### Market data
```json
{
  "trending": [
    {
      "id": "stock-fig",
      "symbol": "FIG",
      "name": "Figma",
      "price": 58.49,
      "logoUrl": "assets/logos/fig.svg",
      "typeLabel": "Stock"
    }
  ]
}
```

### How it flows

PortfolioStore calls endpoints on init with forkJoin. Holds combined state and exposes observables like holdings$, trending$, totalEquity$.

Pages subscribe with async pipe. When user buys, store updates holdings and recalcs equity.

## Main files

### Pages
- `invest.page` - equity, holdings, trending
- `discover.page` - search bar, recent, top volume
- `search.page` - results
- `tabs.page` - navigation

### Components
- `order-sheet.component` - buy modal
- `stock-card.component` - stock with logo
- `instrument-row.component` - ticker and price
- `swipe-button.component` - drag to buy
- `toast.component` - success msg
- `status-bar.component` - top bar
- `section-header.component` - titles

### Data
- `portfolio.store.ts` - state
- `mock-api.service.ts` - fake api
- `mock-data.ts` - sample data
- `models.ts` - types

### Styling
- `global.scss` - layout, ionic overrides
- `variables.scss` - colors, spacing

## Would do with more time

Spent most time on swipe gesture and modal positioning. Would add:
- Form validation on order inputs
- More stock data and working search
- Tests for store and swipe component
- Loading states and error handling
