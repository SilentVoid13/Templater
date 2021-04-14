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
            'internal-variables-functions/internal-modules/date-module',
            'internal-variables-functions/internal-modules/file-module',
            'internal-variables-functions/internal-modules/frontmatter-module',
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
      ],
    },
    {
      type: 'category',
      label: 'Eta features',
      items: [
        'eta-features/overview',
        'eta-features/execution-command',
        'eta-features/whitespace-control',
      ],
    },
  ],
};
