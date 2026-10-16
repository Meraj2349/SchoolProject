import path from "path";
import { fileURLToPath } from "url";
import { makeJobApplicationUseCases } from "./application/jobApplications.usecases.js";
import { makeCvStore } from "./infrastructure/cvStore.js";
import { mysqlJobApplicationRepository } from "./infrastructure/mysql-jobApplication.repository.js";
import { publishedCirculars } from "./infrastructure/publishedCirculars.js";
import { makeJobApplicationController } from "./interface/jobApplication.controller.js";

// Composition root for online job applications.

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Applicants' CVs: outside public/, so never reachable as /uploads/... */
export const JOB_APPLICATION_CV_ROOT = path.join(SERVER_DIR, "private_uploads", "job-applications");
export const jobApplicationCvs = makeCvStore({ root: JOB_APPLICATION_CV_ROOT });

export const jobApplicationController = makeJobApplicationController({
  useCases: makeJobApplicationUseCases({ repository: mysqlJobApplicationRepository, circulars: publishedCirculars, cvs: jobApplicationCvs }),
});
