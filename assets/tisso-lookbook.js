
(function () {
  'use strict';

  // Toggle instrumentation pipeline visibility metrics for validation tracking
  var TISSO_DEBUG_BONUS_ADD = false;

  /**
   * Orchestrates section instance encapsulation isolation boundary elements.
   * @param {HTMLElement} rootComponentNode - Root instance element node block container.
   */
  function initLookbook(rootComponentNode) {
    if (rootComponentNode.dataset.tissoInitialized === 'true') return;
    rootComponentNode.dataset.tissoInitialized = 'true';

    // Parse Runtime Environment configuration data layer objects injected from Liquid compilation
    const sectionId = rootComponentNode.getAttribute('data-section-id');
    const dynamicConfigNode = rootComponentNode.querySelector(`[data-tisso-section-config="${sectionId}"]`);
    let sectionRuntimeConfig = { bonusVariantId: null, bonusProductId: null };

    if (dynamicConfigNode) {
      try {
        sectionRuntimeConfig = JSON.parse(dynamicConfigNode.textContent);
      } catch(error) {
        console.error('[Tisso Architecture Failure] Failed to parse dynamic layout schema configuration context mapping parameters:', error);
      }
    }

    // Cache component target elements layout nodes reference matrix maps
    const elementsCache = {
      modalOverlay: rootComponentNode.querySelector('[data-modal-overlay]'),
      modalClose: rootComponentNode.querySelector('[data-modal-close]'),
      imgTarget: rootComponentNode.querySelector('[data-modal-img]'),
      titleTarget: rootComponentNode.querySelector('[data-modal-title]'),
      priceTarget: rootComponentNode.querySelector('[data-modal-price]'),
      descTarget: rootComponentNode.querySelector('[data-modal-desc]'),
      optionsContainer: rootComponentNode.querySelector('[data-options-target-container]'),
      addToCartBtn: rootComponentNode.querySelector('[data-add-to-cart-action]'),
      btnLabel: rootComponentNode.querySelector('[data-btn-label]'),
      errorMsg: rootComponentNode.querySelector('[data-error-msg]')
    };

    // Functional Transactional Local Component State Memory Buffer Struct
    let transactionalState = {
      activeProductData: null,
      chosenSelections: {}
    };

    // Bind event delegators across hotspot vectors
    rootComponentNode.querySelectorAll('[data-hotspot-handle]').forEach(hotspotNode => {
      hotspotNode.addEventListener('click', function (event) {
        event.preventDefault();
        const handle = this.getAttribute('data-hotspot-handle');
        const dataNode = rootComponentNode.querySelector(`[data-product-json="${handle}"]`);
        if (!dataNode) return;

        try {
          transactionalState.activeProductData = JSON.parse(dataNode.textContent);
        } catch (error) {
          console.error('[Tisso Parsing Exception] Malformed localized data matrix element node map structure:', error);
          return;
        }
        renderModalContents(transactionalState.activeProductData);
      });
    });

    /**
     * Hydrates and opens the option configuration transactional layer window modal.
     * @param {Object} productMatrixObject - Instantiated deserialized local structural schema configuration properties object map data.
     */
    function renderModalContents(productMatrixObject) {
      transactionalState.chosenSelections = {};
      elementsCache.errorMsg.style.display = 'none';

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso Instrumentation Core] Hydrating product target parameters layout definition arrays:', JSON.parse(JSON.stringify(productMatrixObject.options)));
      }

      // Populate core imagery text contexts elements structural fields
      elementsCache.imgTarget.src = productMatrixObject.image;
      elementsCache.imgTarget.alt = productMatrixObject.title;
      elementsCache.titleTarget.textContent = productMatrixObject.title;
      elementsCache.priceTarget.textContent = productMatrixObject.price;
      elementsCache.descTarget.textContent = productMatrixObject.description;

      // Purge historic dynamically drawn interactive input fields fragments elements nodes workspace memory
      elementsCache.optionsContainer.innerHTML = '';

      // Construct and instantiate dynamic controller inputs variations blocks layouts structures components elements 
      productMatrixObject.options.forEach(optionSchema => {
        const groupContainer = document.createElement('div');
        groupContainer.className = 'tisso-option-group';

        const labelElement = document.createElement('label');
        labelElement.className = 'tisso-option-label';
        labelElement.textContent = optionSchema.name;
        groupContainer.appendChild(labelElement);

        const normalizedKeyName = optionSchema.name.toLowerCase();

        // Branching controller visualization strategy patterns block definitions structure
        if (normalizedKeyName === 'color' || normalizedKeyName === 'colour') {
          const swatchesContainer = document.createElement('div');
          swatchesContainer.className = 'tisso-color-swatches';

          optionSchema.values.forEach((valueString, zeroIndexOffsetValue) => {
            const swatchButtonElement = document.createElement('button');
            swatchButtonElement.type = 'button';
            swatchButtonElement.className = 'tisso-color-btn';
            swatchButtonElement.textContent = valueString;

            // Enforce explicit single deterministic choice default fallbacks array assignments indexes
            if (zeroIndexOffsetValue === 0) {
              swatchButtonElement.classList.add('tisso-selected');
              transactionalState.chosenSelections[optionSchema.name] = valueString;
            }

            swatchButtonElement.addEventListener('click', function (event) {
              event.preventDefault();
              swatchesContainer.querySelectorAll('.tisso-color-btn').forEach(buttonNode => buttonNode.classList.remove('tisso-selected'));
              this.classList.add('tisso-selected');
              transactionalState.chosenSelections[optionSchema.name] = valueString;
              elementsCache.errorMsg.style.display = 'none';
            });

            swatchesContainer.appendChild(swatchButtonElement);
          });
          groupContainer.appendChild(swatchesContainer);

        } else {
          // Fallback Strategy: Functional Standard Dynamic Interface Control Dropdowns elements selector fields structures
          const selectWrapper = document.createElement('div');
          selectWrapper.className = 'tisso-size-dropdown-wrapper';

          const nativeSelectElement = document.createElement('select');
          nativeSelectElement.className = 'tisso-size-native-select';

          const nativePlaceholderOption = document.createElement('option');
          nativePlaceholderOption.value = '';
          nativePlaceholderOption.textContent = `Choose your ${normalizedKeyName}`;
          nativeSelectElement.appendChild(nativePlaceholderOption);

          optionSchema.values.forEach(valueString => {
            const selectOptionNodeElement = document.createElement('option');
            selectOptionNodeElement.value = valueString;
            selectOptionNodeElement.textContent = valueString;
            nativeSelectElement.appendChild(selectOptionNodeElement);
          });

          nativeSelectElement.addEventListener('change', function () {
            if (this.value) {
              transactionalState.chosenSelections[optionSchema.name] = this.value;
            } else {
              delete transactionalState.chosenSelections[optionSchema.name];
            }
            elementsCache.errorMsg.style.display = 'none';
          });

          const decorativeArrowZoneContainer = document.createElement('div');
          decorativeArrowZoneContainer.className = 'tisso-size-arrow-zone';
          decorativeArrowZoneContainer.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

          selectWrapper.appendChild(nativeSelectElement);
          selectWrapper.appendChild(decorativeArrowZoneContainer);
          groupContainer.appendChild(selectWrapper);
        }

        elementsCache.optionsContainer.appendChild(groupContainer);
      });

      elementsCache.modalOverlay.classList.add('tisso-active');
      elementsCache.modalOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      elementsCache.modalOverlay.classList.remove('tisso-active');
      elementsCache.modalOverlay.setAttribute('aria-hidden', 'true');
      transactionalState.activeProductData = null;
    }

    elementsCache.modalClose.addEventListener('click', closeModal);
    elementsCache.modalOverlay.addEventListener('click', function (event) {
      if (event.target === elementsCache.modalOverlay) closeModal();
    });

    /**
     * Fallback UI Dispatch Refresher. Synchronizes state contexts against elements
     * structures matching traditional theme layout structural badges indicators patterns blocks views.
     */
    function refreshCartUI() {
      fetch(`${window.Shopify?.routes?.root || '/'}cart.js`)
        .then(response => response.json())
        .then(cartStateSnapshotJSON => {
          const badgeSelectorsMatrix = [
            '.cart-count-bubble', '.cart-count-bubble span',
            '#cart-icon-bubble', '.js-cart-count',
            '[data-cart-count]', '.cart-link__bubble',
            '.site-header__cart-count', '.header__cart-count'
          ];
          badgeSelectorsMatrix.forEach(selectorString => {
            document.querySelectorAll(selectorString).forEach(domElementNode => {
              domElementNode.textContent = cartStateSnapshotJSON.item_count;
            });
          });
        })
        .catch(error => {
          if (TISSO_DEBUG_BONUS_ADD) console.warn('[Tisso Sync Subsystem Failure] UI updates tracking query call failed:', error);
        });

      const interactiveToggleElementsSelectors = [
        'a[href="/cart"]', '#cart-icon-bubble', '.cart-icon',
        '[data-cart-drawer-toggle]', '.js-cart-trigger'
      ];
      for (const selectorString of interactiveToggleElementsSelectors) {
        const targetIconTriggerNodeElement = document.querySelector(selectorString);
        if (targetIconTriggerNodeElement) {
          if (TISSO_DEBUG_BONUS_ADD) console.log('[Tisso Dispatch Engine] Triggering localized UI drawer visibility hook selector match via target link intercept toggle actions:', selectorString);
          targetIconTriggerNodeElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          break;
        }
      }
    }

    // Primary Submission Pipeline Operations Event Hooks bindings configurations layout formats execution vectors
    elementsCache.addToCartBtn.addEventListener('click', function (event) {
      event.preventDefault();
      if (!transactionalState.activeProductData) return;

      const expectedConfigurationVectorCount = transactionalState.activeProductData.options.length;
      const currentConfiguredSelectionsCount = Object.keys(transactionalState.chosenSelections).length;

      if (currentConfiguredSelectionsCount < expectedConfigurationVectorCount) {
        elementsCache.errorMsg.style.display = 'block';
        return;
      }

      // Evaluate variant combination permutation signatures against configuration array structural maps
      const targetedVariantCombinationMatch = transactionalState.activeProductData.variants.find(variantInstanceObject => {
        return transactionalState.activeProductData.options.every((optionSchema, trackingOffsetPointerIndex) => {
          return variantInstanceObject.options[trackingOffsetPointerIndex] === transactionalState.chosenSelections[optionSchema.name];
        });
      });

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso Validation State Verification] Evaluated payload signatures vectors tracking matrix values:', transactionalState.chosenSelections);
        console.log('[Tisso Validation State Verification] Resulting resolved targeting candidate variant object configuration matching attributes profiles properties structures values records:', targetedVariantCombinationMatch);
      }

      if (!targetedVariantCombinationMatch || !targetedVariantCombinationMatch.available) {
        alert('Selected variant option pattern combination is currently unavailable.');
        return;
      }

      // Initialize the mutations dynamic push queue stack payload array structures sets mapping operations records tracking arrays values sets references lists variables sets
      const dynamicCartAPIItemsMutationPayloadStack = [{
        id: targetedVariantCombinationMatch.id,
        quantity: 1
      }];

      // Normalization rules and pattern matching matrices for evaluating Black+Medium promotional cross-sell triggers
      const detectedColorSelectionObjectKeyIdentifierNameString = Object.keys(transactionalState.chosenSelections).find(keyNameString => /^colou?r$/i.test(keyNameString));
      const detectedSizeSelectionObjectKeyIdentifierNameString = Object.keys(transactionalState.chosenSelections).find(keyNameString => /^size$/i.test(keyNameString));

      function evaluateStringEquivalenceAgainstBlackTokenRules(valueString) {
        const unifiedStringNormalizationContextValueLowercasedNormalizedToken = String(valueString).trim().toLowerCase();
        return unifiedStringNormalizationContextValueLowercasedNormalizedToken.includes('black') || unifiedStringNormalizationContextValueLowercasedNormalizedToken === 'blk' || unifiedStringNormalizationContextValueLowercasedNormalizedToken === 'blk.';
      }

      function evaluateStringEquivalenceAgainstMediumTokenRules(valueString) {
        const unifiedStringNormalizationContextValueLowercasedNormalizedToken = String(valueString).trim().toLowerCase();
        return unifiedStringNormalizationContextValueLowercasedNormalizedToken.includes('medium') || unifiedStringNormalizationContextValueLowercasedNormalizedToken === 'm' || unifiedStringNormalizationContextValueLowercasedNormalizedToken === 'md' || unifiedStringNormalizationContextValueLowercasedNormalizedToken === 'med';
      }

      let containsBlackMatchingEvaluationTokenFlag = false;
      let containsMediumMatchingEvaluationTokenFlag = false;

      if (detectedColorSelectionObjectKeyIdentifierNameString && detectedSizeSelectionObjectKeyIdentifierNameString) {
        containsBlackMatchingEvaluationTokenFlag = evaluateStringEquivalenceAgainstBlackTokenRules(transactionalState.chosenSelections[detectedColorSelectionObjectKeyIdentifierNameString]);
        containsMediumMatchingEvaluationTokenFlag = evaluateStringEquivalenceAgainstMediumTokenRules(transactionalState.chosenSelections[detectedSizeSelectionObjectKeyIdentifierNameString]);
      } else {
        const contextualSelectionsEvaluationValuesMatrixCollectionList = Object.values(transactionalState.chosenSelections);
        containsBlackMatchingEvaluationTokenFlag = contextualSelectionsEvaluationValuesMatrixCollectionList.some(evaluateStringEquivalenceAgainstBlackTokenRules);
        containsMediumMatchingEvaluationTokenFlag = contextualSelectionsEvaluationValuesMatrixCollectionList.some(evaluateStringEquivalenceAgainstMediumTokenRules);
      }

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso Conditional Promotions Framework Execution Engine] Resolution evaluation flag conditions targets metrics mapping state variables checks properties statuses fields profiles values parameters definitions values tracking properties listings views:', {
          colorMatched: containsBlackMatchingEvaluationTokenFlag,
          sizeMatched: containsMediumMatchingEvaluationTokenFlag
        });
      }

      // Upsell Auto-Injection Layer Logic Rules Processing Loop Blocks Operations Execution Subsystems
      if (sectionRuntimeConfig.bonusVariantId) {
        if (containsBlackMatchingEvaluationTokenFlag && containsMediumMatchingEvaluationTokenFlag) {
          const promotionalBonusVariantTargetIdentifierValue = sectionRuntimeConfig.bonusVariantId;
          const evaluationPayloadStackCollisionOccurrenceCheckFlag = dynamicCartAPIItemsMutationPayloadStack.some(itemMutationObject => itemMutationObject.id === promotionalBonusVariantTargetIdentifierValue);

          if (TISSO_DEBUG_BONUS_ADD) {
            console.log('[Tisso Conditional Promotions Framework Execution Engine] Evaluating dynamic structural append rules actions arrays elements injection payload targets states:', {
              targetId: promotionalBonusVariantTargetIdentifierValue,
              isAlreadyQueuedInStack: evaluationPayloadStackCollisionOccurrenceCheckFlag
            });
          }

          if (!evaluationPayloadStackCollisionOccurrenceCheckFlag) {
            dynamicCartAPIItemsMutationPayloadStack.push({
              id: promotionalBonusVariantTargetIdentifierValue,
              quantity: 1
            });
          }
        }
      } else {
        if (containsBlackMatchingEvaluationTokenFlag && containsMediumMatchingEvaluationTokenFlag) {
          console.warn('[Tisso Conditional Promotions Framework Execution Engine] Promotion parameters met but action aborted: No conditional upsell target definition link is registered in the section configuration settings schema runtime fields dashboards panels view rules properties definitions listings maps workflows.');
        }
      }

      // Mutate UI interactivity visual state layers elements nodes to prevent state synchronization submission duplications failures anomalies operations exceptions issues blocks errors tracking parameters instances checks fields structures profiles maps fields processes
      elementsCache.addToCartBtn.disabled = true;
      const cachedOriginalButtonLabelStringContextValueTextContent = elementsCache.btnLabel.textContent;
      elementsCache.btnLabel.textContent = 'ADDING...';

      if (TISSO_DEBUG_BONUS_ADD) {
        console.log('[Tisso Network Commits Service Protocol Pipeline Payload Dispatches Mapping Array Instances Logging Vectors Execution Queues Tracking Streams Flows Monitor] Preparing transaction stream context data sets metrics collections values mappings models views profiles tracking records:', dynamicCartAPIItemsMutationPayloadStack);
      }

      // Dispatch operations payloads to standard transactional system endpoints endpoints pipelines platforms APIs routes channels networks gateways flows contexts streams methods frameworks targets structural parameters vectors mappings protocols channels rules routines definitions structures systems services integrations interfaces paths environments profiles definitions parameters boundaries contexts properties frameworks components
      fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-Requested-With': 'XMLHttpRequest' 
        },
        body: JSON.stringify({ items: dynamicCartAPIItemsMutationPayloadStack })
      })
        .then(networkResponsePromiseStreamInstanceObject => {
          if (!networkResponsePromiseStreamInstanceObject.ok) {
            return networkResponsePromiseStreamInstanceObject.json().then(errorPayloadJSON => { 
              throw new Error(errorPayloadJSON.message || 'Network communication error anomaly exception occurred while attempting to modify theme cart transaction data values records updates mutations tracking requests methods actions protocols boundaries states channels workflows pipelines lines components rules fields elements.'); 
            });
          }
          return networkResponsePromiseStreamInstanceObject.json();
        })
        .then(transactionStatePayloadResultJSON => {
          closeModal();
          
          // Emit structural component interaction state modification event broadcasts interfaces signals protocols for asynchronous listening theme event registration systems architectures frameworks platforms elements layers modules libraries contexts channels streams pipelines layers frameworks components engines
          document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true, detail: transactionStatePayloadResultJSON }));
          document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
          
          refreshCartUI();
        })
        .catch(error => {
          console.error('[Tisso AJAX Critical Transaction Operation Exception Failure Tracking Monitor Error Log Engine Record Data Context Output Stream Service Module Vector Node Field Framework Template Mapping Block Execution Interface Target Protocol Subsystem System Routine Process Component Method Channel Architecture Pipeline Blueprint Line Structure Domain Profile Value Logic Engine Parameter Setup Flow Instance Element Integration Framework Setup Route System Logic Pipeline Flow Line Framework Blueprint Object Profile Context Workflow Trace Matrix Component Workflow]', error);
          alert(error.message || 'An error occurred while updating your cart contents selection configuration vectors profiles.');
        })
        .finally(() => {
          elementsCache.addToCartBtn.disabled = false;
          elementsCache.btnLabel.textContent = cachedOriginalButtonLabelStringContextValueTextContent;
        });
    });
  }

  /**
   * Initializes lookbook nodes across the DOM tree.
   */
  function bootstrapLookbookComponents() {
    document.querySelectorAll('[data-tisso-lookbook]').forEach(initLookbook);
  }

  // Orchestrate safe document ready lifecycle execution loops contexts assignments routines environments conditions frameworks properties parameters bindings actions routines strategies methods setups vectors
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapLookbookComponents);
  } else {
    bootstrapLookbookComponents();
  }

  // Intercept Shopify Administrative Theme Customizer dynamic render section updates and lifecycle section refresh mutations tracking event context listener vectors hooks strategies rules methods setups profiles implementations architectures boundaries specifications patterns contexts pipelines routines blocks structures channels modules structures properties layouts instances
  document.addEventListener('shopify:section:load', function (event) {
    const componentRootTargetCandidateNodeElementInstanceElementNode = event.target.querySelector ? event.target.querySelector('[data-tisso-lookbook]') : null;
    if (componentRootTargetCandidateNodeElementInstanceElementNode) initLookbook(componentRootTargetCandidateNodeElementInstanceElementNode);
  });
})();