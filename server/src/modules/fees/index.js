import { makeFeeBillingUseCases } from "./application/feeBilling.usecases.js";
import { makeFeeSetupUseCases } from "./application/feeSetup.usecases.js";
import { mysqlFeeRepository } from "./infrastructure/mysql-fee.repository.js";
import { makeFeeController } from "./interface/fee.controller.js";
import { schoolToday } from "../../shared/schoolDate.js";

// Composition root: the only place that knows which concrete adapters are used.
// "YYYY-MM-DD" in the school's time zone, so due dates flip at local midnight.
const today = () => schoolToday();

// Exported so other modules (the dashboard) reuse the same billing rules.
export const feeBilling = makeFeeBillingUseCases({ feeRepository: mysqlFeeRepository, today });

export const feeController = makeFeeController({
  setup: makeFeeSetupUseCases({ feeRepository: mysqlFeeRepository }),
  billing: feeBilling,
});
