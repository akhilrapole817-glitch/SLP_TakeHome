-- Schema for Vehicle Defect Intelligence Tool

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vin VARCHAR(17) UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recalls (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    nhtsa_campaign_number VARCHAR(50),
    component VARCHAR(255),
    description TEXT,
    consequence TEXT,
    remedy TEXT,
    manufacturer VARCHAR(255),
    issue_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    vin VARCHAR(17),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    component VARCHAR(255),
    description TEXT,
    state VARCHAR(10),
    crash BOOLEAN DEFAULT FALSE,
    fire BOOLEAN DEFAULT FALSE,
    injury BOOLEAN DEFAULT FALSE,
    complaint_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_make_model_year ON vehicles (make, model, year);
CREATE INDEX idx_complaints_vehicle_id ON complaints(vehicle_id);
CREATE INDEX idx_recalls_vehicle_id ON recalls(vehicle_id);
