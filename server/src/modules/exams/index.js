import { schoolToday } from "../../shared/schoolDate.js";
import { makeExamUseCases } from "./application/exam.usecases.js";
import { postgresExamRepository } from "./infrastructure/postgres-exam.repository.js";
import { makeExamController } from "./interface/exam.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const useCases = makeExamUseCases({ examRepository: postgresExamRepository, today: () => schoolToday() });

export const examController = makeExamController({ useCases });
