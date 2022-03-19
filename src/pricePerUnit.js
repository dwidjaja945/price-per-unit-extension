const OZ = 'oz';
const OUNCE = 'ounce';
const LB = 'lb';
const POUND = 'pound';
const CT = 'ct';
const FL_OZ = 'floz';
const GAL = 'gal';
const L = 'l';
const LITER = 'liter';
const ML = 'ml';

const PK = 'pk';
const EACH = 'each';

const UNIT_REGEX = '\\s?((oz)|(lb)|(ct)|(pk)|(each)|(ounce)|(gal)|(fl\\s?oz)|(l(iter)?)|(ml))';
const PRICE_REGEX = '[0-9.]*';

const quantityMatchRegex = new RegExp(`[0-9.]+(${UNIT_REGEX})?\\s?[x\/-]*\\s?[0-9.]*${UNIT_REGEX}`, 'gim');
const quantityRegex = new RegExp(`[0-9.]+${UNIT_REGEX}`, 'gi');
const unitRegex = new RegExp(UNIT_REGEX, 'gi');
const quantityMathRegex = new RegExp(`[0-9.]*\\s?[x\/-]+\\s?[0-9.]*${UNIT_REGEX}`, 'gi');

const AMAZON_SELECTOR = '[data-component-type="s-search-result"]';
const TARGET_SELECTOR = {
  cardSelector: '[data-test="@web/ProductCard/ProductCardVariantDefault"]',
  priceSelector: '[data-test="current-price"]',
  nameSelector: '[data-test="product-title"]',
  quantitySelector: '[data-test="product-title"]',
};
const SHIPT_SELECTOR = '[data-test="ProductCard"]';
const COSTCO_SELECTOR = '#react-views-container ul li';
const INSTACART_SELECTOR = "[data-radium='true'].item-card";
const SAY_WEEE_SELECTOR = '.product-media';
const FRED_MEYER_SELECTOR = {
  cardSelector: '.ProductCard',
  priceSelector: '[typeof="Price"]',
  nameSelector: '[data-qa="cart-page-item-description"]',
  quantitySelector: '[data-qa="cart-page-item-sizing"]',
};

const domain = document.location.hostname;
const getSelector = () => {
  switch (domain.toLowerCase()) {
    case 'www.target.com':
      return TARGET_SELECTOR;
    case 'www.amazon.com':
      return AMAZON_SELECTOR;
    case 'www.shipt.com':
      return SHIPT_SELECTOR;
    case 'www.instacart.com':
      return INSTACART_SELECTOR;
    case 'sameday.costco.com':
      return COSTCO_SELECTOR;
    case 'www.sayweee.com':
      return SAY_WEEE_SELECTOR;
    case 'www.fredmeyer.com':
      return FRED_MEYER_SELECTOR;
    default:
      throw new Error(`Unhandled domain: ${domain}`);
  }
};

const getUnit = (unit) => {
  switch (unit) {
    case OZ:
    case OUNCE:
      return OZ;
    case LB:
    case POUND:
      return LB;
    case L:
    case LITER:
      return LITER;
    default:
      return unit;
    // throw new Error(`Unhandled unit: ${unit}`);
  }
};

const checkFor = (unitGroups, unit) => Object.keys(unitGroups).some((group) => group === unit);

const convertUnits = (unitGroups, from, to, conversionFactor) => {
  const array = unitGroups[from];
  if (unitGroups[to] === undefined) unitGroups[to] = [];
  array.forEach((oz) => {
    oz.price *= conversionFactor;
    oz.unit = to;
    unitGroups[to].push(oz);
  });
  delete unitGroups[from];
};

const handleConversions = (unitGroups) => {
  if (checkFor(unitGroups, OZ)) {
    if (confirm('Convert oz to lb?')) {
      convertUnits(unitGroups, OZ, LB, 16);
    }
  }
  if (checkFor(unitGroups, FL_OZ)) {
    if (confirm('Convert fl oz to gallons?')) {
      convertUnits(unitGroups, FL_OZ, GAL, 128);
    }
  }
  if (checkFor(unitGroups, ML)) {
    if (confirm('Convert ml to liters?')) {
      convertUnits(unitGroups, ML, LITER, 1000);
    }
  }
};

const parseQuantityString = (string) => {
  if (!/[x\/]/.test(string)) {
    const quantity = string.match(PRICE_REGEX);
    if (quantity) {
      return quantity;
    }
  }
  string = string.replace(/ /gm, '');
  let num1 = '';
  let num2 = '';
  let buildNum1 = true;
  for (let i = 0; i < string.length; i++) {
    if ((!isNaN(string[i]) && string[i] !== '.') || string[i] === '.') {
      if (buildNum1) {
        num1 += string[i];
      } else {
        num2 += string[i];
      }
      continue;
    }
    buildNum1 = false;
  }
  return [Number(num1), Number(num2)];
};

const isRatio = (string) => {
  const [num1, num2] = parseQuantityString(string);
  return num1 + num2 === 100;
};

const getQuantityFromString = (string) => {
  const cleaned = string
    .replace(/ /g, '')
    .replace(new RegExp(UNIT_REGEX, 'i'), '');
  if (isRatio(cleaned)) return 1;
  const [num1, num2] = parseQuantityString(cleaned);
  if (num1 && num2) {
    const output = num1 * num2;
    return output;
  }
  if (num1 && !num2) return num1;
  return 1;
};

const getUnitFromString = (string) => {
  const unitMatch = string.match(unitRegex);
  let unit;
  if (unitMatch) {
    if (unitMatch.length > 1) {
      unit = unitMatch.find(matchedUnit => matchedUnit !== CT && matchedUnit !== PK);
    } else {
      [unit] = unitMatch;
    }
    return unit.replace(/ /gi, '');
  }
};

const getPricePerUnit = (_string) => {
  const string = _string.replace(/\s/gim, '');
  let match;
  if (string.toLowerCase().includes('each')) {
    match = string.match(/[0-9.]*\s?each/gi);
    const [eachString] = match;
    const [priceString, unit] = eachString.split(' ');
    return [Number(priceString), unit];
  }
  match = string.match(/[0-9.]*\/((oz)|(lb)|(ct)|(ounce)|(gal)|(fl\s?oz))/gmi);

  if (match) {
    const priceMatch = match[0].match(new RegExp(`${PRICE_REGEX}${UNIT_REGEX}`));
    const { 0: unit, index } = priceMatch;
    const price = Number(string.slice(0, index - 1));
    return [price, unit];
  }
  return null;
};

function createUnitGroups(table) {
  const unitGroups = {};
  Object.keys(table).forEach((name) => {
    const {
      price, unit: _unit, link, product,
    } = table[name];
    const unit = getUnit(_unit);
    if (unitGroups[unit] === undefined) {
      unitGroups[unit] = [];
    }
    unitGroups[unit].push({
      name: product, price, unit, link,
    });
  });
  return unitGroups;
}

function sortUnitGroups(unitGroups) {
  Object.keys(unitGroups).forEach((group) => {
    const array = unitGroups[group];
    unitGroups[group] = array.sort((a, b) => a.price - b.price);
    const unitGroup = [];
    unitGroups[group].forEach(group => {
      if (isNaN(group.price)) return;
      const pricePerUnit = `$${group.price.toFixed(3)} per ${group.unit}`;
      const output = [pricePerUnit, group.name, group.link.href];
      output.link = group.link;
      unitGroup.push(output);
    });
    unitGroups[group] = unitGroup;
  });
  return unitGroups;
}

const runSearch = () => {
  let selector = getSelector();
  let priceSelector;
  let nameSelector;
  let quantitySelector;
  if (selector instanceof Object) {
    const {
      cardSelector,
      priceSelector: _priceSelector,
      nameSelector: _nameSelector,
      quantitySelector: _quantitySelector,
    } = selector;
    selector = cardSelector;
    priceSelector = _priceSelector;
    nameSelector = _nameSelector;
    quantitySelector = _quantitySelector;
  }

  const cards = document.querySelectorAll(selector);

  const table = {};
  cards.forEach((card) => {
    const { innerText: text } = card;

    let price;
    let unit;
    let pricePerUnit;
    let quantity = 1;

    const linkEl = card.querySelector('a');

    const dollarText = priceSelector ? card.querySelector(priceSelector)?.innerText : text;
    if (!dollarText) return;
    const dollarMatch = dollarText.replace(/\s/gim, '').match(/\$[0-9]+[.]?[0-9]{2}/m);
    if (!dollarMatch) return;
    const { 0: priceString } = dollarMatch;
    price = Number(priceString.replace(/\$/gi, ''));

    const quantityText = quantitySelector ? card.querySelector(quantitySelector).innerText : text;
    const quantityMatch = quantityText.match(quantityMatchRegex);
    if (!quantityMatch) return;
    let quantityString = quantityMatch?.find((string) => quantityMathRegex.test(string) || quantityRegex.test(string))
      ?? quantityMatch[0];
    quantityString = quantityString.toLowerCase();
    // check to see if site already provides price per unit
    const currentPricePerUnit = getPricePerUnit(quantityString);
    if (currentPricePerUnit) {
      const [_price, _unit] = currentPricePerUnit;
      price = _price;
      unit = _unit;
      pricePerUnit = price;
    } else {
      quantity = getQuantityFromString(quantityString);
      unit = getUnitFromString(quantityString);
      pricePerUnit = (price / quantity);
    }

    if (!unit) {
      const unitMatch = text.match(unitRegex);
      if (!unitMatch) return;
      const [rawUnit] = unitMatch;
      unit = rawUnit.toLowerCase().replace(/ /gi, '');
    }

    const productText = nameSelector ? card.querySelector(nameSelector).innerText : text;
    const productName = productText.replace(priceString, '');
    let name = productName;
    const nameMatch = name.match(/ - /);
    if (nameMatch) {
      const { index: seperatorIdx } = nameMatch;
      name = name.slice(0, seperatorIdx);
    }

    const product = productName;
    const tableData = {
      price: pricePerUnit, unit, link: linkEl, product,
    };
    if (table[name] === undefined) {
      table[name] = tableData;
    } else {
      table[productName] = tableData;
    }
  });

  const unitGroups = createUnitGroups(table);
  handleConversions(unitGroups);
  return sortUnitGroups(unitGroups);
};

// actual work is run here
function calculate() {
  return new Promise((resolve, reject) => {
    const limit = 10;
    let i = 0;
    const interval = setInterval(() => {
      if (i === limit) {
        clearInterval(interval);
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          window.requestAnimationFrame(() => {
            setTimeout(() => {
              const searchResults = runSearch();
              if (Object.keys(searchResults).length) {
                console.log('Price per unit. Lower is better. \n', searchResults);
                console.log('searchResults: ', searchResults);
                // renderModal(searchResults);
                resolve(searchResults);
                return searchResults;
              }
              console.log('No results');
              resolve(null);
              return null;
            }, 0);
          });
        }, 0);
      }
      i++;
      window.scrollBy(0, document.body.scrollHeight);
    }, 100);
  });
}

const reduceRequest = (request, sender, sendResponse) => {
  switch (request.type) {
    case 'runSearch':
      calculate().then(resp => {
        sendResponse(resp);
      });
      break;
    default:
      throw new Error(`unhandled type: ${request.type}`);
  }
  return true;
};

chrome.runtime.onMessage.addListener(reduceRequest);
