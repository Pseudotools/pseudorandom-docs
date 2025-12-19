import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  href: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Render 3d Models with Pseudorandom for Rhino',
    Svg: require('@site/static/img/pseudorandom-splash-01.svg').default,
    description: (
      <>
        Render 3d Models with Pseudorandom for Rhino. Learn how to create
        3D renderings using the Pseudorandom plugin.
      </>
    ),
    href: '/docs/pseudorandom',
  },
  {
    title: 'Develop Custom Workflows with Pseudocomfy',
    Svg: require('@site/static/img/pseudorandom-splash-02.svg').default,
    description: (
      <>
        Develop Custom Workflows with Pseudocomfy. Build custom workflows
        that connect Rhino models to ComfyUI.
      </>
    ),
    href: '/docs/pseudocomfy',
  },
  {
    title: 'Create an Account',
    Svg: require('@site/static/img/pseudorandom-splash-03.svg').default,
    description: (
      <>
        Create an Account to get started with Pseudotools. Sign up for access to
        all features and start building.
      </>
    ),
    href: 'https://accounts.pseudotools.com',
  }
];

function Feature({title, Svg, description, href}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={href} className={styles.featureLink}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
