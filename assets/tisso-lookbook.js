(function () {
  // Set to true while debugging the Black+Medium bonus-add rule, then flip
  // back to false for production — it logs the decision path to console.
  var TISSO_DEBUG_BONUS_ADD = true;

  // Guard against the init script being parsed more than once if the theme
  // editor re-injects section markup without a full page reload.
  function initLookbook(root) {
    if (root.dataset.tissoInitialized === 'true') return;
    root.dataset.tissoInitialized = 'true';

    const modalOverlay = root.querySelector('[data-modal-overlay]');
    const modalClose = root.querySelector('[data-modal-close]');
    const imgTarget = root.querySelector('[data-modal-img]');
    const titleTarget = root.querySelector('[data-modal-title]');
    const priceTarget = root.querySelector('[data-modal-price]');
    const descTarget = root.querySelector('[data-modal-desc]');
    const optionsContainer = root.querySelector('[data-options-target-container]');
    const addToCartBtn = root.querySelector('[data-add-to-cart-action]');
    const btnLabel = root.querySelector('[data-btn-label]');
    const errorMsg = root.querySelector('[data-error-msg]');

    // Bonus-product config comes from data attributes rendered by Liquid on
    // the root element (see sections/tisso-lookbook.liquid), since this file
    // is a static asset and is not Liquid-parsed.
    const bonusVariantIdRaw = root.dataset.bonusVariantId || '';
    const bonusVariantId = bonusVariantIdRaw ? Number(bonusVariantIdRaw) : null;
    const bonusProductConfigured = root.dataset.bonusConfigured === 'true';

    let activeProductData = null;
    let chosenSelections = {};

    root.querySelectorAll('[data-hotspot-handle]').forEach(hotspot => {
      hotspot.addEventListener('click', function () {
        const handle = this.getAttribute('data-hotspot-handle');
        const dataNode = root.querySelector(`[data-product-json="${handle}"]`);
        if (!dataNode) return;

        try {
          activeProductData = JSON.parse(dataNode.textContent);
        } catch (e) {
          console.error('Tisso Lookbook: could not parse product JSON', e);
          return;
        }
        renderModalContents(activeProductData);
      });
    });

    function renderModalContents(product) {
      chosenSelections = {};
      errorMsg.style.display = 'none';

      if (TISSO_DEBUG_BONUS_ADD) {
        // Confirms the ACTUAL option names/values Shopify is sending for this
        // product, so you can check they really are "Color"/"Black" and
        // "Size"/"Medium" and not something like "Farve"/"Sort" or "Sz"/"M".
        console.log('[Tisso] product.options for "' + product.title + '":', JSON.parse(JSON.stringify(product.options)));
      }

      imgTarget.src = product.image;
      imgTarget.alt = product.title;
      titleTarget.textContent = product.title;
      priceTarget.textContent = product.price;
      descTarget.textContent = product.description;

      optionsContainer.innerHTML = '';

      product.options.forEach(option => {
        const groupEl = document.createElement('div');
        groupEl.className = 'tisso-option-group';

        const labelEl = document.createElement('label');
        labelEl.className = 'tisso-option-label';
        labelEl.textContent = option.name;
        groupEl.appendChild(labelEl);

        const normalizedName = option.name.toLowerCase();

        if (normalizedName === 'color' || normalizedName === 'colour') {
          const swatchesContainer = document.createElement('div');
          swatchesContainer.className = 'tisso-color-swatches';

          option.values.forEach((val, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tisso-color-btn';
            btn.textContent = val;

            if (idx === 0) {
              btn.classList.add('tisso-selected');
              chosenSelections[option.name] = val;
            }

            btn.addEventListener('click', function () {
              swatchesContainer.querySelectorAll('.tisso-color-btn').forEach(b => b.classList.remove('tisso-selected'));
              this.classList.add('tisso-selected');
              chosenSelections[option.name] = val;
              errorMsg.style.display = 'none';
            });

            swatchesContainer.appendChild(btn);
          });
          groupEl.appendChild(swatchesContainer);

        } else {
          const selectWrapper = document.createElement('div');
          selectWrapper.className = 'tisso-size-dropdown-wrapper';

          const select = document.createElement('select');
          select.className = 'tisso-size-native-select';

          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = 'Choose your ' + normalizedName;
          select.appendChild(placeholder);

          option.values.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            select.appendChild(opt);
          });

          select.addEventListener('change', function () {
            if (this.value) {
              chosenSelections[option.name] = this.value;
            } else {
              delete chosenSelections[option.name];
            }
            errorMsg.style.display = 'none';
          });

          const arrowZone = document.createElement('div');
          arrowZone.className = 'tisso-size-arrow-zone';
          arrowZone.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

          selectWrapper.appendChild(select);
          selectWrapper.appendChild(arrowZone);
          groupEl.appendChild(selectWrapper);
        }

        optionsContainer.appendChild(groupEl);
      });

      modalOverlay.classList.add('tisso-active');
    }

    function closeModal() {
      modalOverlay.classList.remove('tisso-active');
      activeProductData = null;
    }
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    // Best-effort, theme-agnostic attempt to make the cart UI reflect the
    // new item(s) without a manual page refresh. There is no universal API
    // for "open my theme's cart drawer" across Shopify themes, so this tries
    // two common patterns:
    //  1. Directly patch any element that looks like a cart-count badge.
    //  2. Click the theme's own cart icon/link, so whatever native JS the
    //     theme already has (fetch + render drawer, etc.) runs itself.
    // If neither matches your theme's markup, tell me your theme name or
    // paste the cart-icon HTML and I'll wire this exactly instead of guessing.
    function refreshCartUI() {
      fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
          const countSelectors = [
            '.cart-count-bubble', '.cart-count-bubble span',
            '#cart-icon-bubble', '.js-cart-count',
            '[data-cart-count]', '.cart-link__bubble',
            '.site-header__cart-count', '.header__cart-count'
          ];
          countSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
              el.textContent = cart.item_count;
            });
          });
        })
        .catch(err => {
          if (TISSO_DEBUG_BONUS_ADD) console.warn('[Tisso] could not fetch /cart.js for UI refresh', err);
        });

      const cartIconSelectors = [
        'a[href="/cart"]', '#cart-icon-bubble', '.cart-icon',
        '[data-cart-drawer-toggle]', '.js-cart-trigger'
      ];
      for (const sel of cartIconSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          if (TISSO_DEBUG_BONUS_ADD) console.log('[Tisso] attempting to trigger theme cart UI via:', sel);
          // Some themes bind their own click handler that fetches sections
          // and opens the drawer with fresh data — this lets that run.
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          break;
        }
      }
    }

    addToCartBtn.addEventListener('click', function () {
      if (!activeProductData) return;

      const totalOptionsNeeded = activeProductData.options.length;
      const selectedCount = Object.keys(chosenSelections).length;

      if (selectedCount < totalOptionsNeeded) {
        errorMsg.style.display = 'block';
        return;
      }

      const matchedVariant = activeProductData.variants.find(variant => {
        return activeProductData.options.every((opt, index) => {
          return variant.options[index] === chosenSelections[opt.name];
        });
      });

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso] chosenSelections:', chosenSelections);
        console.log('[Tisso] matchedVariant:', matchedVariant);
      }

      if (!matchedVariant || !matchedVariant.available) {
        alert('Selected variant option pattern combination is currently unavailable.');
        return;
      }

      const itemsToPost = [{
        id: matchedVariant.id,
        quantity: 1
      }];

      // Match the Color option (Black) and Size option (Medium) specifically,
      // rather than scanning all selected values indiscriminately. Falls back
      // to a value-only scan if the product doesn't use Color/Size option names.
      // Matching uses "contains" plus known abbreviations, so values like
      // "Jet Black" or plain "M" / "MD" still qualify — not just an exact
      // "Black" / "Medium" string.
      const colorKey = Object.keys(chosenSelections).find(k => /^colou?r$/i.test(k));
      const sizeKey = Object.keys(chosenSelections).find(k => /^size$/i.test(k));

      function valueMeansBlack(v) {
        const s = String(v).trim().toLowerCase();
        return s.includes('black') || s === 'blk' || s === 'blk.';
      }
      function valueMeansMedium(v) {
        const s = String(v).trim().toLowerCase();
        return s.includes('medium') || s === 'm' || s === 'md' || s === 'med';
      }

      let hasBlack, hasMedium;
      if (colorKey && sizeKey) {
        hasBlack = valueMeansBlack(chosenSelections[colorKey]);
        hasMedium = valueMeansMedium(chosenSelections[sizeKey]);
      } else {
        const values = Object.values(chosenSelections);
        hasBlack = values.some(valueMeansBlack);
        hasMedium = values.some(valueMeansMedium);
      }

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso] colorKey:', colorKey, '| sizeKey:', sizeKey);
        console.log('[Tisso] hasBlack:', hasBlack, '| hasMedium:', hasMedium);
      }

      if (hasBlack && hasMedium) {
        if (!bonusProductConfigured) {
          console.warn('[Tisso Lookbook] Black+Medium matched, but no "Soft Winter Jacket Auto-Add Upsell Target" product is set in the section settings, so nothing was auto-added. Set the "bonus_product" setting in the theme customizer.');
        } else if (!bonusVariantId) {
          console.warn('[Tisso Lookbook] Black+Medium matched, but the configured bonus product ("Soft Winter Jacket") has no available variant to add — it may be sold out or all variants unpublished.');
        } else {
          const alreadyInPayload = itemsToPost.some(item => item.id === bonusVariantId);
          if (TISSO_DEBUG_BONUS_ADD) {
            console.log('[Tisso] bonus_product configured. bonusVariantId:', bonusVariantId, '| alreadyInPayload:', alreadyInPayload);
          }
          if (!alreadyInPayload) {
            itemsToPost.push({
              id: bonusVariantId,
              quantity: 1
            });
          }
        }
      }

      addToCartBtn.disabled = true;
      const originalLabel = btnLabel.textContent;
      btnLabel.textContent = 'ADDING...';

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso] itemsToPost:', itemsToPost);
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ items: itemsToPost })
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Network error adding to cart.'); });
          }
          return response.json();
        })
        .then(data => {
          closeModal();

          // Let the rest of the theme (cart drawer/icon count) react without a full reload.
          // Custom events only help if the theme happens to listen for these names —
          // many themes use their own internal pub/sub instead, so this alone is
          // often not enough (see refreshCartUI below for a more universal fallback).
          document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true, detail: data }));
          document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));

          refreshCartUI();
        })
        .catch(err => {
          console.error(err);
          alert(err.message || 'Error updating cart.');
        })
        .finally(() => {
          addToCartBtn.disabled = false;
          btnLabel.textContent = originalLabel;
        });
    });
  }

  function initAll() {
    document.querySelectorAll('[data-tisso-lookbook]').forEach(initLookbook);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init after Theme Editor re-renders this section (product/setting changes)
  document.addEventListener('shopify:section:load', function (event) {
    const root = event.target.querySelector ? event.target.querySelector('[data-tisso-lookbook]') : null;
    if (root) initLookbook(root);
  });
})();