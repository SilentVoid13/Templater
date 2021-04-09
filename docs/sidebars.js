module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Templater',
      items: [
        'getting-started',
        'installation',
        'terminology',
        'syntax',
        'settings',
      ],
    },
    {
      type: 'category',
      label: 'Internal Commands',
      items: [
        'internal-commands/overview',
        {
          type: 'category',
          label: 'Internal Modules',
          items: [
            'internal-commands/internal-modules/overview',
            'internal-commands/internal-modules/date-module',
            'internal-commands/internal-modules/file-module',
            'internal-commands/internal-modules/frontmatter-module',
            'internal-commands/internal-modules/web-module',
          ],
        },
        'internal-commands/develop-internal-commands',
      ],
    },
    {
      type: 'category',
      label: 'Eta features',
      items: [
        'eta-features/overview',
      ],
    },
  ],
};
