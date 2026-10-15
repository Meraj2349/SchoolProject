-- ============================================================
-- Fee management tables (monthly tuition, extra fee heads, student
-- discounts, invoices, payments and receipt numbering).
-- Requires Branches and Students. Safe to re-run: every table is
-- created only if it does not exist yet (MySQL 8).
-- ============================================================

-- Branch fee settings: due day of each month, late fine and receipt prefix.
CREATE TABLE
    IF NOT EXISTS FeeSettings (
        branch_id INT PRIMARY KEY,
        due_day TINYINT NOT NULL DEFAULT 10,
        late_fine DECIMAL(10, 2) NOT NULL DEFAULT 0,
        receipt_prefix VARCHAR(10) NOT NULL DEFAULT 'RCT',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_fee_settings_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Monthly tuition per class name (all sections share it) and academic year.
CREATE TABLE
    IF NOT EXISTS FeeStructures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        class_name VARCHAR(20) NOT NULL,
        academic_year SMALLINT NOT NULL,
        monthly_tuition DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_fee_structure UNIQUE (branch_id, class_name, academic_year),
        CONSTRAINT fk_fee_structures_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Extra fees added to a month's invoices on demand (exam fee, transport...).
CREATE TABLE
    IF NOT EXISTS FeeHeads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        name_en VARCHAR(100),
        name_bn VARCHAR(100),
        default_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_fee_heads_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );

-- Scholarships, sibling discounts and waivers (100%).
CREATE TABLE
    IF NOT EXISTS StudentDiscounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        student_id INT NOT NULL,
        kind ENUM ('percent', 'fixed') NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        applies_to ENUM ('tuition', 'all') NOT NULL DEFAULT 'tuition',
        reason VARCHAR(255),
        valid_from DATE NULL,
        valid_to DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_discounts_student (student_id),
        CONSTRAINT fk_discounts_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_discounts_student FOREIGN KEY (student_id) REFERENCES Students (StudentID) ON DELETE CASCADE
    );

-- One invoice per student per month. Students with fee history cannot be
-- deleted (RESTRICT) so payment records are never lost.
CREATE TABLE
    IF NOT EXISTS FeeInvoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        student_id INT NOT NULL,
        year SMALLINT NOT NULL,
        month TINYINT NOT NULL,
        class_name VARCHAR(20) NOT NULL COMMENT 'Class and section when billed, so reports survive promotions',
        section VARCHAR(10),
        due_date DATE NOT NULL,
        status ENUM ('unpaid', 'partial', 'paid') NOT NULL DEFAULT 'unpaid',
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_invoice_student_month UNIQUE (student_id, year, month),
        INDEX idx_invoices_branch_period (branch_id, year, month),
        CONSTRAINT fk_invoices_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES Students (StudentID) ON DELETE RESTRICT
    );

-- Invoice lines are copied at billing time; discounts are stored negative.
CREATE TABLE
    IF NOT EXISTS FeeInvoiceItems (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_id INT NOT NULL,
        kind ENUM ('tuition', 'extra', 'discount', 'late_fine') NOT NULL,
        label VARCHAR(150) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES FeeInvoices (id) ON DELETE CASCADE
    );

-- Payments are never deleted, only voided, so the history stays auditable.
CREATE TABLE
    IF NOT EXISTS FeePayments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        branch_id INT NOT NULL,
        invoice_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method ENUM ('cash', 'bkash', 'nagad', 'bank', 'other') NOT NULL,
        paid_on DATE NOT NULL,
        receipt_no VARCHAR(30) NOT NULL,
        received_by INT NULL,
        note VARCHAR(255),
        voided_at DATETIME NULL,
        voided_by INT NULL,
        void_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_payment_receipt UNIQUE (branch_id, receipt_no),
        INDEX idx_payments_invoice (invoice_id),
        CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id) REFERENCES Branches (id),
        CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES FeeInvoices (id)
    );

-- Last receipt number issued per branch and year (locked while issuing one).
CREATE TABLE
    IF NOT EXISTS FeeReceiptCounters (
        branch_id INT NOT NULL,
        year SMALLINT NOT NULL,
        last_seq INT NOT NULL DEFAULT 0,
        PRIMARY KEY (branch_id, year),
        CONSTRAINT fk_receipt_counters_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)
    );
