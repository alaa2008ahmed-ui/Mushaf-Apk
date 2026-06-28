# Project Rules

## Database Preservation
**CRITICAL**: The user has explicitly mandated that the current database structure and implementation must be preserved exactly as is. 
- DO NOT generate or modify database schemas, Firestore rules, or storage services (`DualStorageService.ts`, `firebase.ts`, `firebase-blueprint.json`, `firestore.rules`) unless explicitly requested to bypass this rule.
- Do not attempt to re-architect or refactor the database layer.

## English Language Requirement
**CRITICAL**: The entire application user interface (UI), controls, buttons, modals, and notifications MUST be strictly and completely in English. Do NOT add any Arabic or bilingual translations (e.g., bilingual separators like `|`) anywhere in the app interface. Any future additions or modifications must adhere to English text only.
