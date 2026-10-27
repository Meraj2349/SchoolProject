import { schoolToday } from "../../shared/schoolDate.js";
import { feeBilling } from "../fees/index.js";
import { makeDashboardUseCases } from "./application/dashboard.usecases.js";
import { postgresDashboardRepository } from "./infrastructure/postgres-dashboard.repository.js";
import { makeDashboardController } from "./interface/dashboard.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
export const dashboardController = makeDashboardController({
  useCases: makeDashboardUseCases({
    dashboardRepository: postgresDashboardRepository,
    feeSummary: (args) => feeBilling.monthlySummary(args),
    today: schoolToday,
  }),
});
