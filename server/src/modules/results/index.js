import { makeResultUseCases } from "./application/result.usecases.js";
import { postgresResultRepository } from "./infrastructure/postgres-result.repository.js";
import { makeResultController } from "./interface/result.controller.js";

// Composition root: the only place that knows which concrete adapters are used.
const useCases = makeResultUseCases({ resultRepository: postgresResultRepository });

export const resultController = makeResultController({ useCases });
