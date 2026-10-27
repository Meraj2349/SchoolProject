import bcrypt from "bcryptjs";
import { postgresBranchRepository } from "../branch/infrastructure/postgres-branch.repository.js";
import { makeAdminUseCases } from "./application/admin.usecases.js";
import { postgresAdminRepository } from "./infrastructure/postgres-admin.repository.js";
import { makeAdminController } from "./interface/admin.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const useCases = makeAdminUseCases({
  adminRepository: postgresAdminRepository,
  branchRepository: postgresBranchRepository,
  passwordHasher: { hash: (plain) => bcrypt.hash(plain, 10) },
});

export const adminController = makeAdminController({ useCases });

// The admin as stored now, for the auth middleware.
export const currentAdmin = (id) => useCases.currentAdmin(id);
