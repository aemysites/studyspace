export default function decorate(block) {
  const contentCol = block.querySelector(':scope > div > div:first-child');

  if (contentCol) {
    // Find the button container and subsequent elements to wrap in dropzone
    const buttonContainer = contentCol.querySelector('.button-container');

    if (buttonContainer) {
      // Create dropzone wrapper
      const dropzone = document.createElement('div');
      dropzone.className = 'dropzone';

      // Find elements to move into dropzone:
      // - button container
      // - "Or drag and drop here" (next sibling)
      // - "File must be PDF..." (sibling after that)
      const elementsToWrap = [buttonContainer];

      let nextEl = buttonContainer.nextElementSibling;
      // Get "Or drag and drop here" paragraph
      if (nextEl && nextEl.tagName === 'P') {
        elementsToWrap.push(nextEl);
        nextEl = nextEl.nextElementSibling;
      }
      // Get "File must be PDF..." paragraph
      if (nextEl && nextEl.tagName === 'P') {
        elementsToWrap.push(nextEl);
      }

      // Insert dropzone before button container
      buttonContainer.parentNode.insertBefore(dropzone, buttonContainer);

      // Move elements into dropzone
      elementsToWrap.forEach((el) => dropzone.appendChild(el));
    }
  }
}
