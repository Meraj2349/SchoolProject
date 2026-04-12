// Bilingual API response messages (English + Bangla)
// Usage: i18n[key][req.language]

const i18n = {
  // ── Auth / Admin ──────────────────────────────────────────────────────────
  admin_created: {
    en: "Admin created successfully.",
    bn: "অ্যাডমিন সফলভাবে তৈরি হয়েছে।",
  },
  login_success: {
    en: "Login successful.",
    bn: "সফলভাবে লগইন হয়েছে।",
  },
  logout_success: {
    en: "Admin logged out successfully.",
    bn: "অ্যাডমিন সফলভাবে লগআউট হয়েছে।",
  },
  logout_failed: {
    en: "Failed to log out.",
    bn: "লগআউট করতে ব্যর্থ হয়েছে।",
  },
  admin_not_found: {
    en: "Admin not found.",
    bn: "অ্যাডমিন পাওয়া যায়নি।",
  },
  invalid_credentials: {
    en: "Invalid email or password.",
    bn: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
  },
  all_fields_required: {
    en: "All fields are required.",
    bn: "সকল তথ্য প্রদান করা আবশ্যক।",
  },
  password_too_short: {
    en: "New password must be at least 8 characters.",
    bn: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
  },
  current_password_incorrect: {
    en: "Current password is incorrect.",
    bn: "বর্তমান পাসওয়ার্ড সঠিক নয়।",
  },
  email_password_updated: {
    en: "Email and password updated successfully.",
    bn: "ইমেইল ও পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।",
  },
  email_password_update_failed: {
    en: "Failed to update email/password.",
    bn: "ইমেইল/পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে।",
  },
  username_email_password_required: {
    en: "Username, Email, and Password are required.",
    bn: "ব্যবহারকারীর নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।",
  },

  // ── Notices ───────────────────────────────────────────────────────────────
  notice_added: {
    en: "Notice added successfully.",
    bn: "নোটিশ সফলভাবে যোগ হয়েছে।",
  },
  notice_updated: {
    en: "Notice updated successfully.",
    bn: "নোটিশ সফলভাবে আপডেট হয়েছে।",
  },
  notice_deleted: {
    en: "Notice deleted successfully.",
    bn: "নোটিশ সফলভাবে মুছে ফেলা হয়েছে।",
  },
  notice_not_found: {
    en: "Notice not found.",
    bn: "নোটিশ পাওয়া যায়নি।",
  },
  notice_visible: {
    en: "Notice is now visible.",
    bn: "নোটিশটি এখন দৃশ্যমান।",
  },
  notice_visibility_updated: {
    en: "Notice visibility updated successfully.",
    bn: "নোটিশের দৃশ্যমানতা সফলভাবে আপডেট হয়েছে।",
  },
  notice_title_desc_required: {
    en: "Title and description are required.",
    bn: "শিরোনাম এবং বিবরণ আবশ্যক।",
  },
  notice_add_failed: {
    en: "Failed to add notice.",
    bn: "নোটিশ যোগ করতে ব্যর্থ হয়েছে।",
  },
  notice_delete_failed: {
    en: "Failed to delete notice.",
    bn: "নোটিশ মুছতে ব্যর্থ হয়েছে।",
  },
  notice_fetch_failed: {
    en: "Failed to fetch notices.",
    bn: "নোটিশ আনতে ব্যর্থ হয়েছে।",
  },
  notice_update_failed: {
    en: "Failed to update notice.",
    bn: "নোটিশ আপডেট করতে ব্যর্থ হয়েছে।",
  },
  notice_visibility_update_failed: {
    en: "Failed to update notice visibility.",
    bn: "নোটিশের দৃশ্যমানতা আপডেট করতে ব্যর্থ হয়েছে।",
  },

  // ── Messages (Chairman) ────────────────────────────────────────────────────
  message_added: {
    en: "Message added successfully.",
    bn: "বার্তা সফলভাবে যোগ হয়েছে।",
  },
  message_updated: {
    en: "Message updated successfully.",
    bn: "বার্তা সফলভাবে আপডেট হয়েছে।",
  },
  message_deleted: {
    en: "Message deleted successfully.",
    bn: "বার্তা সফলভাবে মুছে ফেলা হয়েছে।",
  },
  message_visibility_updated: {
    en: "Message visibility updated successfully.",
    bn: "বার্তার দৃশ্যমানতা সফলভাবে আপডেট হয়েছে।",
  },
  message_content_required: {
    en: "Message content is required.",
    bn: "বার্তার বিষয়বস্তু আবশ্যক।",
  },
  message_content_visibility_required: {
    en: "Message content and visibility are required.",
    bn: "বার্তার বিষয়বস্তু এবং দৃশ্যমানতা আবশ্যক।",
  },
  message_add_failed: {
    en: "Failed to add message.",
    bn: "বার্তা যোগ করতে ব্যর্থ হয়েছে।",
  },
  message_delete_failed: {
    en: "Failed to delete message.",
    bn: "বার্তা মুছতে ব্যর্থ হয়েছে।",
  },
  message_fetch_failed: {
    en: "Failed to fetch messages.",
    bn: "বার্তা আনতে ব্যর্থ হয়েছে।",
  },
  message_update_failed: {
    en: "Failed to update message.",
    bn: "বার্তা আপডেট করতে ব্যর্থ হয়েছে।",
  },
  message_visibility_update_failed: {
    en: "Failed to update message visibility.",
    bn: "বার্তার দৃশ্যমানতা আপডেট করতে ব্যর্থ হয়েছে।",
  },
  invalid_show_value: {
    en: "Invalid value for 'show'. It must be a boolean.",
    bn: "'show' এর জন্য অবৈধ মান। এটি একটি বুলিয়ান হতে হবে।",
  },

  // ── Students ──────────────────────────────────────────────────────────────
  student_created: {
    en: "Student added successfully.",
    bn: "শিক্ষার্থী সফলভাবে যোগ হয়েছে।",
  },
  student_updated: {
    en: "Student updated successfully.",
    bn: "শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে।",
  },
  student_deleted: {
    en: "Student deleted successfully.",
    bn: "শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে।",
  },
  student_not_found: {
    en: "Student not found.",
    bn: "শিক্ষার্থী পাওয়া যায়নি।",
  },
  student_fetch_failed: {
    en: "Failed to fetch students.",
    bn: "শিক্ষার্থী আনতে ব্যর্থ হয়েছে।",
  },
  student_required_fields: {
    en: "First name, last name, and class name are required.",
    bn: "প্রথম নাম, শেষ নাম এবং শ্রেণির নাম আবশ্যক।",
  },

  // ── Teachers ──────────────────────────────────────────────────────────────
  teacher_created: {
    en: "Teacher added successfully.",
    bn: "শিক্ষক সফলভাবে যোগ হয়েছে।",
  },
  teacher_updated: {
    en: "Teacher updated successfully.",
    bn: "শিক্ষকের তথ্য সফলভাবে আপডেট হয়েছে।",
  },
  teacher_deleted: {
    en: "Teacher deleted successfully.",
    bn: "শিক্ষক সফলভাবে মুছে ফেলা হয়েছে।",
  },
  teacher_not_found: {
    en: "Teacher not found.",
    bn: "শিক্ষক পাওয়া যায়নি।",
  },
  teacher_fetch_failed: {
    en: "Failed to fetch teachers.",
    bn: "শিক্ষক আনতে ব্যর্থ হয়েছে।",
  },

  // ── Classes ───────────────────────────────────────────────────────────────
  class_added: {
    en: "Class added successfully.",
    bn: "শ্রেণি সফলভাবে যোগ হয়েছে।",
  },
  class_updated: {
    en: "Class updated successfully.",
    bn: "শ্রেণি সফলভাবে আপডেট হয়েছে।",
  },
  class_deleted: {
    en: "Class deleted successfully.",
    bn: "শ্রেণি সফলভাবে মুছে ফেলা হয়েছে।",
  },
  class_name_required: {
    en: "Class name is required.",
    bn: "শ্রেণির নাম আবশ্যক।",
  },
  class_add_failed: {
    en: "Failed to add class.",
    bn: "শ্রেণি যোগ করতে ব্যর্থ হয়েছে।",
  },
  class_update_failed: {
    en: "Failed to update class.",
    bn: "শ্রেণি আপডেট করতে ব্যর্থ হয়েছে।",
  },
  class_delete_failed: {
    en: "Failed to delete class.",
    bn: "শ্রেণি মুছতে ব্যর্থ হয়েছে।",
  },
  class_fetch_failed: {
    en: "Failed to fetch classes.",
    bn: "শ্রেণি আনতে ব্যর্থ হয়েছে।",
  },
  student_count_fetch_failed: {
    en: "Failed to fetch student count.",
    bn: "শিক্ষার্থীর সংখ্যা আনতে ব্যর্থ হয়েছে।",
  },

  // ── Subjects ──────────────────────────────────────────────────────────────
  subject_added: {
    en: "Subject added successfully.",
    bn: "বিষয় সফলভাবে যোগ হয়েছে।",
  },
  subject_updated: {
    en: "Subject updated successfully.",
    bn: "বিষয় সফলভাবে আপডেট হয়েছে।",
  },
  subject_deleted: {
    en: "Subject deleted successfully.",
    bn: "বিষয় সফলভাবে মুছে ফেলা হয়েছে।",
  },
  subject_name_class_required: {
    en: "Subject name and class name are required.",
    bn: "বিষয়ের নাম এবং শ্রেণির নাম আবশ্যক।",
  },
  subject_add_failed: {
    en: "Failed to add subject.",
    bn: "বিষয় যোগ করতে ব্যর্থ হয়েছে।",
  },
  subject_update_failed: {
    en: "Failed to update subject.",
    bn: "বিষয় আপডেট করতে ব্যর্থ হয়েছে।",
  },
  subject_delete_failed: {
    en: "Failed to delete subject.",
    bn: "বিষয় মুছতে ব্যর্থ হয়েছে।",
  },
  subject_fetch_failed: {
    en: "Failed to fetch subjects.",
    bn: "বিষয় আনতে ব্যর্থ হয়েছে।",
  },

  // ── Events ────────────────────────────────────────────────────────────────
  event_created: {
    en: "Event created successfully.",
    bn: "ইভেন্ট সফলভাবে তৈরি হয়েছে।",
  },
  event_updated: {
    en: "Event updated successfully.",
    bn: "ইভেন্ট সফলভাবে আপডেট হয়েছে।",
  },
  event_deleted: {
    en: "Event deleted successfully.",
    bn: "ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে।",
  },
  event_not_found: {
    en: "Event not found.",
    bn: "ইভেন্ট পাওয়া যায়নি।",
  },
  event_fetch_failed: {
    en: "Failed to fetch events.",
    bn: "ইভেন্ট আনতে ব্যর্থ হয়েছে।",
  },
  event_required_fields: {
    en: "Title, description, start date, and end date are required.",
    bn: "শিরোনাম, বিবরণ, শুরুর তারিখ এবং শেষের তারিখ আবশ্যক।",
  },
  event_title_required: {
    en: "Event title is required.",
    bn: "ইভেন্টের শিরোনাম আবশ্যক।",
  },
  event_dates_required: {
    en: "Start and end dates are required.",
    bn: "শুরুর তারিখ এবং শেষের তারিখ আবশ্যক।",
  },
  event_end_after_start: {
    en: "End date must be after start date.",
    bn: "শেষের তারিখ শুরুর তারিখের পরে হতে হবে।",
  },
  event_update_failed: {
    en: "Failed to update event.",
    bn: "ইভেন্ট আপডেট করতে ব্যর্থ হয়েছে।",
  },

  // ── Exams ─────────────────────────────────────────────────────────────────
  exam_created: {
    en: "Exam created successfully.",
    bn: "পরীক্ষা সফলভাবে তৈরি হয়েছে।",
  },
  exam_updated: {
    en: "Exam updated successfully.",
    bn: "পরীক্ষা সফলভাবে আপডেট হয়েছে।",
  },
  exam_deleted: {
    en: "Exam deleted successfully.",
    bn: "পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।",
  },
  exam_not_found: {
    en: "Exam not found.",
    bn: "পরীক্ষা পাওয়া যায়নি।",
  },
  exam_fetch_failed: {
    en: "Failed to fetch exams.",
    bn: "পরীক্ষা আনতে ব্যর্থ হয়েছে।",
  },
  exam_required_fields: {
    en: "ExamName, ClassName, and Date are required.",
    bn: "পরীক্ষার নাম, শ্রেণির নাম এবং তারিখ আবশ্যক।",
  },
  exam_class_required: {
    en: "Class name is required.",
    bn: "শ্রেণির নাম আবশ্যক।",
  },

  // ── Results ───────────────────────────────────────────────────────────────
  result_created: {
    en: "Result added successfully.",
    bn: "ফলাফল সফলভাবে যোগ হয়েছে।",
  },
  result_updated: {
    en: "Result updated successfully.",
    bn: "ফলাফল সফলভাবে আপডেট হয়েছে।",
  },
  result_deleted: {
    en: "Result deleted successfully.",
    bn: "ফলাফল সফলভাবে মুছে ফেলা হয়েছে।",
  },
  result_not_found: {
    en: "Result not found.",
    bn: "ফলাফল পাওয়া যায়নি।",
  },
  result_fetch_failed: {
    en: "Failed to fetch results.",
    bn: "ফলাফল আনতে ব্যর্থ হয়েছে।",
  },
  result_required_fields: {
    en: "Student ID, Subject ID, Exam ID, Marks, and Total Marks are required.",
    bn: "শিক্ষার্থী আইডি, বিষয় আইডি, পরীক্ষা আইডি, নম্বর এবং মোট নম্বর আবশ্যক।",
  },
  result_duplicate: {
    en: "A result for this student, subject, and exam already exists.",
    bn: "এই শিক্ষার্থী, বিষয় এবং পরীক্ষার জন্য ইতিমধ্যে একটি ফলাফল বিদ্যমান।",
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendance_recorded: {
    en: "Attendance recorded successfully.",
    bn: "উপস্থিতি সফলভাবে রেকর্ড হয়েছে।",
  },
  attendance_updated: {
    en: "Attendance updated successfully.",
    bn: "উপস্থিতি সফলভাবে আপডেট হয়েছে।",
  },
  attendance_deleted: {
    en: "Attendance deleted successfully.",
    bn: "উপস্থিতি সফলভাবে মুছে ফেলা হয়েছে।",
  },
  attendance_not_found: {
    en: "Attendance record not found.",
    bn: "উপস্থিতির রেকর্ড পাওয়া যায়নি।",
  },
  attendance_fetch_failed: {
    en: "Failed to fetch attendance.",
    bn: "উপস্থিতি আনতে ব্যর্থ হয়েছে।",
  },
  attendance_required_fields: {
    en: "Student ID, date, and status are required.",
    bn: "শিক্ষার্থী আইডি, তারিখ এবং অবস্থা আবশ্যক।",
  },
  attendance_class_required: {
    en: "Class name is required.",
    bn: "শ্রেণির নাম আবশ্যক।",
  },
  attendance_student_required: {
    en: "Student ID is required.",
    bn: "শিক্ষার্থী আইডি আবশ্যক।",
  },
  attendance_date_required: {
    en: "Date is required.",
    bn: "তারিখ আবশ্যক।",
  },
  attendance_status_required: {
    en: "Status is required.",
    bn: "অবস্থা আবশ্যক।",
  },
  attendance_class_section_required: {
    en: "Class name and section are required.",
    bn: "শ্রেণির নাম এবং বিভাগ আবশ্যক।",
  },

  // ── Routines ──────────────────────────────────────────────────────────────
  routine_created: {
    en: "Routine created successfully.",
    bn: "রুটিন সফলভাবে তৈরি হয়েছে।",
  },
  routine_updated: {
    en: "Routine updated successfully.",
    bn: "রুটিন সফলভাবে আপডেট হয়েছে।",
  },
  routine_deleted: {
    en: "Routine deleted successfully.",
    bn: "রুটিন সফলভাবে মুছে ফেলা হয়েছে।",
  },
  routine_not_found: {
    en: "Routine not found.",
    bn: "রুটিন পাওয়া যায়নি।",
  },
  routine_fetch_failed: {
    en: "Failed to fetch routines.",
    bn: "রুটিন আনতে ব্যর্থ হয়েছে।",
  },
  routine_file_required: {
    en: "Routine file is required.",
    bn: "রুটিন ফাইল আবশ্যক।",
  },
  routine_class_required: {
    en: "Class ID is required.",
    bn: "শ্রেণি আইডি আবশ্যক।",
  },
  routine_id_required: {
    en: "Valid routine ID is required.",
    bn: "একটি সঠিক রুটিন আইডি আবশ্যক।",
  },
  routine_class_id_required: {
    en: "Valid Class ID is required.",
    bn: "একটি সঠিক শ্রেণি আইডি আবশ্যক।",
  },

  // ── Images ────────────────────────────────────────────────────────────────
  image_uploaded: {
    en: "Image uploaded successfully.",
    bn: "ছবি সফলভাবে আপলোড হয়েছে।",
  },
  image_updated: {
    en: "Image updated successfully.",
    bn: "ছবি সফলভাবে আপডেট হয়েছে।",
  },
  image_deleted: {
    en: "Image deleted successfully.",
    bn: "ছবি সফলভাবে মুছে ফেলা হয়েছে।",
  },
  image_not_found: {
    en: "Image not found.",
    bn: "ছবি পাওয়া যায়নি।",
  },
  no_file_uploaded: {
    en: "No file uploaded.",
    bn: "কোনো ফাইল আপলোড করা হয়নি।",
  },
  image_type_required: {
    en: "Image type is required.",
    bn: "ছবির ধরন আবশ্যক।",
  },
  student_id_required: {
    en: "Student ID is required for student images.",
    bn: "শিক্ষার্থীর ছবির জন্য শিক্ষার্থী আইডি আবশ্যক।",
  },
  teacher_id_required: {
    en: "Teacher ID is required for teacher images.",
    bn: "শিক্ষকের ছবির জন্য শিক্ষক আইডি আবশ্যক।",
  },

  // ── Branches ──────────────────────────────────────────────────────────────
  branch_created: {
    en: "Branch created successfully.",
    bn: "শাখা সফলভাবে তৈরি হয়েছে।",
  },
  branch_updated: {
    en: "Branch updated successfully.",
    bn: "শাখা সফলভাবে আপডেট হয়েছে।",
  },
  branch_deleted: {
    en: "Branch deleted successfully.",
    bn: "শাখা সফলভাবে মুছে ফেলা হয়েছে।",
  },
  branch_not_found: {
    en: "Branch not found.",
    bn: "শাখা পাওয়া যায়নি।",
  },
  branch_fetch_failed: {
    en: "Failed to fetch branches.",
    bn: "শাখা আনতে ব্যর্থ হয়েছে।",
  },
  branch_name_required: {
    en: "At least one branch name (name_bn or name_en) is required.",
    bn: "কমপক্ষে একটি শাখার নাম (name_bn বা name_en) আবশ্যক।",
  },
  branch_id_required: {
    en: "Branch ID is required.",
    bn: "শাখা আইডি আবশ্যক।",
  },
  branch_no_fields: {
    en: "No fields provided for update.",
    bn: "আপডেটের জন্য কোনো তথ্য প্রদান করা হয়নি।",
  },

  // ── News ──────────────────────────────────────────────────────────────────
  news_created: {
    en: "News item created successfully.",
    bn: "সংবাদ সফলভাবে তৈরি হয়েছে।",
  },
  news_updated: {
    en: "News item updated successfully.",
    bn: "সংবাদ সফলভাবে আপডেট হয়েছে।",
  },
  news_deleted: {
    en: "News item deleted successfully.",
    bn: "সংবাদ সফলভাবে মুছে ফেলা হয়েছে।",
  },
  news_not_found: {
    en: "News item not found.",
    bn: "সংবাদ পাওয়া যায়নি।",
  },
  news_fetch_failed: {
    en: "Failed to fetch news.",
    bn: "সংবাদ আনতে ব্যর্থ হয়েছে।",
  },
  news_required_fields: {
    en: "title_bn, title_en, and date are required.",
    bn: "title_bn, title_en এবং date আবশ্যক।",
  },
  news_create_failed: {
    en: "Failed to create news item.",
    bn: "সংবাদ তৈরি করতে ব্যর্থ হয়েছে।",
  },
  news_update_failed: {
    en: "Failed to update news item.",
    bn: "সংবাদ আপডেট করতে ব্যর্থ হয়েছে।",
  },
  news_delete_failed: {
    en: "Failed to delete news item.",
    bn: "সংবাদ মুছতে ব্যর্থ হয়েছে।",
  },

  // ── Notice Announcements ──────────────────────────────────────────────────
  notice_announcement_created: {
    en: "Notice announcement created successfully.",
    bn: "নোটিশ ঘোষণা সফলভাবে তৈরি হয়েছে।",
  },
  notice_announcement_updated: {
    en: "Notice announcement updated successfully.",
    bn: "নোটিশ ঘোষণা সফলভাবে আপডেট হয়েছে।",
  },
  notice_announcement_deleted: {
    en: "Notice announcement deleted successfully.",
    bn: "নোটিশ ঘোষণা সফলভাবে মুছে ফেলা হয়েছে।",
  },
  notice_announcement_not_found: {
    en: "Notice announcement not found.",
    bn: "নোটিশ ঘোষণা পাওয়া যায়নি।",
  },
  notice_announcement_fetch_failed: {
    en: "Failed to fetch notice announcements.",
    bn: "নোটিশ ঘোষণা আনতে ব্যর্থ হয়েছে।",
  },
  notice_announcement_required_fields: {
    en: "title_bn, title_en, category, and date are required.",
    bn: "title_bn, title_en, category এবং date আবশ্যক।",
  },
  notice_announcement_invalid_category: {
    en: "Invalid category. Must be one of: Admission, Exam, Notice, Event.",
    bn: "অবৈধ ক্যাটাগরি। Admission, Exam, Notice, Event এর মধ্যে একটি হতে হবে।",
  },
  notice_announcement_invalid_publish: {
    en: "Invalid value for is_published. It must be a boolean.",
    bn: "is_published এর জন্য অবৈধ মান। এটি একটি বুলিয়ান হতে হবে।",
  },
  notice_announcement_create_failed: {
    en: "Failed to create notice announcement.",
    bn: "নোটিশ ঘোষণা তৈরি করতে ব্যর্থ হয়েছে।",
  },
  notice_announcement_update_failed: {
    en: "Failed to update notice announcement.",
    bn: "নোটিশ ঘোষণা আপডেট করতে ব্যর্থ হয়েছে।",
  },
  notice_announcement_delete_failed: {
    en: "Failed to delete notice announcement.",
    bn: "নোটিশ ঘোষণা মুছতে ব্যর্থ হয়েছে।",
  },
  notice_announcement_publish_toggled: {
    en: "Notice announcement publish status updated.",
    bn: "নোটিশ ঘোষণার প্রকাশের অবস্থা আপডেট হয়েছে।",
  },

  // ── Applications ──────────────────────────────────────────────────────────
  application_submitted: {
    en: "Application submitted successfully.",
    bn: "আবেদন সফলভাবে জমা হয়েছে।",
  },
  application_submit_failed: {
    en: "Failed to submit application.",
    bn: "আবেদন জমা দিতে ব্যর্থ হয়েছে।",
  },
  application_not_found: {
    en: "Application not found.",
    bn: "আবেদন পাওয়া যায়নি।",
  },
  application_status_updated: {
    en: "Application status updated successfully.",
    bn: "আবেদনের অবস্থা সফলভাবে আপডেট হয়েছে।",
  },
  application_deleted: {
    en: "Application deleted successfully.",
    bn: "আবেদন সফলভাবে মুছে ফেলা হয়েছে।",
  },
  application_invalid_status: {
    en: "Invalid status value. Must be one of: pending, reviewed, accepted, rejected.",
    bn: "অবৈধ অবস্থার মান। pending, reviewed, accepted, rejected এর মধ্যে একটি হতে হবে।",
  },
  application_all_required: {
    en: "Applicant name, date of birth, gender, applying class, parent name, and parent contact are required.",
    bn: "আবেদনকারীর নাম, জন্ম তারিখ, লিঙ্গ, ভর্তির শ্রেণি, অভিভাবকের নাম এবং অভিভাবকের যোগাযোগ নম্বর আবশ্যক।",
  },

  // ── Generic ───────────────────────────────────────────────────────────────
  internal_server_error: {
    en: "Internal server error.",
    bn: "সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে।",
  },
  not_found: {
    en: "Resource not found.",
    bn: "অনুরোধকৃত তথ্য পাওয়া যায়নি।",
  },
  unauthorized: {
    en: "Unauthorized access.",
    bn: "অনুমোদনহীন অ্যাক্সেস।",
  },
  forbidden: {
    en: "Access forbidden.",
    bn: "প্রবেশাধিকার নিষিদ্ধ।",
  },
};

/**
 * Retrieve a translated message.
 * @param {string} key   - Key from the i18n map above
 * @param {"en"|"bn"} lang - Target language, defaults to "bn"
 * @returns {string}
 */
export function t(key, lang = "bn") {
  const entry = i18n[key];
  if (!entry) return key; // fallback: return the key itself
  return entry[lang] ?? entry.bn ?? key;
}

export default i18n;
