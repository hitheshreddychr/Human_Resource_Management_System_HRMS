-- HRMS SQLite database schema and data dump
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;;
CREATE TABLE attendance (
	id INTEGER NOT NULL, 
	employee_id INTEGER NOT NULL, 
	attendance_date DATE NOT NULL, 
	check_in DATETIME, 
	check_out DATETIME, 
	working_minutes INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_employee_attendance_date UNIQUE (employee_id, attendance_date), 
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);;
INSERT INTO "attendance" VALUES(1,2,'2026-10-14','2026-10-14 05:39:26.753637','2026-10-14 06:06:14.323786',26,'present');;
CREATE TABLE audit_logs (
	id INTEGER NOT NULL, 
	user_id INTEGER, 
	action VARCHAR(100) NOT NULL, 
	entity_type VARCHAR(100) NOT NULL, 
	entity_id INTEGER, 
	details TEXT NOT NULL, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);;
INSERT INTO "audit_logs" VALUES(1,1,'TEST','system',NULL,'Audit service verification','2026-10-14 02:11:24');;
INSERT INTO "audit_logs" VALUES(2,1,'CREATE','employee',4,'Created employee EMP004','2026-10-14 02:18:54');;
INSERT INTO "audit_logs" VALUES(3,1,'UPDATE','employee',4,'Updated employee EMP004','2026-10-14 02:19:23');;
CREATE TABLE employees (
	id INTEGER NOT NULL, 
	employee_code VARCHAR(30) NOT NULL, 
	first_name VARCHAR(100) NOT NULL, 
	last_name VARCHAR(100) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	phone VARCHAR(20), 
	department VARCHAR(100) NOT NULL, 
	designation VARCHAR(100) NOT NULL, 
	joining_date DATE NOT NULL, 
	annual_salary INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id)
);;
INSERT INTO "employees" VALUES(1,'EMP001','HITHESH','REDDY','hitheshchr@gmail.com','9999999999','Engineering','Python Developer','2026-10-12',1000000,1,'2026-10-13 20:48:22');;
INSERT INTO "employees" VALUES(2,'EMP002','Gayathri','Hithesh','gayathrilakshmisamudrala02@gmail.com','8888888888','Engineering','Python Developer','2026-10-12',600000,1,'2026-10-13 22:09:49');;
INSERT INTO "employees" VALUES(3,'EMP003','string','string','user@example.com','string','string','string','2026-10-14',100000000,0,'2026-10-14 00:34:19');;
INSERT INTO "employees" VALUES(4,'EMP004','string','string','user2@example.com','string','string','string','2026-10-14',300000,1,'2026-10-14 02:18:54');;
CREATE TABLE leaves (
	id INTEGER NOT NULL, 
	employee_id INTEGER NOT NULL, 
	leave_type VARCHAR(30) NOT NULL, 
	start_date DATE NOT NULL, 
	end_date DATE NOT NULL, 
	total_days INTEGER NOT NULL, 
	reason TEXT NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	reviewed_by INTEGER, 
	reviewed_at DATETIME, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(employee_id) REFERENCES employees (id), 
	FOREIGN KEY(reviewed_by) REFERENCES users (id)
);;
INSERT INTO "leaves" VALUES(1,2,'casual','2026-10-20','2026-10-21',2,'Personal work','approved',1,'2026-10-14 06:17:34.736976','2026-10-14 00:40:00');;
CREATE TABLE notifications (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR(200) NOT NULL, 
	message TEXT NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, notification_type VARCHAR(50) NOT NULL DEFAULT info, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);;
CREATE TABLE payroll (
	id INTEGER NOT NULL, 
	employee_id INTEGER NOT NULL, 
	payroll_month DATE NOT NULL, 
	basic_salary INTEGER NOT NULL, 
	lop_deduction INTEGER NOT NULL, 
	net_salary INTEGER NOT NULL, 
	status VARCHAR(20) NOT NULL, 
	is_locked BOOLEAN NOT NULL, 
	generated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_employee_payroll_month UNIQUE (employee_id, payroll_month), 
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);;
INSERT INTO "payroll" VALUES(1,2,'2026-10-01',50000,0,50000,'generated',1,'2026-10-14 00:50:19');;
CREATE TABLE salary_slips (
	id INTEGER NOT NULL, 
	payroll_id INTEGER NOT NULL, 
	employee_id INTEGER NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_salary_slip_payroll UNIQUE (payroll_id), 
	FOREIGN KEY(payroll_id) REFERENCES payroll (id), 
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);;
INSERT INTO "salary_slips" VALUES(1,1,2,'salary_slip_1.pdf','2026-10-14 00:53:19');;
CREATE TABLE users (
	id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	role VARCHAR(20) NOT NULL, 
	employee_id INTEGER, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (employee_id), 
	FOREIGN KEY(employee_id) REFERENCES employees (id)
);;
INSERT INTO "users" VALUES(1,'hitheshchr@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$BpSvQL9c5zbUA70TjKDLLA$iE2pGtVaAD/dQ2YvbrqcQjJSDl63gICMcOiEg12zb8E','admin',NULL,1,'2026-10-13 20:32:55');;
INSERT INTO "users" VALUES(2,'gayathrilakshmisamudrala02@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$lksatGHxYgEIH0up9XhmSg$xXOU9l/ES/1rrDTPSrDCe1d/A7J3aVjd5ZBVC/jF/qQ','employee',2,1,'2026-10-13 23:36:35');;
CREATE UNIQUE INDEX ix_employees_employee_code ON employees (employee_code);;
CREATE UNIQUE INDEX ix_employees_email ON employees (email);;
CREATE INDEX ix_employees_id ON employees (id);;
CREATE INDEX ix_users_id ON users (id);;
CREATE UNIQUE INDEX ix_users_email ON users (email);;
CREATE INDEX ix_attendance_id ON attendance (id);;
CREATE INDEX ix_attendance_employee_id ON attendance (employee_id);;
CREATE INDEX ix_attendance_attendance_date ON attendance (attendance_date);;
CREATE INDEX ix_leaves_status ON leaves (status);;
CREATE INDEX ix_leaves_employee_id ON leaves (employee_id);;
CREATE INDEX ix_leaves_id ON leaves (id);;
CREATE INDEX ix_payroll_employee_id ON payroll (employee_id);;
CREATE INDEX ix_payroll_id ON payroll (id);;
CREATE INDEX ix_notifications_id ON notifications (id);;
CREATE INDEX ix_notifications_user_id ON notifications (user_id);;
CREATE INDEX ix_audit_logs_id ON audit_logs (id);;
CREATE INDEX ix_salary_slips_payroll_id ON salary_slips (payroll_id);;
CREATE INDEX ix_salary_slips_employee_id ON salary_slips (employee_id);;
CREATE INDEX ix_salary_slips_id ON salary_slips (id);;
COMMIT;;
PRAGMA foreign_keys=ON;
