/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Templater',
  tagline: 'A template language that lets you insert variables and functions results into your obsidian notes',
  url: 'https://silentvoid13.github.io',
  baseUrl: '/Templater/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'SilentVoid13',
  projectName: 'Templater',
  themeConfig: {
    navbar: {
      title: 'Templater',
      logo: {
        alt: 'Templater logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/SilentVoid13/Templater',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/SilentVoid13/Templater',
            },
          ],
        },
      ],
    },
    algolia: {
      apiKey: '78344c033242ee5c5fe681188a73b988',
      indexName: 'templater',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/SilentVoid13/Templater/docs/edit/master/',
        },
      },
    ],
  ],
};
