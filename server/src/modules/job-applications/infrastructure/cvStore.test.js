import { afterEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";
import { makeCvStore } from "./cvStore.js";

let root;
const store = () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "cv-store-"));
  return makeCvStore({ root });
};
const upload = (name = "cv-1-2.pdf") => {
  const tmp = path.join(root, "incoming", name);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, "%PDF");
  return { path: tmp, filename: name };
};
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe("cvStore", () => {
  it("files a CV under its circular and finds it again", async () => {
    const cvs = store();
    const name = await cvs.keep(upload(), 7);

    expect(name).toBe("cv-1-2.pdf");
    expect(fs.readFileSync(cvs.pathOf(7, name), "utf8")).toBe("%PDF");
    expect(fs.existsSync(path.join(root, "incoming", "cv-1-2.pdf"))).toBe(false);
  });

  it("never resolves a path outside the circular's folder", () => {
    const cvs = store();
    expect(cvs.pathOf(7, "../../etc/passwd")).toBeNull();
    expect(cvs.pathOf(7, "a/b.pdf")).toBeNull();
    expect(cvs.pathOf("../7", "cv.pdf")).toBeNull();
    expect(cvs.pathOf(7, null)).toBeNull();
  });

  it("removes one CV, a refused upload, or a whole circular's CVs", async () => {
    const cvs = store();
    const a = await cvs.keep(upload("a.pdf"), 7);
    await cvs.keep(upload("b.pdf"), 7);
    const refused = upload("c.pdf");

    await cvs.discard(7, a);
    await cvs.discardUpload(refused);
    expect(fs.existsSync(cvs.pathOf(7, a))).toBe(false);
    expect(fs.existsSync(refused.path)).toBe(false);

    await cvs.discardCircular(7);
    expect(fs.existsSync(path.join(root, "7"))).toBe(false);
    await expect(cvs.discardCircular(99)).resolves.toBeUndefined();
  });
});
