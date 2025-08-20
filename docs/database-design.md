Database Design
This schema enables dynamic product categories with custom, typed attributes, and products whose attribute values are validated and stored efficiently. It follows the Entity–Attribute–Value (EAV) pattern to maximize flexibility while preserving normalization and integrity.

ERD

See: docs/images/erd-diagram.png

Design goals

Flexibility: Add new categories/attributes without schema changes.

Integrity: Enforce referential constraints and uniqueness.

Typed validation: Store values in typed columns with rules.

Performance: Use selective indexing and unique constraints.

Extensibility: Support hierarchy, options, and future validation rules.

Core entities

categories

id (UUID, PK)

name (string, unique)

slug (string, unique)

description (string, nullable)

parentId (UUID, FK → categories.id, nullable)

isActive (bool, default true)

createdAt (timestamp, default now)

updatedAt (timestamp, updatedAt)

Purpose: Defines the product taxonomy; supports hierarchy via parentId.

category_attributes

id (UUID, PK)

categoryId (UUID, FK → categories.id, onDelete: CASCADE)

name (string)

slug (string)

dataType (enum: TEXT, NUMBER, BOOLEAN, DATE, ENUM)

isRequired (bool, default false)

displayOrder (int, default 0)

minNumber (decimal, nullable)

maxNumber (decimal, nullable)

regex (string, nullable)

maxLength (int, nullable)

hint (string, nullable)

createdAt (timestamp)

updatedAt (timestamp)

Indexes/constraints:

Unique (categoryId, name)

Unique (categoryId, slug)

Index on (categoryId, displayOrder)

Purpose: Defines attributes that apply to a specific category and how they are validated.

attribute_options (for ENUM)

id (UUID, PK)

categoryAttributeId (UUID, FK → category_attributes.id, onDelete: CASCADE)

value (string)

code (string, nullable)

sortOrder (int, default 0)

isDefault (bool, default false)

createdAt, updatedAt

Indexes/constraints:

Unique (categoryAttributeId, value)

Index (categoryAttributeId, sortOrder)

Purpose: Selectable options for ENUM attributes.

products

id (UUID, PK)

name (string)

sku (string, unique)

description (string, nullable)

price (decimal)

stockQuantity (int, default 0)

status (enum: DRAFT, ACTIVE, INACTIVE; default DRAFT)

isActive (bool, default true)

categoryId (UUID, FK → categories.id)

createdAt, updatedAt

Indexes/constraints:

Unique (sku)

Index (categoryId)

Index (status)

Purpose: Core product entity associated to a single category (can be extended to multi-category later).

product_attribute_values (typed EAV)

id (UUID, PK)

productId (UUID, FK → products.id, onDelete: CASCADE)

categoryAttributeId (UUID, FK → category_attributes.id, onDelete: CASCADE)

valueText (string, nullable)

valueNumber (decimal, nullable)

valueBool (bool, nullable)

valueDate (date/timestamp, nullable)

optionId (UUID, FK → attribute_options.id, nullable)

createdAt, updatedAt

Indexes/constraints:

Unique (productId, categoryAttributeId)

Index (categoryAttributeId)

Index (optionId)

Optional partial/functional indexes for search hot paths.

Purpose: Stores the actual value for each attribute of a product, using the appropriate typed column or optionId for ENUM.

Validation model (service-level)

TEXT → enforce maxLength and regex.

NUMBER → enforce minNumber and maxNumber.

BOOLEAN → ensure boolean.

DATE → ensure valid date.

ENUM → ensure valid optionId referencing attribute_options for the same attribute.

Activation rule

A product may be set to ACTIVE only when all isRequired attributes for its category have values in product_attribute_values.

Hierarchy & future-proofing

Category hierarchy via parentId.

ENUM options with default and ordering.

Easy to add rule tables for conditional validations or cross-attribute checks if needed.

Performance considerations

Use selective indexing on foreign keys and frequently filtered columns (categoryId, status).

Add composite indexes to accelerate common queries (e.g., product filters).

Consider caching resolved attribute metadata per category for dynamic forms.

Multi-category extension (optional)

Add product_categories (productId, categoryId, PK on both).

Resolve applicable attributes across all linked categories before validation.

Rationale recap

Scalability: EAV supports infinite attributes without schema changes.

Normalization: No duplication of attribute metadata; values are atomic and typed.

Integrity: FK constraints and uniqueness enforce correctness.

Extensibility: Ready for rules, multi-category, and new data types.

docs/class-design.md

