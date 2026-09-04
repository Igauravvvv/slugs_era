import { isAnalyticsEnabled, trackEvent } from '@/lib/analytics';

const SECTION_SELECTOR = 'main section, main [data-analytics-section]';
const SCROLL_MILESTONES = [25, 50, 75, 90];

function cleanLabel(value: string | null | undefined, fallback: string) {
  const cleaned = (value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  return cleaned || fallback;
}

function pageType(path: string) {
  if (path === '/') return 'home';
  if (path.startsWith('/product/')) return 'product_detail';
  if (path.startsWith('/collections')) return 'collection';
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/blog/')) return 'blog_article';
  return path.replace(/^\//, '').replace(/\//g, '_') || 'home';
}

function sectionName(element: Element, index: number) {
  const heading = element.querySelector('h1, h2, h3');
  return cleanLabel(
    element.getAttribute('data-analytics-section') ||
      element.id ||
      element.getAttribute('aria-label') ||
      heading?.textContent,
    `section_${index + 1}`,
  );
}

function controlLabel(element: Element) {
  const imageAlt = element.querySelector('img')?.getAttribute('alt');
  return cleanLabel(
    element.getAttribute('data-analytics-label') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      imageAlt,
    element.tagName.toLowerCase(),
  );
}

function formName(form: HTMLFormElement) {
  const heading = form.closest('section, main, div')?.querySelector('h1, h2, h3');
  return cleanLabel(
    form.getAttribute('data-analytics-form') || form.getAttribute('aria-label') || form.id || heading?.textContent,
    'site_form',
  );
}

/** Track route-specific sections and interactions without collecting field values or personal data. */
export function startSiteAnalytics(path: string) {
  if (path.startsWith('/dashboard') || path.startsWith('/admin')) return () => undefined;

  const observedSections = new WeakSet<Element>();
  const viewedSections = new WeakSet<Element>();
  const startedForms = new WeakSet<HTMLFormElement>();
  const sentScrollDepths = new Set<number>();

  const recordSection = (element: Element) => {
    if (viewedSections.has(element) || !isAnalyticsEnabled()) return;
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const index = Math.max(0, sections.indexOf(element));
    viewedSections.add(element);
    trackEvent('section_view', {
      section_name: sectionName(element, index),
      section_index: index + 1,
      page_path: path,
      page_type: pageType(path),
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) recordSection(entry.target);
    }),
    { threshold: [0.3, 0.6] },
  );

  const observeSections = () => {
    document.querySelectorAll(SECTION_SELECTOR).forEach((element) => {
      if (observedSections.has(element)) return;
      observedSections.add(element);
      sectionObserver.observe(element);
    });
  };

  const recordVisibleSections = () => {
    document.querySelectorAll(SECTION_SELECTOR).forEach((element) => {
      const rect = element.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleHeight > 0 && visibleHeight >= Math.min(rect.height * 0.3, window.innerHeight * 0.3)) {
        recordSection(element);
      }
    });
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest('a, button, [role="button"]');
    if (!control) return;

    const section = control.closest('section, [data-analytics-section]');
    const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
    const sectionIndex = section ? Math.max(0, sections.indexOf(section)) : -1;
    const label = controlLabel(control);
    const href = control instanceof HTMLAnchorElement ? control.href : '';
    const isExternal = href ? new URL(href, window.location.href).origin !== window.location.origin : false;
    const isAccordion = control.hasAttribute('aria-expanded');
    const inHero = section?.id === 'hero';
    const inNavigation = Boolean(control.closest('header, nav, footer'));

    const interactionType = isAccordion
      ? 'accordion_toggle'
      : path === '/cart'
        ? 'cart_action'
        : inHero
          ? 'hero_action'
          : isExternal
            ? 'outbound_link'
            : inNavigation
              ? 'navigation'
              : 'content_action';

    trackEvent('site_interaction', {
      interaction_type: interactionType,
      element_label: label,
      element_type: control.tagName.toLowerCase(),
      section_name: section ? sectionName(section, sectionIndex) : 'page_chrome',
      page_path: path,
      page_type: pageType(path),
      ...(href ? { destination: isExternal ? new URL(href).hostname : new URL(href, window.location.href).pathname } : {}),
    });

    if (isExternal) {
      trackEvent('click', { link_domain: new URL(href).hostname, link_text: label, outbound: true, page_path: path });
    }
  };

  const handleFocus = (event: FocusEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const form = target?.closest('form');
    if (!(form instanceof HTMLFormElement) || startedForms.has(form)) return;
    startedForms.add(form);
    trackEvent('form_start', { form_name: formName(form), page_path: path, page_type: pageType(path) });
  };

  const handleSubmit = (event: SubmitEvent) => {
    if (!(event.target instanceof HTMLFormElement)) return;
    trackEvent('form_submit', { form_name: formName(event.target), page_path: path, page_type: pageType(path) });
  };

  const handleScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.round((window.scrollY / scrollable) * 100);
    SCROLL_MILESTONES.forEach((milestone) => {
      if (depth < milestone || sentScrollDepths.has(milestone) || !isAnalyticsEnabled()) return;
      sentScrollDepths.add(milestone);
      trackEvent('scroll_depth', { percent_scrolled: milestone, page_path: path, page_type: pageType(path) });
    });
  };

  const mutationObserver = new MutationObserver(observeSections);
  observeSections();
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', handleClick, true);
  document.addEventListener('focusin', handleFocus, true);
  document.addEventListener('submit', handleSubmit, true);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('slugsera:analytics-ready', recordVisibleSections);
  recordVisibleSections();

  return () => {
    sectionObserver.disconnect();
    mutationObserver.disconnect();
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('focusin', handleFocus, true);
    document.removeEventListener('submit', handleSubmit, true);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('slugsera:analytics-ready', recordVisibleSections);
  };
}
