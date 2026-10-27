import { makeApplicationUseCases } from "./application/applications.usecases.js";
import { postgresApplicationRepository } from "./infrastructure/postgres-application.repository.js";
import { studentEnrolment } from "./infrastructure/studentEnrolment.js";
import { makeApplicationController } from "./interface/application.controller.js";

// Composition root for admission applications.
export const applicationController = makeApplicationController({
  useCases: makeApplicationUseCases({ repository: postgresApplicationRepository, enrolment: studentEnrolment }),
});
