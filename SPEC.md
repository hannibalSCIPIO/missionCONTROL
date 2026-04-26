# Mission Control - Specification

## Project Overview
- **Name:** Jeff's Mission Control
- **Type:** Next.js Web Application
- **Core Functionality:** Personal command center with YouTube summarizer, calendar/tasks, and custom tools builder
- **Target User:** Jeff (business owner, multiple ventures)

## UI/UX Specification

### Layout Structure
- **Sidebar (Left):** 240px fixed width, dark (#0F0F0F), contains navigation
- **Main Content:** Flexible width, max-width 1400px centered
- **Header:** 56px height, sticky, contains page title and actions

### Visual Design (Linear-inspired)

#### Color Palette
- **Background Primary:** #0F0F0F (deep black)
- **Background Secondary:** #161616 (cards/panels)
- **Background Tertiary:** #1E1E1E (hover states)
- **Border:** #2A2A2A (subtle borders)
- **Text Primary:** #EDEDEF (white)
- **Text Secondary:** #A1A1AA (muted)
- **Text Tertiary:** #71717A (disabled)
- **Accent Primary:** #8B5CF6 (violet - Linear's signature)
- **Accent Secondary:** #A78BFA (light violet)
- **Success:** #22C55E (green)
- **Warning:** #F59E0B (amber)
- **Error:** #EF4444 (red)

#### Typography
- **Font Family:** "Inter", -apple-system, BlinkMacSystemFont, sans-serif
- **Headings:** 
  - H1: 24px, 600 weight
  - H2: 18px, 600 weight
  - H3: 14px, 500 weight
- **Body:** 14px, 400 weight
- **Small:** 12px, 400 weight
- **Monospace:** "JetBrains Mono", monospace (for code)

#### Spacing System
- **Base unit:** 4px
- **XS:** 4px
- **SM:** 8px
- **MD:** 16px
- **LG:** 24px
- **XL:** 32px
- **2XL:** 48px

#### Visual Effects
- **Border Radius:** 6px (buttons), 8px (cards), 12px (modals)
- **Shadows:** None (flat design, rely on borders)
- **Transitions:** 150ms ease for hover states

### Components

#### Sidebar
- Logo/Title at top
- Navigation items with icons
- Active state: violet background (#8B5CF6/10), violet text
- Hover: #1E1E1E background

#### Cards
- Background: #161616
- Border: 1px solid #2A2A2A
- Padding: 16px
- Border-radius: 8px

#### Buttons
- **Primary:** Violet background (#8B5CF6), white text
- **Secondary:** Transparent, border #2A2A2A, white text
- **Ghost:** Transparent, no border, muted text
- Height: 32px, padding: 0 12px, font-size: 13px

#### Inputs
- Background: #0F0F0F
- Border: 1px solid #2A2A2A
- Focus border: #8B5CF6
- Height: 36px, padding: 0 12px
- Border-radius: 6px

#### Checkbox
- Custom styled, 16x16px
- Unchecked: border #2A2A2A
- Checked: violet background with white checkmark

## Functionality Specification

### Pages/Tabs

#### 1. Dashboard (Home)
- Quick stats cards (4 across)
- Today's tasks list
- Recent activity
- Quick actions

#### 2. YouTube Summarizer
- Input field for YouTube URL
- "Get Captions" button
- Loading state with spinner
- Captions display (scrollable)
- "Summarize" button to generate teaching material
- Summary output with sections:
  - Key Takeaways (bullet points)
  - Main Concepts (expandable)
  - Action Items
  - Study Notes (formatted)

#### 3. Calendar & Tasks
- Monthly calendar view (current month)
- Tasks displayed on their due dates
- Task states: Todo, In Progress, Done
- Drag-and-drop between states (visual only, simple implementation)
- Add new task modal
- Task fields: Title, Description, Due Date, Status, Priority

#### 4. Custom Tools
- List of available custom tools
- "Create Tool" button
- Tool configuration form:
  - Name
  - Description
  - Code/Function (JavaScript)
- Run tool functionality
- Tool output display

### Data Handling
- All data stored in localStorage
- Data structure:
  - `mc_tasks`: Array of task objects
  - `mc_tools`: Array of custom tool objects
  - `mc_summaries`: Array of YouTube summaries

### Edge Cases
- Invalid YouTube URL: Show error message
- Network error fetching captions: Show retry option
- Empty states: Show helpful prompts
- Long text: Truncate with ellipsis, expand on click

## Acceptance Criteria

1. ✅ App loads without errors on localhost:3000
2. ✅ Dark Linear-like UI is consistent throughout
3. ✅ Sidebar navigation works between all 4 pages
4. ✅ YouTube URL input accepts valid URLs
5. ✅ Tasks can be added, edited, and marked complete
6. ✅ Calendar displays current month with tasks
7. ✅ Custom tools can be created and listed
8. ✅ All data persists across page refreshes (localStorage)
9. ✅ Responsive: Works on desktop (1024px+)
10. ✅ No console errors on normal operation