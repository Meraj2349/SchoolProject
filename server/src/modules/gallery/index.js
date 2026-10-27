import fs from "fs/promises";
import { cloudinaryImageStorage } from "../../shared/infrastructure/cloudinaryImageStorage.js";
import { makeGalleryUseCases } from "./application/gallery.usecases.js";
import { postgresGalleryRepository, postgresPeople } from "./infrastructure/postgres-gallery.repository.js";
import { makeGalleryController } from "./interface/gallery.controller.js";

// Composition root for the gallery.
export const galleryController = makeGalleryController({
  useCases: makeGalleryUseCases({
    repository: postgresGalleryRepository,
    imageStorage: cloudinaryImageStorage,
    people: postgresPeople,
  }),
  removeFile: (path) => fs.unlink(path),
});
