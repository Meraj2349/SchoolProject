import { makeApplicationUseCases } from "./application/applications.usecases.js";
import { mysqlApplicationRepository } from "./infrastructure/mysql-application.repository.js";
import { studentEnrolment } from "./infrastructure/studentEnrolment.js";
import { makeApplicationController } from "./interface/application.controller.js";

// Composition root for admission applications.
export const applicationController = makeApplicationController({
  useCases: makeApplicationUseCases({ repository: mysqlApplicationRepository, enrolment: studentEnrolment }),
});
