const OZ = 'oz';
const OUNCE = 'ounce';
const LB = 'lb';
const POUND = 'pound';
const CT = 'ct';
const FL_OZ = 'floz';
const GAL = 'gal';

const PK = 'PK';

// units
// (oz)|(lb)|(ct)|(ounce)|(gal)|(fl ?oz)
const UNIT_REGEX = ' ?((oz)|(lb)|(ct)|(pk)|(ounce)|(gal)|(fl ?oz))';
const PRICE_REGEX = '[0-9.]*';

const quantityMatchRegex = new RegExp(`[0-9.]+(${UNIT_REGEX})? ?[x\/-]* ?[0-9.]*${UNIT_REGEX}`, 'gim');
const quantityRegex = new RegExp(`[0-9.]+${UNIT_REGEX}`, 'gi');
const unitRegex = new RegExp(UNIT_REGEX, 'gi');
const quantityMathRegex = new RegExp(`[0-9.]* ?[x\/-]+ ?[0-9.]*${UNIT_REGEX}`, 'gi');

const AMAZON_SELECTOR = '[data-component-type="s-search-result"]';
const TARGET_SELECTOR = '[data-test="productCardBody"]';
const SHIPT_SELECTOR = '[data-test="ProductCard"]';
const INSTACART_SELECTOR = "[data-radium='true'].item-card";
const SAY_WEEE_SELECTOR = '.product-media';

const domain = document.location.hostname;
const selector = (() => {
  switch (domain.toLowerCase()) {
    case 'www.target.com':
      return TARGET_SELECTOR;
    case 'www.amazon.com':
      return AMAZON_SELECTOR;
    case 'shop.shipt.com':
      return SHIPT_SELECTOR;
    case 'www.instacart.com':
    case 'sameday.costco.com':
      return INSTACART_SELECTOR;
    case 'www.sayweee.com':
      return SAY_WEEE_SELECTOR;
    default:
      throw new Error(`Unhandled domain: ${domain}`);
  }
})();

const getUnit = (unit) => {
  switch (unit) {
    case OZ:
    case OUNCE:
      return OZ;
    case LB:
    case POUND:
      return LB;
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
  const hasOz = checkFor(unitGroups, OZ);
  const hasFlOz = checkFor(unitGroups, FL_OZ);
  if (hasOz) {
    if (confirm('Convert oz to lb?')) {
      convertUnits(unitGroups, OZ, LB, 16);
    }
  }
  if (hasFlOz) {
    if (confirm('Convert fl oz to gallons?')) {
      convertUnits(unitGroups, FL_OZ, GAL, 128);
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
  const unitMatch = string.match(UNIT_REGEX);
  if (unitMatch) {
    const [unit] = unitMatch;
    return unit.replace(/ /gi, '');
  }
};

const getPricePerUnit = (string) => {
  const match = string.match(/[0-9.]*\/((oz)|(lb)|(ct)|(ounce)|(gal)|(fl ?oz))/gi);
  if (match) {
    const priceMatch = match[0].match(new RegExp(`${PRICE_REGEX}${UNIT_REGEX}`));
    const { 0: unit, index } = priceMatch;
    const price = Number(string.slice(0, index - 1));
    return [price, unit];
  }
  return null;
};

const runSearch = () => {
  const cards = document.querySelectorAll(selector);

  const table = {};
  cards.forEach((card) => {
    const { innerText: text } = card;

    let productName;
    let price;
    let unit;
    let pricePerUnit;
    let quantity = 1;

    const linkEl = card.querySelector('a');

    const dollarMatch = text.match(/\$[0-9]+[.]?[0-9]{2}/m);
    if (!dollarMatch) return;
    const { 0: priceString } = dollarMatch;
    price = Number(priceString.replace(/\$/gi, ''));

    const quantityMatch = text.match(quantityMatchRegex);
    if (!quantityMatch) return;
    let quantityString = quantityMatch.find((string) => quantityMathRegex.test(string) || quantityRegex.test(string))
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
    if (!pricePerUnit) { // sanity check
      pricePerUnit = (price / quantity);
    }
    pricePerUnit = pricePerUnit;

    if (!unit) {
      const unitMatch = text.match(unitRegex);
      if (!unitMatch) return;
      const [rawUnit] = unitMatch;
      unit = rawUnit.toLowerCase().replace(/ /gi, '');
    }

    productName = text.replace(priceString, '');
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

  handleConversions(unitGroups);

  Object.keys(unitGroups).forEach((group) => {
    const array = unitGroups[group];
    unitGroups[group] = array.sort((a, b) => a.price - b.price);
    unitGroups[group] = unitGroups[group].map((group) => {
      const pricePerUnit = `$${group.price.toFixed(3)} per ${group.unit}`;
      const output = [pricePerUnit, group.name];
      output.link = group.link;
      return output;
    });
  });
  return unitGroups;
};

// ==== Modal Logic Start ====
const applyStyles = (node, styles) => {
  for (style in styles) {
    node.style[style] = styles[style];
  }
};

const removeModal = () => {
  const oldModal = document.querySelector('#search_results_id');
  if (oldModal) { document.body.removeChild(oldModal); }
};

function renderModal(searchResults) {
  removeModal();
  const modal = document.createElement('div');
  modal.id = 'search_results_id';
  applyStyles(modal, {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  });
  const modalContent = document.createElement('div');
  applyStyles(modalContent, {
    top: '10px',
    right: '10px',
    height: '70%',
    width: '35%',
    minWidth: '500px',
    backgroundColor: 'white',
    borderRadius: '6px',
    margin: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 17px 3px rgba(0, 0, 0, 0.25)',
  });
  const modalHeader = document.createElement('header');
  applyStyles(modalHeader, {
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eee',
  });
  const headerLeft = document.createElement('h4');
  headerLeft.innerText = 'Please double check values!';
  const headerRight = document.createElement('button');
  headerRight['aria-label'] = 'close result list';
  headerRight.innerText = 'X';
  headerRight.onclick = () => {
    document.body.removeChild(modal);
  };
  append(modalHeader).add(headerLeft, headerRight);
  const modalBody = document.createElement('div');
  applyStyles(modalBody, {
    padding: '10px',
    overflow: 'scroll',
  });
  const units = Object.keys(searchResults);
  units.forEach((unit) => {
    const unitList = document.createElement('ul');
    const list = searchResults[unit];
    list.forEach((result) => {
      const listItem = document.createElement('li');
      applyStyles(listItem, {
        padding: '5px',
        borderBottom: '1px solid #eee',
        marginBottom: '5px',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      });
      listItem.onclick = () => {
        removeModal();
        result.link.click();
      };
      listItem.innerHTML = `<b>${result[0]}</b>: ${result[1]}`;
      append(unitList).add(listItem);
    });
    const label = document.createElement('h4');
    label.innerText = `Unit: ${unit}`;
    append(label).to(modalBody);
    append(unitList).to(modalBody);
  });

  if (!units.length) {
    const notice = document.createElement('p');
    notice.innerText = 'No Results Found!';
    append(modalBody).add(notice);
  }

  append(document.body)
    .add(modal);
  append(modal)
    .add(modalContent);
  append(modalContent)
    .add(modalHeader, modalBody);
}

function append(...nodes) {
  const output = {
    to: (targetNode) => {
      nodes.forEach((node) => {
        targetNode.appendChild(node);
      });
      return output;
    },
    add: (...childNodes) => {
      if (nodes.length > 1) {
        throw new Error('You can not add to multiple nodes');
      }
      childNodes.forEach((childNode) => {
        nodes[0].appendChild(childNode);
      });
      return output;
    },
  };
  return output;
}
// ==== Modal Logic End ====

// actual work is run here
function calculate() {
  const limit = 10;
  let i = 0;
  const interval = setInterval(() => {
    if (i === limit) {
      clearInterval(interval);
      setTimeout(() => {
        window.scrollTo(0, 0);
        setTimeout(() => {
          const searchResults = runSearch();
          if (Object.keys(searchResults).length) {
            console.log('Price per unit. Lower is better. \n', searchResults);
            // renderModal(searchResults);
            return searchResults;
          }
          console.log('No results');
        }, 0);
      }, 0);
    }
    i++;
    window.scrollBy(0, document.body.scrollHeight);
  }, 100);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  calculate().then((resp) => sendResponse(resp));
  return true;
});
