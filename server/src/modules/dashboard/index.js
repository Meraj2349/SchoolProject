import { feeBilling, schoolToday } from "../fees/index.js";
import { makeDashboardUseCases } from "./application/dashboard.usecases.js";
import { mysqlDashboardRepository } from "./infrastructure/mysql-dashboard.repository.js";
import { makeDashboardController } from "./interface/dashboard.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
export const dashboardController = makeDashboardController({
  useCases: makeDashboardUseCases({
    dashboardRepository: mysqlDashboardRepository,
    feeSummary: (args) => feeBilling.monthlySummary(args),
    today: schoolToday,
  }),
});
