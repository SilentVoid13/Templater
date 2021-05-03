module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Templater',
      items: [
        'introduction',
        'installation',
        'terminology',
        'syntax',
        'settings',
        'faq',
      ],
    },
    {
      type: 'category',
      label: 'Internal Variables and Functions',
      items: [
        'internal-variables-functions/overview',
        {
          type: 'category',
          label: 'Internal Modules',
          items: [
            'internal-variables-functions/internal-modules/config-module',
            'internal-variables-functions/internal-modules/date-module',
            'internal-variables-functions/internal-modules/file-module',
            'internal-variables-functions/internal-modules/frontmatter-module',
            'internal-variables-functions/internal-modules/obsidian-module',
            'internal-variables-functions/internal-modules/system-module',
            'internal-variables-functions/internal-modules/web-module',
          ],
        },
        'internal-variables-functions/contribute',
      ],
    },
    {
      type: 'category',
      label: 'User Functions',
      items: [
        'user-functions/overview',
        'user-functions/script-user-functions',
        'user-functions/system-user-functions',
      ],
    },
    {
      type: 'category',
      label: 'Commands',
      items: [
        'commands/overview',
        'commands/execution-command',
        'commands/dynamic-command',
        'commands/whitespace-control',
      ],
    },
  ],
};
