import fs from "fs/promises";
import { cloudinaryImageStorage } from "../../shared/infrastructure/cloudinaryImageStorage.js";
import { makeGalleryUseCases } from "./application/gallery.usecases.js";
import { mysqlGalleryRepository, mysqlPeople } from "./infrastructure/mysql-gallery.repository.js";
import { makeGalleryController } from "./interface/gallery.controller.js";

// Composition root for the gallery.
export const galleryController = makeGalleryController({
  useCases: makeGalleryUseCases({
    repository: mysqlGalleryRepository,
    imageStorage: cloudinaryImageStorage,
    people: mysqlPeople,
  }),
  removeFile: (path) => fs.unlink(path),
});
