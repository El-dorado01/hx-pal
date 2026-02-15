# hx-pal 🩺

**hx-pal** (History-Pal) is an intelligent medical history-taking assistant designed to guide medical students through the critical process of clinical interviewing. It ensures that no vital information is missed, helps structure clinical reasoning, and provides a polished summary with potential differential diagnoses.

---

## 🌟 Key Features

### 1. Dual-Assistance Modes

- **💡 Hint-Assisted Mode**:
  - Designed for experienced students.
  - Provides non-intrusive real-time feedback (e.g., "You've gathered great info on the HPI, but don't forget to check the character of the pain").
  - Enables students to drive the conversation while keeping a "safety net" in the background.
- **🚀 Fully-Assisted Mode**:
  - Designed for junior students.
  - Proactively suggests the "Next Best Question" or "Next Critical Step" based on the current stage and patient profile.
  - Guides the user step-by-step through the standard medical sequence.

### 2. Standardized Medical Sequence

The tool follows the universal clinical clerkship structure:

1.  **Biodata** (Age, Gender, Occupation, etc.)
2.  **Chief Complaint (CC)**
3.  **History of Presenting Illness (HPI)**
4.  **Past Medical History (PMH)**
5.  **Drug History & Allergies (DH)**
6.  **Family History (FH)**
7.  **Social History (SH)**
8.  **Review of Systems (ROS)**
9.  **Summary & Differentials**

### 3. Intelligent Analysis

- **Real-time Logic**: Automatically triggers specific checklists (e.g., SOCRATES for pain, 5Ps for sexual history) based on user input.
- **Summary Generation**: Transforms messy notes into a professional medical report.
- **Differential Diagnosis (DDx)**: Provides ranked likely diagnoses based on findings.

---

## 🛠 Tech Stack

| Category             | Technology                                      |
| :------------------- | :---------------------------------------------- |
| **Framework**        | Next.js 15+ (App Router)                        |
| **Styling**          | Vanilla CSS / Tailwind CSS (Glass UI Aesthetic) |
| **State Management** | React Context / Zustand                         |
| **Intelligence**     | Gemini / OpenAI (LLM for Clinical Reasoning)    |
| **Components**       | Radix UI / Shadcn (for accessibility and speed) |
| **Deployment**       | Vercel                                          |

---

## 🚀 Execution Plan

### Phase 1: Core Scaffolding (Current)

- [x] Configure Project & MCP settings.
- [ ] Implement the **Stage Manager** (Multi-step flow engine).
- [ ] Build the **Glass UI** layout (Workspace + Assistant Panel).
- [ ] Define shared medical types and data structures.

### Phase 2: Intelligence Layer

- [ ] Implement local rule-based triggers for basic checklists.
- [ ] Integrate AI API for "Hints" and "Dynamic Questioning".
- [ ] Build the "Summary & DDx" generator.

### Phase 3: Polish & Export

- [ ] Mobile-responsive optimization for ward rounds.
- [ ] PDF/Text export for student portfolios.
- [ ] Local storage persistence for session recovery.

---

## 📖 How to Use (For AI Assistants)

This project uses the Model Context Protocol (MCP). See [MCP.md](file:///c:/Users/hp/Desktop/hx-pal/MCP.md) for details on how to use AI to build components directly using the Glass UI registry.
