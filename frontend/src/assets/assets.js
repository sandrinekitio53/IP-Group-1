// All landing page content lives here. Edit text in this file, not in Landing.jsx.

export const NAV = [
  ['problem', 'Problem'],
  ['features', 'Features'],
  ['preview', 'Preview'],
  ['how', 'How it works'],
  ['roles', 'Roles'],
  ['faq', 'FAQ'],
];

export const FEATURES = [
  ['Authentication and per-project roles', 'Secure sign-in, and a role on each project: project manager, developer or tester.'],
  ['Project and team management', 'Create projects, invite members, and see who belongs to which team.'],
  ['Task and bug management', 'Create, edit, assign and delete work, with a clear status workflow from start to finish.'],
  ['Kanban board with drag-and-drop', 'Drag cards between To Do, In Progress, Testing and Done. Everyone sees the same live board.'],
  ['Comments, attachments and notifications', 'Discuss on the card, attach screenshots, and get notified in the app or by email.'],
  ['Reports and charts', 'Tasks done vs pending and bugs by priority, so leaders see overall progress.'],
  ['REST API', 'Every feature is available through an API, with optional GitHub integration.'],
];

export const STEPS = [
  ['Create a project', 'Name it, set a deadline, and invite your teammates.'],
  ['Break it into tasks', 'Write tasks, set priority from low to critical, and assign each one.'],
  ['Report bugs as they appear', 'Testers file a bug with steps and a screenshot instead of a voice note.'],
  ['Track it to done', 'Move cards across the board and watch the charts update.'],
];

export const ROLES = [
  ['Project manager', 'Sees overall progress, assigns work, and keeps deadlines in view.'],
  ['Developer', 'Picks up tasks and bugs, updates status, and comments on the card.'],
  ['Tester', 'Files bug reports with steps to reproduce and follows each fix to Testing.'],
];

// priority: crit | high | med | low
export const BOARD = {
  'To Do': [
    { id: 1, t: 'Design login page', p: 'med' },
    { id: 2, t: 'Write API docs', p: 'low' },
  ],
  'In Progress': [{ id: 3, t: 'Build Kanban board', p: 'high' }],
  'Testing': [{ id: 4, t: 'Fix upload bug', p: 'crit' }],
  'Done': [
    { id: 5, t: 'Set up database', p: 'med' },
    { id: 6, t: 'Auth and roles', p: 'high' },
  ],
};

// Example data used by the preview section (illustration only)
export const TASK_CHART = [['Done', 14, 'ok'], ['In progress', 6, 'mid'], ['Pending', 9, 'low']];
export const BUG_CHART = [['Critical', 2, 'crit'], ['High', 5, 'high'], ['Medium', 8, 'mid'], ['Low', 4, 'low']];
export const DUE_SOON = [['Design login page', 'Tomorrow'], ['Write API docs', 'In 3 days'], ['Fix upload bug', 'Friday']];

export const TASK_CARD = {
  title: 'Build Kanban board',
  desc: 'Drag cards between columns and save the new status.',
  fields: [['Priority', 'High'], ['Assignee', 'Alice'], ['Deadline', '12 Dec'], ['Attachments', '2 screenshots']],
  comment: ['Ben', 'Tested on mobile, drag works.'],
};

export const BUG_FORM = [
  ['Title', 'Upload fails for PNG files'],
  ['Steps to reproduce', 'Open a task, then attach a PNG'],
  ['Expected result', 'The file uploads'],
  ['Actual result', 'An error message appears'],
  ['Severity', 'High'],
  ['Screenshot', 'upload-error.png'],
];

export const ACTIVITY = [
  ['Alice', 'moved Task #12 to Done', '14:30'],
  ['Ben', 'reported Bug #7: upload fails', '13:05'],
  ['Carla', 'commented on Task #9', '11:48'],
  ['Alice', 'assigned Task #15 to Ben', '09:20'],
];

export const FAQ = [
  ['Who can see my project?', 'Only the people you add to it. Each person gets a role on that project.'],
  ['Which roles are there?', 'Project manager, developer and tester, so each person sees the tools they need.'],
  ['Can I report a bug without creating a task first?', 'Yes. The bug form creates a bug card directly, with steps, severity and a screenshot.'],
  ['How will I know when something changes?', 'You get notifications in the app or by email, and the activity log records every change.'],
  ['Does it replace our group chat?', 'It replaces the task and bug talk. Keep chatting there, and keep the work here.'],
];
