import path from "path";
import { fileURLToPath } from "url";
import { makeCvStore } from "./infrastructure/cvStore.js";

// Composition root for online job applications.

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Applicants' CVs: outside public/, so never reachable as /uploads/... */
export const JOB_APPLICATION_CV_ROOT = path.join(SERVER_DIR, "private_uploads", "job-applications");
export const jobApplicationCvs = makeCvStore({ root: JOB_APPLICATION_CV_ROOT });
