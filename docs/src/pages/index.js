import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Build powerful templates',
    imageUrl: 'img/logo3.svg',
    description: (
      <>
        Tired of having to input the same informations manually for each of your files? Automate everything with Templater.
      </>
    ),
  },
  {
    title: 'Use User / Internal variables and functions',
    imageUrl: 'img/terminal_logo.svg',
    description: (
      <>
        Enjoy pre-existing internal variables and functions built within Templater. Define your own user functions using system commands.
      </>
    ),
  },
  {
    title: 'Uses the Eta templating engine',
    imageUrl: 'img/eta_logo.svg',
    description: (
      <>
        Templater uses the <a href="https://eta.js.org/">Eta</a> templating engine. Enjoy every feature of <a href="https://eta.js.org/">Eta</a> using Templater!
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`Obsidian ${siteConfig.title} Plugin`}
      description="A template language that lets you insert variables and functions results into your obsidian notes">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
