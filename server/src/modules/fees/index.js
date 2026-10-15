import { makeFeeBillingUseCases } from "./application/feeBilling.usecases.js";
import { makeFeeSetupUseCases } from "./application/feeSetup.usecases.js";
import { mysqlFeeRepository } from "./infrastructure/mysql-fee.repository.js";
import { makeFeeController } from "./interface/fee.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const SCHOOL_TIME_ZONE = process.env.SCHOOL_TIME_ZONE || "Asia/Dhaka";

// "YYYY-MM-DD" in the school's time zone, so due dates flip at local midnight.
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: SCHOOL_TIME_ZONE }).format(new Date());

export const feeController = makeFeeController({
  setup: makeFeeSetupUseCases({ feeRepository: mysqlFeeRepository }),
  billing: makeFeeBillingUseCases({ feeRepository: mysqlFeeRepository, today }),
});
