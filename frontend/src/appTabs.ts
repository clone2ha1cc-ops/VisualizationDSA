export interface TabItem {
  readonly id: string;
  readonly path: string;
  readonly name: string;
  readonly requiresAuth?: boolean;
  readonly requiresRole?: string;
}

export interface TabGroup {
  readonly groupName: string;
  readonly items: readonly TabItem[];
}

export const APP_TABS: readonly (TabGroup | TabItem)[] = [
  {
    groupName: 'Algorithms',
    items: [
      { id: 'sorting',  path: '/sorting',  name: 'Sorting' },
      { id: 'graph',    path: '/graph',    name: 'Graph' },
      { id: 'code-ide', path: '/code-ide', name: 'Code Debugger' }
    ]
  },
  {
    groupName: 'Concepts',
    items: [
      { id: 'oop',      path: '/oop',      name: 'OOP Viz' },
      { id: 'solid',    path: '/solid',    name: 'SOLID Viz' },
      { id: 'patterns', path: '/patterns', name: 'Patterns' },
      { id: 'di',       path: '/di',       name: 'DI/IoC' },
      { id: 'system',   path: '/system',   name: 'System Design' }
    ]
  },
  {
    groupName: 'Interactive',
    items: [
      { id: 'quiz',          path: '/quiz',          name: 'Quiz' },
      { id: 'gamification',  path: '/gamification',  name: 'Leaderboard' },
    ]
  },
  {
    groupName: 'Account',
    items: [
      { id: 'dashboard', path: '/dashboard', name: 'Dashboard', requiresAuth: true },
      { id: 'checkout',  path: '/checkout',  name: 'Premium' },
      { id: 'teacher',   path: '/teacher',   name: 'Teacher Panel', requiresAuth: true, requiresRole: 'Teacher' },
    ]
  },
] as const;
