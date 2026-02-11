import { Routes } from '@angular/router';
import { TestResultPageComponent } from './pages/test-result/test-result.page';
import { TestRunnerPageComponent } from './pages/test-runner/test-runner.page';
import { TestsListPageComponent } from './pages/tests-list/tests-list.page';

export const TESTS_ROUTES: Routes = [
  {
    path: '',
    component: TestsListPageComponent,
  },
  {
    path: ':testId/start',
    component: TestRunnerPageComponent,
  },
  {
    path: ':testId/result',
    component: TestResultPageComponent,
  },
];
