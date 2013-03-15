DROP TABLE IF EXISTS facility_approved_products;
CREATE TABLE facility_approved_products (
    id SERIAL PRIMARY KEY,
    facilityTypeId INTEGER REFERENCES facility_types(id) NOT NULL,
    programProductId INTEGER REFERENCES program_products(id) NOT NULL,
    maxMonthsOfStock INTEGER NOT NULL,
    modifiedBy INTEGER,
    modifiedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdDate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (facilityTypeId, programProductId)
);
