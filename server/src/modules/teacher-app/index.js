import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { attendance } from "../attendance/index.js";
import { makeTeacherAccessUseCases } from "./application/teacherAccess.usecases.js";
import { makeTeacherAppUseCases } from "./application/teacherApp.usecases.js";
import { postgresTeacherAccountRepository } from "./infrastructure/postgres-teacherAccount.repository.js";
import { makeTeacherAccessController, makeTeacherAppController } from "./interface/teacherApp.controller.js";
import { makeTeacherAuth } from "./interface/teacherAuth.js";

// Composition root for the teacher app: class teachers take attendance on
// their phones; admins switch each teacher's access on.

// A phone may be offline for days, so the token lasts long. It is revoked by
// bumping the teacher's TokenVersion (access off, a new password).
const TEACHER_TOKEN_EXPIRY = "30d";

// Compared against when the number is unknown, so a wrong number takes as long as a wrong password.
const UNKNOWN_ACCOUNT_HASH = bcrypt.hashSync("no-such-account", 10);

const passwordHasher = {
  hash: (plain) => bcrypt.hash(plain, 10),
  compare: (plain, hash) => bcrypt.compare(plain, hash ?? UNKNOWN_ACCOUNT_HASH).then((same) => same && hash != null),
};

const issueTeacherToken = ({ teacherId, branchId, tokenVersion }) =>
  jwt.sign({ teacherId, branch_id: branchId, tokenVersion, userType: "teacher" }, process.env.JWT_SECRET_KEY, {
    expiresIn: TEACHER_TOKEN_EXPIRY,
  });

const teacherApp = makeTeacherAppUseCases({
  repository: postgresTeacherAccountRepository,
  attendance,
  passwordHasher,
  issueToken: issueTeacherToken,
  clock: { now: () => new Date() },
});

export const teacherAuth = makeTeacherAuth({ authenticate: teacherApp.authenticate });

export const teacherAppController = makeTeacherAppController({ useCases: teacherApp });

export const teacherAccessController = makeTeacherAccessController({
  useCases: makeTeacherAccessUseCases({ repository: postgresTeacherAccountRepository, passwordHasher }),
});
