import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataPage } from './components/DataPage';
import { DemoBanner } from './components/DemoBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { JsonLd } from './components/JsonLd';
import { ProjectDetail } from './components/ProjectDetail';
import { Wizard } from './components/wizard/Wizard';
import { SEED } from './data/seed';
import { clearPortfolio, loadPortfolio, savePortfolio } from './data/storage';
import type { Portfolio } from './data/types';
import { useI18n } from './i18n/I18nProvider';
import { buildPersonJsonLd } from './lib/jsonld';
import { pickLocalized } from './lib/localized';
import { scrollToSection } from './lib/scroll';
import { useRoute } from './lib/useRoute';

export default function App() {
  const route = useRoute();
  const { locale, t } = useI18n();
  const [loaded] = useState(loadPortfolio);
  const [portfolio, setPortfolio] = useState<Portfolio>(loaded.portfolio);

  const updatePortfolio = useCallback((next: Portfolio) => {
    const published: Portfolio = { ...next, demo: false };
    setPortfolio(published);
    savePortfolio(published);
  }, []);

  const resetPortfolio = useCallback(() => {
    clearPortfolio();
    setPortfolio(SEED);
  }, []);

  // El scroll depende de la ruta: secciones con ancla o inicio de página.
  useEffect(() => {
    if (route.name === 'home' && route.section) {
      scrollToSection(route.section);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [route]);

  useEffect(() => {
    const projectName =
      route.name === 'project'
        ? portfolio.projects.find((project) => project.id === route.id)?.name
        : '';

    const owner = portfolio.profile.name.trim() || t('app.title');
    const suffix = projectName || pickLocalized(portfolio.profile.headline, locale);

    document.title = suffix ? `${owner} — ${suffix}` : owner;

    const description = pickLocalized(portfolio.profile.bio, locale) || t('app.description');
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [route, portfolio, locale, t]);

  const jsonLd = useMemo(() => buildPersonJsonLd(portfolio, locale), [portfolio, locale]);

  return (
    <>
      <JsonLd data={jsonLd} />

      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {t('nav.skip')}
      </a>

      <Header route={route} />

      {portfolio.demo ? <DemoBanner /> : null}

      <main id="main" tabIndex={-1}>
        {route.name === 'home' ? <HomePage portfolio={portfolio} /> : null}
        {route.name === 'project' ? (
          <ProjectDetail portfolio={portfolio} projectId={route.id} />
        ) : null}
        {route.name === 'data' ? <DataPage portfolio={portfolio} /> : null}
        {route.name === 'edit' ? (
          <Wizard portfolio={portfolio} onChange={updatePortfolio} onReset={resetPortfolio} />
        ) : null}
      </main>

      <Footer name={portfolio.profile.name} />
    </>
  );
}
