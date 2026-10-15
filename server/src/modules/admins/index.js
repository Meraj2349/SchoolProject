import bcrypt from "bcryptjs";
import { mysqlBranchRepository } from "../branch/infrastructure/mysql-branch.repository.js";
import { makeAdminUseCases } from "./application/admin.usecases.js";
import { mysqlAdminRepository } from "./infrastructure/mysql-admin.repository.js";
import { makeAdminController } from "./interface/admin.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const useCases = makeAdminUseCases({
  adminRepository: mysqlAdminRepository,
  branchRepository: mysqlBranchRepository,
  passwordHasher: { hash: (plain) => bcrypt.hash(plain, 10) },
});

export const adminController = makeAdminController({ useCases });
