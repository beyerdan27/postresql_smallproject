
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,        
    first_name TEXT,
    last_name TEXT,
    date_account_created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
    user_id INT PRIMARY KEY REFERENCES users(id),
    role_id INT NOT NULL REFERENCES roles(id),
    date_changed TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT,
    address TEXT
);

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    type TEXT,                   
    description TEXT
);

-- STUDENT, EMPLOYER, MANAGER INFO
CREATE TABLE student_info (
    user_id INT PRIMARY KEY REFERENCES users(id),
    school_id INT REFERENCES schools(id),
    year_of_grad INT,
    gpa NUMERIC(3,1),
    date_of_birth DATE
);

CREATE TABLE employer_info (
    user_id INT PRIMARY KEY REFERENCES users(id),
    org_id INT REFERENCES organizations(id),
    position TEXT,
    contact_info TEXT
);

CREATE TABLE manager_info (
    user_id INT PRIMARY KEY REFERENCES users(id),
    school_id INT REFERENCES schools(id),
    position_at_school TEXT
);

CREATE TABLE student_tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE opportunity_tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TYPE opportunity_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE application_status AS ENUM ('applied', 'accepted', 'rejected', 'completed', 'passed', 'saved');

CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES organizations(id) ON DELETE SET NULL,
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    location TEXT,
    date_start DATE,
    date_end DATE,
    date_app_open DATE,
    date_app_close DATE,
    min_age INT,
    min_grade INT,
    min_gpa NUMERIC(3,2),
    date_posted TIMESTAMP DEFAULT NOW(),
    status opportunity_status
);


CREATE TABLE student_tag_links (
    student_id INT REFERENCES student_info(user_id),
    tag_id INT REFERENCES student_tags(id),
    PRIMARY KEY (student_id, tag_id)
);

CREATE TABLE opportunity_tag_links (
    opportunity_id INT REFERENCES opportunities(id),
    tag_id INT REFERENCES opportunity_tags(id),
    PRIMARY KEY (opportunity_id, tag_id)
);


CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id),
    opportunity_id INT REFERENCES opportunities(id),
    status application_status,
    date_applied TIMESTAMP DEFAULT NOW(),
    date_status_updated TIMESTAMP,
    progress_notes TEXT
);
