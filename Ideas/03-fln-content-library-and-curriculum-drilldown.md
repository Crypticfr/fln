# Proposal: FLN Content Library & 93-Level Curriculum Drilldown

## 1. Executive Summary
This proposal introduces an interactive FLN Content Library and Level Detail Drilldown system. It allows educators, curriculum designers, and administrators to explore all 93 levels of the foundational literacy and numeracy curriculum across 7 class groupings (Preschool 1 through Class 4), inspect sub-level scaffolding, view learning outcomes, and preview question bank items.

---

## 2. Problem Statement & Motivation
- **Static Curriculum Knowledge**: The 93 FLN competency levels and sub-levels existed as disconnected markdown files on disk without an interactive UI for exploration.
- **Teacher Pedagogical Scaffolding**: Teachers need immediate visual insight into the sub-level progression:
  - `.0` Core Grade Mastery
  - `.1` Guided Remediation (Scaffolded hints)
  - `.2` Concrete Foundational Support (Object-mediated / pictorial)
- **Question Bank Visibility**: Teachers and administrators needed a way to verify questions and answers assigned to each level before printing worksheets or conducting diagnostic assessments.

---

## 3. Architecture & Technical Design

### A. Dynamic Markdown Parser
- Reads and parses raw markdown files from the `FLN Levels Structure/` directory on demand.
- Extracts structured metadata:
  - Learning Objectives (`## Objective`)
  - Conceptual Descriptions (`## Description`)
  - Measurable Learning Outcomes (`## Learning Outcome`)
  - Sub-level breakdowns (`## Topics Covered` and sub-level markdown files `X.0.md`, `X.1.md`, `X.2.md`).

### B. Question Bank Association & Synthesis
- Cross-references the level number with `data/questionBank.json`.
- Dynamically loads and renders questions, answers, and SVG illustrations associated with each level.
- Provides fallback programmatic generation via `QuestionService` if questions are not yet statically indexed.

---

## 4. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/content/levels` | Returns a list of all 93 curriculum levels with summary metadata and question counts |
| `GET` | `/api/content/levels/:levelId` | Returns comprehensive detail for a level (objectives, outcomes, sub-levels, topics) |
| `GET` | `/api/content/levels/:levelId/questions` | Returns all questions, options, answers, and SVG snippets for the level |
| `GET` | `/api/content/search?q=...` | Full-text search across levels, strands, concepts, and questions |

---

## 5. Data Model (`LevelDetailPayload`)

```typescript
export interface SubLevelInfo {
  subLevel: number;
  title: string;
  content: string;
}

export interface LevelDetailPayload {
  levelNumber: number;
  levelTitle: string;
  stage: number;
  classGroup: string;
  ageGroup: string;
  strand: string;
  conceptId: string;
  objective: string;
  description: string;
  learningOutcome: string;
  topicsCovered: string[];
  subLevels: SubLevelInfo[];
  questionCount: number;
}
```

---

## 6. Frontend UI Components

1. **Content Library Panel (`ContentPanelView`)**:
   - Filter by class group (`Preschool 1`, `Preschool 2`, `Preschool 3`, `Class 1`, `Class 2`, `Class 3`, `Class 4`).
   - Search bar filtering by level title, concept strand, or level number.
   - Responsive card grid showing Level number, Strand badge, and Class tag.
2. **Interactive Level Detail Modal (`LevelDetailModal.tsx`)**:
   - **Overview Tab**: Objectives, descriptions, and learning outcomes with rich typography.
   - **Sub-Levels Tab**: Interactive accordion inspecting `.0` Core, `.1` Remediation, and `.2` Concrete Foundational scaffolds.
   - **Question Bank Tab**: Live questions, expected answers, and rendered SVG diagram snippets.
   - **Direct Actions**: One-click action to generate/print level worksheets.
