import fs from "fs/promises";
import { cloudinaryImageStorage } from "../../shared/infrastructure/cloudinaryImageStorage.js";
import { schoolToday } from "../../shared/schoolDate.js";
import { feeBilling } from "../fees/index.js";
import { makeBranchUseCases } from "./application/branch.usecases.js";
import { mysqlBranchRepository } from "./infrastructure/mysql-branch.repository.js";
import { makeBranchController } from "./interface/branch.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const useCases = makeBranchUseCases({
  branchRepository: mysqlBranchRepository,
  imageStorage: cloudinaryImageStorage,
  feeSummary: (args) => feeBilling.monthlySummary(args),
  today: schoolToday,
});

export const branchController = makeBranchController({
  useCases,
  removeFile: (path) => fs.unlink(path),
});
