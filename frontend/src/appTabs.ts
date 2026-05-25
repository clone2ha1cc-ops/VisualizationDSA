/**
 * Cấu hình tabs navigation cho App.vue.
 * Thêm tab mới: chỉ cần thêm entry vào mảng này + tạo route + tạo View.
 */
export const APP_TABS = [
  { id: 'sorting',      path: '/sorting',      name: 'Sorting'        },
  { id: 'dsa',          path: '/dsa',           name: 'DSA Modules'    },
  { id: 'animation',    path: '/animation',     name: 'Animation'      },
  { id: 'code-ide',     path: '/code-ide',      name: 'Code IDE'       },
  { id: 'compare',      path: '/compare',       name: 'So sánh'        },
  { id: 'concurrency',  path: '/concurrency',   name: 'Đa luồng'       },
  { id: 'debug',        path: '/debug',         name: 'Debug'          },
  { id: 'graph',        path: '/graph',         name: 'Graph'          },
  { id: 'playground',   path: '/playground',    name: 'Playground'     },
  { id: 'oop',          path: '/oop',           name: 'OOP'            },
  { id: 'solid',        path: '/solid',         name: 'SOLID'          },
  { id: 'di',           path: '/di',            name: 'DI/IoC'         },
  { id: 'patterns',     path: '/patterns',      name: 'Patterns'       },
  { id: 'state',        path: '/state',         name: 'Stack/Heap'     },
  { id: 'system',       path: '/system',        name: 'System'         },
  { id: 'quiz',         path: '/quiz',          name: 'Quiz'           },
  { id: 'gamification', path: '/gamification',  name: 'Gamification'   },
  { id: 'leaderboard',  path: '/leaderboard',   name: 'Leaderboard' },
] as const;
