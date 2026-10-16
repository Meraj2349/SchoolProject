import { makeLocalFileUpload } from "./localFileUpload.js";

/** An image upload (jpg, png, gif or webp, up to 5 MB) kept in `dir`, served from public/uploads. */
export const makeLocalImageUpload = ({ dir, prefix }) => makeLocalFileUpload({ dir, prefix });
