import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'invest',
        loadComponent: () =>
          import('./pages/invest/invest.page').then((m) => m.InvestPage),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('./pages/discover/discover.page').then((m) => m.DiscoverPage),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: '',
        redirectTo: 'invest',
        pathMatch: 'full',
      },
    ],
  },
];
