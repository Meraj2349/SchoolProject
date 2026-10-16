// Bilingual API response messages (English + Bangla)
// Usage: i18n[key][req.language]

const i18n = {
  branch_in_use: {
    en: "This branch still has students, staff, admins, fee records, applications or website content. Move or remove them first.",
    bn: "এই শাখায় এখনো শিক্ষার্থী, শিক্ষক, অ্যাডমিন, ফি-এর তথ্য, আবেদন বা ওয়েবসাইটের কনটেন্ট আছে। আগে সেগুলো সরান।",
  },
  branch_required: {
    en: "Choose a branch first.",
    bn: "আগে একটি শাখা বেছে নিন।",
  },
  content_not_yours: {
    en: "Only the super admin can change content for the whole school or another branch.",
    bn: "পুরো স্কুলের বা অন্য শাখার কনটেন্ট শুধু সুপার অ্যাডমিন পরিবর্তন করতে পারেন।",
  },
  branch_mismatch: {
    en: "That record belongs to another branch.",
    bn: "এই তথ্যটি অন্য শাখার।",
  },
  image_too_large: { en: "The image is too large. The limit is 5 MB.", bn: "ছবিটি অনেক বড়। সর্বোচ্চ ৫ এমবি।" },
  file_too_large: { en: "The file is too large. The limit is 5 MB.", bn: "ফাইলটি অনেক বড়। সর্বোচ্চ ৫ এমবি।" },
  image_type_not_allowed: {
    en: "Only JPEG, PNG, GIF or WEBP images are allowed.",
    bn: "শুধু JPEG, PNG, GIF বা WEBP ছবি দেওয়া যাবে।",
  },
  upload_failed: { en: "The file could not be uploaded.", bn: "ফাইলটি আপলোড করা যায়নি।" },
  news_link_invalid: {
    en: "The link must be a page of this site (starting with /) or a web address (starting with https://).",
    bn: "লিংকটি এই সাইটের একটি পাতা (/ দিয়ে শুরু) বা একটি ওয়েব ঠিকানা (https:// দিয়ে শুরু) হতে হবে।",
  },
  // ── Achievements (honours board) ─────────────────────────────────────────
  achievement_created: { en: "Achievement added.", bn: "অর্জন যোগ করা হয়েছে।" },
  achievement_updated: { en: "Achievement updated.", bn: "অর্জন হালনাগাদ করা হয়েছে।" },
  achievement_deleted: { en: "Achievement deleted.", bn: "অর্জন মুছে ফেলা হয়েছে।" },
  achievement_publish_toggled: { en: "Achievement visibility changed.", bn: "অর্জন দেখানোর অবস্থা বদলানো হয়েছে।" },
  achievement_not_found: { en: "Achievement not found.", bn: "অর্জনটি পাওয়া যায়নি।" },
  achievement_title_required: {
    en: "Enter the title in English and Bangla.",
    bn: "ইংরেজি ও বাংলায় শিরোনাম লিখুন।",
  },
  achievement_category_invalid: { en: "Choose a category.", bn: "একটি বিভাগ বেছে নিন।" },
  achievement_year_invalid: { en: "Enter a valid year.", bn: "সঠিক সাল লিখুন।" },
  achievement_exam_required: {
    en: "Enter the exam name (for example SSC).",
    bn: "পরীক্ষার নাম লিখুন (যেমন এসএসসি)।",
  },
  achievement_result_numbers_invalid: {
    en: "Check the numbers: examinees must be more than 0, passed cannot exceed examinees, and GPA-5 cannot exceed passed.",
    bn: "সংখ্যাগুলো যাচাই করুন: পরীক্ষার্থী ০-এর বেশি হতে হবে, উত্তীর্ণ পরীক্ষার্থীর বেশি হবে না, এবং জিপিএ-৫ উত্তীর্ণের বেশি হবে না।",
  },
  achievement_invalid_publish: { en: "Published must be true or false.", bn: "প্রকাশের মান সত্য বা মিথ্যা হতে হবে।" },
  // ── Job circulars (নিয়োগ বিজ্ঞপ্তি) ────────────────────────────────────────
  job_circular_created: { en: "Job circular added.", bn: "নিয়োগ বিজ্ঞপ্তি যোগ করা হয়েছে।" },
  job_circular_updated: { en: "Job circular updated.", bn: "নিয়োগ বিজ্ঞপ্তি হালনাগাদ করা হয়েছে।" },
  job_circular_deleted: { en: "Job circular deleted.", bn: "নিয়োগ বিজ্ঞপ্তি মুছে ফেলা হয়েছে।" },
  job_circular_publish_toggled: { en: "Job circular visibility updated.", bn: "নিয়োগ বিজ্ঞপ্তির দৃশ্যমানতা হালনাগাদ করা হয়েছে।" },
  job_circular_not_found: { en: "Job circular not found.", bn: "নিয়োগ বিজ্ঞপ্তি পাওয়া যায়নি।" },
  job_circular_title_required: { en: "Enter the title in English and Bangla.", bn: "ইংরেজি ও বাংলায় শিরোনাম লিখুন।" },
  job_circular_date_invalid: { en: "Enter a valid date (YYYY-MM-DD).", bn: "সঠিক তারিখ দিন (বছর-মাস-দিন)।" },
  job_circular_deadline_before_date: { en: "The last date to apply cannot be before the circular date.", bn: "আবেদনের শেষ তারিখ বিজ্ঞপ্তির তারিখের আগে হতে পারে না।" },
  job_circular_posts_required: { en: "Add between 1 and 20 posts.", bn: "১ থেকে ২০টি পদ যোগ করুন।" },
  job_circular_post_invalid: { en: "Each post needs a name in English and Bangla and at least 1 vacancy.", bn: "প্রতিটি পদের ইংরেজি ও বাংলা নাম এবং অন্তত ১টি পদসংখ্যা দিন।" },
  job_circular_salary_invalid: { en: "Salary must be a whole amount, and the lowest no more than the highest.", bn: "বেতন পূর্ণ সংখ্যা হতে হবে এবং সর্বনিম্ন বেতন সর্বোচ্চের বেশি হতে পারবে না।" },
  job_circular_too_long: { en: "A title or qualification is too long (255 characters at most; how to apply, 5000).", bn: "শিরোনাম বা যোগ্যতা অনেক দীর্ঘ (সর্বোচ্চ ২৫৫ অক্ষর; আবেদনের নিয়ম, ৫০০০)।" },
  job_circular_invalid_publish: { en: "Published must be true or false.", bn: "প্রকাশের মান সত্য বা মিথ্যা হতে হবে।" },
  job_circular_closed: { en: "This circular is no longer taking applications.", bn: "এই বিজ্ঞপ্তিতে এখন আর আবেদন নেওয়া হচ্ছে না।" },
  file_type_not_allowed: { en: "Only JPG, PNG, WebP or PDF files are allowed.", bn: "শুধু JPG, PNG, WebP বা PDF ফাইল দেওয়া যাবে।" },
  // ── Job applications ──────────────────────────────────────────────────────
  job_application_submitted: { en: "Your application has been received. We will contact you if you are shortlisted.", bn: "আপনার আবেদন গ্রহণ করা হয়েছে। বাছাইয়ে নির্বাচিত হলে আমরা আপনার সঙ্গে যোগাযোগ করব।" },
  job_application_required: { en: "Fill in your name, mobile number, education and address.", bn: "আপনার নাম, মোবাইল নম্বর, শিক্ষাগত যোগ্যতা ও ঠিকানা লিখুন।" },
  job_application_too_long: { en: "Some of your answers are too long. Please shorten them (name 150, address 1000, experience 2000 characters).", bn: "কিছু উত্তর অনেক দীর্ঘ। ছোট করে লিখুন (নাম ১৫০, ঠিকানা ১০০০, অভিজ্ঞতা ২০০০ অক্ষর)।" },
  job_application_phone_invalid: { en: "Enter an 11-digit mobile number starting with 01.", bn: "০১ দিয়ে শুরু ১১ সংখ্যার মোবাইল নম্বর দিন।" },
  job_application_email_invalid: { en: "Enter a valid email address, or leave it empty.", bn: "সঠিক ইমেইল ঠিকানা দিন, অথবা খালি রাখুন।" },
  job_application_post_invalid: { en: "Choose a post from this circular.", bn: "এই বিজ্ঞপ্তির একটি পদ বাছাই করুন।" },
  job_application_duplicate: { en: "You have already applied for this post with this mobile number.", bn: "এই মোবাইল নম্বর দিয়ে আপনি এই পদে আগেই আবেদন করেছেন।" },
  job_application_not_found: { en: "Job application not found.", bn: "চাকরির আবেদন পাওয়া যায়নি।" },
  job_application_no_cv: { en: "This application has no CV.", bn: "এই আবেদনের সঙ্গে কোনো সিভি নেই।" },
  job_application_invalid_status: { en: "Invalid status.", bn: "অবৈধ অবস্থা।" },
  job_application_status_updated: { en: "Application status updated.", bn: "আবেদনের অবস্থা হালনাগাদ করা হয়েছে।" },
  job_application_deleted: { en: "Application deleted.", bn: "আবেদন মুছে ফেলা হয়েছে।" },
  cv_type_not_allowed: { en: "The CV must be a PDF, JPG or PNG file.", bn: "সিভি অবশ্যই PDF, JPG বা PNG ফাইল হতে হবে।" },
  too_many_requests: { en: "Too many attempts. Please try again later.", bn: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।" },
  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz_failed: {
    en: "Could not load the quiz. Please try again.",
    bn: "কুইজ লোড করা যায়নি। আবার চেষ্টা করুন।",
  },
  quiz_save_failed: {
    en: "Could not save. Please try again.",
    bn: "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
  },
  quiz_identity_required: {
    en: "Please fill in branch, name, class, section and roll number.",
    bn: "শাখা, নাম, শ্রেণি, শাখা/সেকশন ও রোল নম্বর পূরণ করুন।",
  },
  quiz_student_not_found: {
    en: "No student matches these details. Please check them.",
    bn: "এই তথ্যের সাথে কোনো শিক্ষার্থী মেলেনি। তথ্যগুলো যাচাই করুন।",
  },
  quiz_no_questions_for_class: {
    en: "There are no quiz questions for your class yet.",
    bn: "আপনার শ্রেণির জন্য এখনো কোনো কুইজ প্রশ্ন নেই।",
  },
  quiz_no_questions_for_subject: {
    en: "There are no questions for this subject yet. Choose another subject.",
    bn: "এই বিষয়ে এখনো কোনো প্রশ্ন নেই। অন্য বিষয় বেছে নিন।",
  },
  quiz_answers_required: {
    en: "Please answer at least one question.",
    bn: "অন্তত একটি প্রশ্নের উত্তর দিন।",
  },
  quiz_not_found: {
    en: "This quiz was not found. Please start a new quiz.",
    bn: "এই কুইজটি পাওয়া যায়নি। নতুন কুইজ শুরু করুন।",
  },
  quiz_already_finished: {
    en: "This quiz has already been submitted.",
    bn: "এই কুইজটি আগেই জমা দেওয়া হয়েছে।",
  },
  quiz_expired: {
    en: "This quiz was started too long ago. Please start a new quiz.",
    bn: "এই কুইজটি অনেক আগে শুরু হয়েছিল। নতুন কুইজ শুরু করুন।",
  },
  quiz_too_many_answers: {
    en: "A quiz cannot have that many answers.",
    bn: "একটি কুইজে এত উত্তর থাকতে পারে না।",
  },
  quiz_no_valid_answers: {
    en: "None of these answers belong to your quiz.",
    bn: "এই উত্তরগুলোর কোনোটিই আপনার কুইজের নয়।",
  },
  quiz_class_invalid: {
    en: "Please choose a valid class.",
    bn: "সঠিক শ্রেণি বেছে নিন।",
  },
  quiz_subject_required: {
    en: "Please enter a subject.",
    bn: "বিষয়ের নাম লিখুন।",
  },
  quiz_subject_too_long: {
    en: "The subject can be at most 100 characters.",
    bn: "বিষয়ের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে।",
  },
  quiz_prompt_required: {
    en: "Please enter the question.",
    bn: "প্রশ্নটি লিখুন।",
  },
  quiz_options_required: {
    en: "Please fill in all four options (A–D).",
    bn: "চারটি অপশনই (A–D) পূরণ করুন।",
  },
  quiz_answer_invalid: {
    en: "The correct answer must be A, B, C or D.",
    bn: "সঠিক উত্তর A, B, C অথবা D হতে হবে।",
  },
  quiz_bangla_incomplete: {
    en: "A Bangla question needs all four Bangla options.",
    bn: "বাংলা প্রশ্নের জন্য চারটি বাংলা অপশনই লাগবে।",
  },
  quiz_spreadsheet_error: {
    en: "The question contains a spreadsheet error such as #ERROR!.",
    bn: "প্রশ্নে #ERROR! এর মতো স্প্রেডশিট ত্রুটি আছে।",
  },
  quiz_duplicate: {
    en: "This question is repeated.",
    bn: "প্রশ্নটি একাধিকবার আছে।",
  },
  quiz_question_not_found: {
    en: "Question not found.",
    bn: "প্রশ্নটি পাওয়া যায়নি।",
  },
  quiz_active_invalid: {
    en: "Say whether the question should be shown or hidden.",
    bn: "প্রশ্নটি দেখানো হবে নাকি লুকানো হবে তা জানান।",
  },
  quiz_question_created: {
    en: "Question added.",
    bn: "প্রশ্ন যোগ হয়েছে।",
  },
  quiz_question_updated: {
    en: "Question updated.",
    bn: "প্রশ্ন হালনাগাদ হয়েছে।",
  },
  quiz_question_hidden: {
    en: "Question hidden from students.",
    bn: "প্রশ্নটি শিক্ষার্থীদের কাছ থেকে লুকানো হয়েছে।",
  },
  quiz_question_shown: {
    en: "Question shown to students again.",
    bn: "প্রশ্নটি আবার শিক্ষার্থীদের দেখানো হচ্ছে।",
  },
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
  admin_updated: {
    en: "Admin updated.",
    bn: "অ্যাডমিন হালনাগাদ হয়েছে।",
  },
  admin_deleted: {
    en: "Admin removed.",
    bn: "অ্যাডমিন সরানো হয়েছে।",
  },
  admin_fetch_failed: {
    en: "Could not load the admins.",
    bn: "অ্যাডমিনদের তালিকা আনা যায়নি।",
  },
  admin_username_required: {
    en: "Please enter a name.",
    bn: "অনুগ্রহ করে নাম লিখুন।",
  },
  admin_username_too_long: {
    en: "The name can be at most 50 characters.",
    bn: "নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে।",
  },
  admin_email_invalid: {
    en: "Please enter a valid email address.",
    bn: "অনুগ্রহ করে সঠিক ইমেইল ঠিকানা লিখুন।",
  },
  admin_password_too_short: {
    en: "The password must be at least 8 characters.",
    bn: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
  },
  admin_role_invalid: {
    en: "Unknown admin role.",
    bn: "অজানা অ্যাডমিন ভূমিকা।",
  },
  admin_branch_required: {
    en: "Please choose the branch this admin runs.",
    bn: "এই অ্যাডমিন কোন শাখা পরিচালনা করবেন তা বেছে নিন।",
  },
  admin_email_taken: {
    en: "Another admin already logs in with this email for that branch.",
    bn: "এই শাখার জন্য এই ইমেইল দিয়ে অন্য একজন অ্যাডমিন আছেন।",
  },
  admin_cannot_change_own_role: {
    en: "You cannot change your own role. Ask another super admin.",
    bn: "আপনি নিজের ভূমিকা পরিবর্তন করতে পারবেন না। অন্য একজন সুপার অ্যাডমিনকে বলুন।",
  },
  admin_cannot_delete_self: {
    en: "You cannot remove your own account.",
    bn: "আপনি নিজের অ্যাকাউন্ট সরাতে পারবেন না।",
  },
  admin_last_super_admin: {
    en: "There must always be at least one super admin.",
    bn: "অন্তত একজন সুপার অ্যাডমিন থাকতেই হবে।",
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
  message_not_found: {
    en: "Message not found.",
    bn: "বার্তাটি পাওয়া যায়নি।",
  },
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
  student_has_fee_records: {
    en: "This student has fee records, so they cannot be deleted.",
    bn: "এই শিক্ষার্থীর বেতনের রেকর্ড আছে, তাই মুছে ফেলা যাবে না।",
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
  image_type_invalid: {
    en: "Unknown image type.",
    bn: "ছবির ধরনটি সঠিক নয়।",
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
  application_branch_required: {
    en: "Choose the branch (campus) you are applying to.",
    bn: "যে শাখায় (ক্যাম্পাসে) ভর্তি হতে চান তা বেছে নিন।",
  },
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

  // ── Fees ──────────────────────────────────────────────────────────────────
  fee_branch_required: {
    en: "Select a branch first.",
    bn: "প্রথমে একটি শাখা নির্বাচন করুন।",
  },
  fee_amount_invalid: {
    en: "Enter a valid amount (0 or more, up to 2 decimals).",
    bn: "সঠিক পরিমাণ লিখুন (০ বা তার বেশি, সর্বোচ্চ ২ দশমিক ঘর)।",
  },
  fee_due_day_invalid: {
    en: "Due day must be between 1 and 28.",
    bn: "পরিশোধের শেষ দিন ১ থেকে ২৮-এর মধ্যে হতে হবে।",
  },
  fee_receipt_prefix_invalid: {
    en: "Receipt prefix must be 1–10 letters or digits.",
    bn: "রসিদের প্রিফিক্স ১–১০টি অক্ষর বা সংখ্যা হতে হবে।",
  },
  fee_class_required: {
    en: "Class is required.",
    bn: "শ্রেণি আবশ্যক।",
  },
  fee_year_invalid: {
    en: "Enter a valid academic year.",
    bn: "সঠিক শিক্ষাবর্ষ লিখুন।",
  },
  fee_period_invalid: {
    en: "Enter a valid month and year.",
    bn: "সঠিক মাস ও বছর লিখুন।",
  },
  fee_head_name_required: {
    en: "Fee name is required.",
    bn: "ফি-এর নাম আবশ্যক।",
  },
  fee_student_required: {
    en: "Student is required.",
    bn: "শিক্ষার্থী আবশ্যক।",
  },
  fee_discount_kind_invalid: {
    en: "Discount must be a percent or fixed amount, on tuition or all fees.",
    bn: "ছাড় শতাংশ বা নির্দিষ্ট পরিমাণ হতে হবে, বেতন বা সকল ফি-এর উপর।",
  },
  fee_discount_value_invalid: {
    en: "Discount must be more than 0 (and at most 100%).",
    bn: "ছাড় ০-এর বেশি হতে হবে (এবং সর্বোচ্চ ১০০%)।",
  },
  fee_date_invalid: {
    en: "Enter a valid date.",
    bn: "সঠিক তারিখ লিখুন।",
  },
  fee_date_range_invalid: {
    en: "End date cannot be before start date.",
    bn: "শেষের তারিখ শুরুর তারিখের আগে হতে পারে না।",
  },
  fee_generate_invalid: {
    en: "Classes and extra fees must be sent as lists.",
    bn: "শ্রেণি ও অতিরিক্ত ফি তালিকা আকারে পাঠাতে হবে।",
  },
  fee_filter_invalid: {
    en: "Filter by one class and one section at a time.",
    bn: "একবারে একটি শ্রেণি ও একটি সেকশন দিয়ে খুঁজুন।",
  },
  fee_status_invalid: {
    en: "Invalid invoice status.",
    bn: "অবৈধ ইনভয়েস অবস্থা।",
  },
  fee_structure_exists: {
    en: "Tuition for this class and year already exists.",
    bn: "এই শ্রেণি ও বছরের বেতন ইতিমধ্যে নির্ধারিত আছে।",
  },
  fee_structure_not_found: {
    en: "Class tuition not found.",
    bn: "শ্রেণির বেতন পাওয়া যায়নি।",
  },
  fee_head_not_found: {
    en: "Fee not found.",
    bn: "ফি পাওয়া যায়নি।",
  },
  fee_discount_not_found: {
    en: "Discount not found.",
    bn: "ছাড় পাওয়া যায়নি।",
  },
  fee_student_not_found: {
    en: "Student not found.",
    bn: "শিক্ষার্থী পাওয়া যায়নি।",
  },
  fee_invoice_not_found: {
    en: "Invoice not found.",
    bn: "ইনভয়েস পাওয়া যায়নি।",
  },
  fee_payment_not_found: {
    en: "Payment not found.",
    bn: "পেমেন্ট পাওয়া যায়নি।",
  },
  fee_payment_amount_invalid: {
    en: "Payment amount must be more than 0.",
    bn: "পেমেন্টের পরিমাণ ০-এর বেশি হতে হবে।",
  },
  fee_payment_method_invalid: {
    en: "Choose a payment method: cash, bKash, Nagad, bank or other.",
    bn: "পেমেন্ট পদ্ধতি বাছাই করুন: নগদ টাকা, বিকাশ, নগদ, ব্যাংক বা অন্যান্য।",
  },
  fee_payment_date_future: {
    en: "Payment date cannot be in the future.",
    bn: "পেমেন্টের তারিখ ভবিষ্যতের হতে পারে না।",
  },
  fee_payment_exceeds_balance: {
    en: "Payment is more than the amount due.",
    bn: "পেমেন্ট বকেয়া পরিমাণের চেয়ে বেশি।",
  },
  fee_payment_already_voided: {
    en: "This payment is already voided.",
    bn: "এই পেমেন্ট ইতিমধ্যে বাতিল করা হয়েছে।",
  },
  fee_void_reason_required: {
    en: "A reason is required to void a payment.",
    bn: "পেমেন্ট বাতিল করতে কারণ লিখতে হবে।",
  },
  fee_settings_saved: {
    en: "Fee settings saved.",
    bn: "ফি সেটিংস সংরক্ষিত হয়েছে।",
  },
  fee_structure_saved: {
    en: "Class tuition saved.",
    bn: "শ্রেণির বেতন সংরক্ষিত হয়েছে।",
  },
  fee_structure_deleted: {
    en: "Class tuition deleted.",
    bn: "শ্রেণির বেতন মুছে ফেলা হয়েছে।",
  },
  fee_head_saved: {
    en: "Fee saved.",
    bn: "ফি সংরক্ষিত হয়েছে।",
  },
  fee_head_deleted: {
    en: "Fee deleted.",
    bn: "ফি মুছে ফেলা হয়েছে।",
  },
  fee_discount_saved: {
    en: "Discount saved.",
    bn: "ছাড় সংরক্ষিত হয়েছে।",
  },
  fee_discount_deleted: {
    en: "Discount deleted.",
    bn: "ছাড় মুছে ফেলা হয়েছে।",
  },
  fee_invoices_generated: {
    en: "Invoices generated.",
    bn: "ইনভয়েস তৈরি হয়েছে।",
  },
  fee_late_fines_applied: {
    en: "Late fines applied.",
    bn: "বিলম্ব জরিমানা যোগ করা হয়েছে।",
  },
  fee_payment_recorded: {
    en: "Payment recorded.",
    bn: "পেমেন্ট গ্রহণ করা হয়েছে।",
  },
  fee_payment_voided: {
    en: "Payment voided.",
    bn: "পেমেন্ট বাতিল করা হয়েছে।",
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
