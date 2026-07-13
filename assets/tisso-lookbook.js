(function () {
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

    // Bonus/upsell product info is passed in from Liquid as data attributes
  
    const bonusVariantId = root.dataset.bonusVariantId ? Number(root.dataset.bonusVariantId) : null;

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
      const colorKey = Object.keys(chosenSelections).find(k => /^colou?r$/i.test(k));
      const sizeKey = Object.keys(chosenSelections).find(k => /^size$/i.test(k));

      let hasBlack, hasMedium;
      if (colorKey && sizeKey) {
        hasBlack = String(chosenSelections[colorKey]).toLowerCase() === 'black';
        hasMedium = String(chosenSelections[sizeKey]).toLowerCase() === 'medium';
      } else {
        const values = Object.values(chosenSelections).map(v => String(v).toLowerCase());
        hasBlack = values.includes('black');
        hasMedium = values.includes('medium');
      }

      if (bonusVariantId && hasBlack && hasMedium) {
        const alreadyInPayload = itemsToPost.some(item => item.id === bonusVariantId);
        if (!alreadyInPayload) {
          itemsToPost.push({
            id: bonusVariantId,
            quantity: 1
          });
        }
      }

      addToCartBtn.disabled = true;
      const originalLabel = btnLabel.textContent;
      btnLabel.textContent = 'ADDING...';

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
          document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true, detail: data }));
          document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
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
