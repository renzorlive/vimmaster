# How to Contribute a Lesson

Welcome to VIM Master! We believe the best way to learn Vim is through an interactive curriculum built by the community. You can contribute a new lesson without writing a single line of code!

## Core Philosophy: "One JSON = One Lesson"

Every lesson in VIM Master is just a simple `.json` file located in `content/lessons/`.
If you want to teach a new Vim command, you just create a JSON file.

### Lesson Design Rules
1. **Focus on one thing:** A lesson should teach a single concept. Don't teach `cw`, `caw`, and `ciw` in the same lesson.
2. **Short and sweet:** A good lesson takes less than 60 seconds to complete. 
3. **Clear Target:** Ensure the user knows exactly what the win condition is.

## Step-by-Step Guide

### 1. Fork and Clone
Fork the repository and clone it to your local machine.

### 2. Copy the Example
Copy `content/schema/example.lesson.json` to `content/lessons/lesson-your-topic-here.json`.
**Important:** The file name must match the `id` field exactly and must follow the slug format `lesson-[a-z0-9-]+`.

### 3. Fill in the Fields
Open your new JSON file and fill in the details. Pay special attention to:

- `author`: Your name or alias.
- `githubUsername`: Your GitHub handle (so we can credit you!).
- `prerequisites`: An array of lesson IDs that the user should complete before this one.
- `learningObjectives`: A list of strings describing what the user will learn.
- `initialContent`: The starting state of the text buffer.
- `solution`: A sequence of keystrokes that solves the lesson perfectly. This is used by our **Golden Test** suite to ensure your lesson can be completed!
- `target` / `targetContent` / `targetText`: Your win condition.

### 4. Validate Your Lesson
Run the following command to validate your lesson locally:
```bash
npm run check
```
This will run the **Contract Suite** (which checks your JSON schema) and the **Golden Suite** (which literally plays your `solution` keystrokes in the engine and verifies the win condition is met).

If `npm run check` passes, your lesson is perfect!

### 5. Open a Pull Request
Commit your new JSON file and open a Pull Request. That's it!
