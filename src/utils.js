// ==== Modal Logic Start ====
const applyStyles = (node, styles) => {
  for (const style in styles) {
    node.style[style] = styles[style];
  }
};

const removeModal = () => {
  const oldModal = document.querySelector('#search_results_id');
  if (oldModal) { document.body.removeChild(oldModal); }
};

export function renderModal(searchResults) {
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
