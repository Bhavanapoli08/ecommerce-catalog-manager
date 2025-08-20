Class Design
This class model mirrors the database while encapsulating validation and lifecycle behavior. It keeps responsibilities clear and enables future extension (multi-category products, conditional rules).

Class diagram

See: docs/images/class-diagram.png

Key classes and responsibilities
Category

Fields: id, name, slug, description, parentId, isActive, createdAt, updatedAt

Methods:

addCategory(): Category

updateCategory(): void

getSubcategories(): List<Category>

validateHierarchy(): void

Notes: Encapsulates parent/child logic and category lifecycle.

CategoryAttribute

Fields: id, categoryId, name, slug, dataType, isRequired, displayOrder, minNumber, maxNumber, regex, maxLength, hint, createdAt, updatedAt

Methods:

defineAttribute(): CategoryAttribute

updateAttribute(): void

getValidationRules(): Map

validateValue(value): ValidationResult

Notes: Central definition + validation metadata per category.

AttributeOption

Fields: id, categoryAttributeId, value, code, sortOrder, isDefault, createdAt, updatedAt

Methods:

addOption(): AttributeOption

updateOption(): void

setDefault(): void

reorder(newOrder: int): void

Notes: Options only valid for ENUM attributes.

Product

Fields: id, categoryId, name, sku, description, price, stockQuantity, status, isActive, createdAt, updatedAt

Methods:

createProduct(): Product

updateProduct(): void

activate(): void

deactivate(): void

validateRequiredAttributes(): ValidationResult

getAttributeValues(): List<ProductAttributeValue>

Notes: Enforces required attributes at activation; coordinates attribute values.

ProductAttributeValue

Fields: id, productId, categoryAttributeId, valueText, valueNumber, valueBool, valueDate, optionId, createdAt, updatedAt

Methods:

setValue(raw): void

updateValue(raw): void

validateType(): ValidationResult

getTypedValue(): any

Notes: Enforces type-correctness before persisting.

ValidationRule (optional)

Fields: id, categoryId, ruleType (conditional | cross_attribute | custom), ruleExpression (JSON), errorMessage, isActive

Methods:

evaluate(values: Map): ValidationResult

Notes: Enables advanced rule logic (e.g., “if Size=XL then Length≥40”).

ValidationEngine (optional)

Methods:

validateProduct(p: Product): ValidationResult

validateConditional(p: Product): ValidationResult

validateCrossAttribute(p: Product): ValidationResult

Notes: Coordinates rule evaluation at save/activation time.

Relationships

Category 1..* CategoryAttribute (composition)

CategoryAttribute 1..* AttributeOption (composition)

Product 1..* ProductAttributeValue (composition)

ProductAttributeValue *..1 CategoryAttribute

Product *..1 Category

ValidationEngine ..> ValidationRule (uses)

Design principles

Single Responsibility: Each class owns a single area (taxonomy, attribute metadata, value storage, validation).

Open/Closed: Adding data types or rules requires minimal changes (strategy-friendly).

Encapsulation: Validation logic lives with metadata providers (CategoryAttribute/ValidationEngine), not scattered across controllers.

Extensibility: Multi-category, conditional rules, and more data types can be introduced without breaking existing flows.

How UI uses this model

Dynamic forms: Read CategoryAttribute definitions to render inputs by dataType; for ENUM, load AttributeOption sorted by sortOrder; apply hints and constraints (regex, maxLength, min/max).

Validation feedback: On submit, backend re-validates using the same rules to ensure consistency.
