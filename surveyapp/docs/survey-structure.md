# Survey Structure

## Class Diagram

```mermaid
classDiagram
    class FHIRQuestionnaire {
        +String resourceType
        +String id
        +String title
        +String description
        +String status
        +String date
        +FHIRQuestionItem[] item
        +Meta meta
    }

    class Meta {
        +Tag[] tag
    }

    class Tag {
        +String system
        +String code
        +String display
    }

    class FHIRQuestionItem {
        +String linkId
        +QuestionType type
        +Boolean required
        +String text
        +String helpText
        +FHIRChoice[] answerOption
        +Validation validation
        +FHIRQuestionItem[] item
        +Extension[] extension
    }

    class FHIRChoice {
        +String valueString
        +Coding valueCoding
    }

    class Coding {
        +String system
        +String code
        +String display
    }

    class Validation {
        +Number min
        +Number max
    }

    class SurveyDefinition {
        +SurveyTranslation[] translations
    }

    class SurveyTranslation {
        +String language
        +String title
        +String description
        +TranslatedItem[] item
    }

    class TranslatedItem {
        +String linkId
        +String text
        +String helpText
    }

    FHIRQuestionnaire <|-- SurveyDefinition
    FHIRQuestionnaire "1" *-- "many" FHIRQuestionItem
    FHIRQuestionnaire "1" *-- "1" Meta
    Meta "1" *-- "many" Tag
    FHIRQuestionItem "1" *-- "many" FHIRChoice
    FHIRQuestionItem "1" *-- "1" Validation
    FHIRQuestionItem "1" *-- "many" FHIRQuestionItem
    FHIRChoice "1" *-- "1" Coding
    SurveyDefinition "1" *-- "many" SurveyTranslation
    SurveyTranslation "1" *-- "many" TranslatedItem
```

## Key Relationships

1. **FHIRQuestionnaire** is the base class that follows the FHIR standard
   - Contains metadata about the survey
   - Has a collection of questions (items)

2. **SurveyDefinition** extends FHIRQuestionnaire
   - Adds support for multiple language translations
   - Inherits all FHIR Questionnaire properties

3. **FHIRQuestionItem** represents individual questions
   - Can have nested questions (item array)
   - Supports different question types
   - Includes validation rules
   - Has answer options with SNOMED CT coding

4. **SurveyTranslation** provides language-specific content
   - Maps to the original questions via linkId
   - Contains translated text and help text
   - Maintains the same structure across languages

## Question Types

```typescript
type QuestionType = 'boolean' | 'choice' | 'text' | 'number' | 'snomed';
```

## Validation Rules

- Number questions have min/max constraints
- Required fields are marked with required=true
- Choice questions have predefined options with SNOMED CT codes

## Language Support

- Each survey can have multiple translations
- Translations maintain the same structure as the original
- Questions are linked via linkId for consistency 