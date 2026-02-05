import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Media query for desktop breakpoint
const isDesktop = window.matchMedia('(min-width: 1200px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections?.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button')?.focus();
    }
  }
}

function closeOnClickOutside(e) {
  const nav = document.getElementById('nav');
  if (!nav.contains(e.target)) {
    const navSections = nav.querySelector('.nav-sections');
    toggleAllNavSections(navSections, false);
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections?.querySelectorAll('.nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, false);
  button?.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // Enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('click', closeOnClickOutside);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    document.removeEventListener('click', closeOnClickOutside);
  }
}

/**
 * Creates a dropdown title element for nav items with nested lists
 * @param {Element} navItem The nav list item
 * @returns {Element} The dropdown title element
 */
function createDropdownTitle(navItem) {
  const titleEl = document.createElement('span');
  titleEl.className = 'nav-drop-title';

  // Get title text from the first text node or strong element
  const firstChild = navItem.firstChild;
  if (firstChild) {
    if (firstChild.nodeType === Node.TEXT_NODE) {
      titleEl.textContent = firstChild.textContent.trim();
      firstChild.remove();
    } else if (firstChild.tagName === 'STRONG') {
      titleEl.textContent = firstChild.textContent.trim();
      firstChild.remove();
    } else if (firstChild.tagName === 'P') {
      titleEl.textContent = firstChild.textContent.trim();
      firstChild.remove();
    }
  }

  return titleEl;
}

/**
 * Decorates navigation sections with proper structure and behavior
 * @param {Element} navSections The nav sections container
 */
function decorateNavSections(navSections) {
  if (!navSections) return;

  // Remove button classes from all links
  navSections.querySelectorAll('.button').forEach((button) => {
    button.className = '';
    const buttonContainer = button.closest('.button-container');
    if (buttonContainer) {
      buttonContainer.className = '';
    }
  });

  // Process each nav item
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navItem) => {
    const nestedList = navItem.querySelector('ul');

    if (nestedList) {
      // This is a dropdown item
      navItem.classList.add('nav-drop');
      navItem.setAttribute('aria-expanded', 'false');

      // Create dropdown title
      const titleEl = createDropdownTitle(navItem);
      navItem.insertBefore(titleEl, navItem.firstChild);

      // Handle click on dropdown title
      titleEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = navItem.getAttribute('aria-expanded') === 'true';

        // Close other dropdowns on desktop
        if (isDesktop.matches) {
          toggleAllNavSections(navSections);
        }

        navItem.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    }

    // Mark "Adobe Acrobat" as active (or the second nav item)
    const link = navItem.querySelector(':scope > a');
    if (link) {
      const linkText = link.textContent.trim().toLowerCase();
      if (linkText === 'adobe acrobat' || linkText === 'home') {
        navItem.classList.add('nav-active');
      }
    }
  });
}

/**
 * Decorates nav tools section with proper CTA styling
 * @param {Element} navTools The nav tools container
 */
function decorateNavTools(navTools) {
  if (!navTools) return;

  // Remove button classes but style via CSS
  navTools.querySelectorAll('.button').forEach((button) => {
    button.className = '';
    const buttonContainer = button.closest('.button-container');
    if (buttonContainer) {
      buttonContainer.className = '';
    }
  });

  // Mark first tool item as primary CTA (Buy now)
  const toolItems = navTools.querySelectorAll(':scope .default-content-wrapper > ul > li');
  toolItems.forEach((item, index) => {
    if (index === 0) {
      item.classList.add('nav-cta-primary');
    } else {
      item.classList.add('nav-cta-secondary');
    }
  });
}


/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // Decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Identify sections: brand, sections, tools
  const sections = [...nav.children];
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = sections[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Decorate brand section
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      const buttonContainer = brandLink.closest('.button-container');
      if (buttonContainer) buttonContainer.className = '';
    }
  }

  // Decorate nav sections
  const navSections = nav.querySelector('.nav-sections');
  decorateNavSections(navSections);

  // Decorate nav tools
  const navTools = nav.querySelector('.nav-tools');
  decorateNavTools(navTools);

  // Create hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>
  `;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);

  // Set initial nav state
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Create nav wrapper and assemble
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  navWrapper.append(nav);
  block.append(navWrapper);
}
