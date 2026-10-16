// Pure rules for the Job circulars admin page: form values, validation and
// the request body. The server checks the same rules; these give instant feedback.

const POST_FIELDS = ["title_en", "title_bn", "vacancies", "qualification_en", "qualification_bn", "salary_min", "salary_max"];
const TEXT_FIELDS = ["title_en", "title_bn", "circular_date", "deadline", "how_to_apply_en", "how_to_apply_bn"];
export const MAX_POSTS = 20;

export const EMPTY_POST = { title_en: "", title_bn: "", vacancies: "1", qualification_en: "", qualification_bn: "", salary_min: "", salary_max: "" };

export const EMPTY_CIRCULAR = {
  title_en: "",
  title_bn: "",
  circular_date: new Date().toLocaleDateString("en-CA"),
  deadline: "",
  how_to_apply_en: "",
  how_to_apply_bn: "",
  posts: [EMPTY_POST],
  is_open: true,
  is_published: true,
};

const text = (value) => String(value ?? "").trim();
const number = (value) => (text(value) === "" ? null : Number(value));
const wholeAtLeast = (value, min) => Number.isInteger(number(value)) && number(value) >= min;

function postErrors(post, index) {
  const errors = {};
  const key = (field) => `posts.${index}.${field}`;
  for (const field of ["title_en", "title_bn"]) if (!text(post[field])) errors[key(field)] = "required";
  if (!wholeAtLeast(post.vacancies, 1)) errors[key("vacancies")] = "vacancies";
  const [min, max] = [number(post.salary_min), number(post.salary_max)];
  if ((min !== null && !wholeAtLeast(min, 0)) || (max !== null && !wholeAtLeast(max, 0)) || (min !== null && max !== null && min > max)) {
    errors[key("salary_max")] = "salary";
  }
  return errors;
}

/** Field errors as { field | "posts.<i>.<field>": i18n key }; empty when valid. */
export function validateCircularForm(form) {
  const errors = {};
  for (const field of ["title_en", "title_bn", "circular_date"]) if (!text(form[field])) errors[field] = "required";
  if (text(form.deadline) && text(form.circular_date) && form.deadline < form.circular_date) errors.deadline = "deadlineBeforeDate";
  if (!form.posts?.length || form.posts.length > MAX_POSTS) return { ...errors, posts: "postsRequired" };
  return form.posts.reduce((all, post, index) => ({ ...all, ...postErrors(post, index) }), errors);
}

/** The multipart body: posts as JSON with numbers, the poster only when one was chosen. */
export function toCircularFormData(form, poster) {
  const body = new FormData();
  for (const field of TEXT_FIELDS) body.append(field, text(form[field]));
  const posts = form.posts.map((post) => ({
    title_en: text(post.title_en),
    title_bn: text(post.title_bn),
    vacancies: Number(post.vacancies),
    qualification_en: text(post.qualification_en),
    qualification_bn: text(post.qualification_bn),
    salary_min: number(post.salary_min),
    salary_max: number(post.salary_max),
  }));
  body.append("posts", JSON.stringify(posts));
  body.append("is_open", String(Boolean(form.is_open)));
  body.append("is_published", String(Boolean(form.is_published)));
  if (poster) body.append("poster", poster);
  return body;
}

/** Form values for editing a saved circular. */
export function toFormValues(circular) {
  const values = { ...EMPTY_CIRCULAR };
  for (const field of TEXT_FIELDS) values[field] = circular[field] == null ? "" : String(circular[field]).slice(0, field.endsWith("date") || field === "deadline" ? 10 : undefined);
  const posts = (circular.posts ?? []).map((post) => Object.fromEntries(POST_FIELDS.map((field) => [field, post[field] == null ? "" : String(post[field])])));
  return { ...values, posts: posts.length ? posts : [EMPTY_POST], is_open: Boolean(circular.is_open), is_published: Boolean(circular.is_published) };
}
