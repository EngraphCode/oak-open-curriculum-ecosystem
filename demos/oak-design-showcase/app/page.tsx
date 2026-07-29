import type { ReactElement } from 'react';

import { ButtonsSpecimen } from '../components/ButtonsSpecimen';
import { CardSpecimen } from '../components/CardSpecimen';
import { Hero } from '../components/Hero';
import { SiteFooter } from '../components/SiteFooter';
import Switchboard from '../components/Switchboard';
import { TagsSpecimen } from '../components/TagsSpecimen';
import { TypeSpecimen } from '../components/TypeSpecimen';

/**
 * The showcase landing: the kit's region contract (an .oak-canvas grid over
 * sibling data-regions, kit docs §6) under the shipped `home` composition
 * map, with
 * the identity × theme switchboard in the utility region. Every visible
 * value on this page resolves through the kit's token contract — that IS
 * the product being demonstrated.
 */
export default function ShowcasePage(): ReactElement {
  return (
    <div className="oak-canvas" data-page="home">
      <div className="oak-region util" data-region="utility">
        <div className="oak-container util-inner">
          <Switchboard />
        </div>
      </div>
      <header className="oak-region mast" data-region="masthead">
        <div className="oak-container oak-cluster mast-inner">
          <span className="oak-heading-6 brand-name">Design system showcase</span>
        </div>
      </header>
      <main className="oak-main oak-region" data-region="main">
        <Hero />
        <section className="oak-region" data-region="content">
          <div className="oak-container oak-stack oak-stack--l content-inner">
            <TypeSpecimen />
            <ButtonsSpecimen />
            <TagsSpecimen />
            <CardSpecimen />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
