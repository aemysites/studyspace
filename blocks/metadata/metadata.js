/**
 * Metadata block - extracts page metadata and hides itself
 */
export default function decorate(block) {
  // The metadata block should be hidden from display
  // Metadata is already processed by the AEM system
  const section = block.closest('.section');
  if (section) {
    section.remove();
  } else {
    block.closest('.metadata-container')?.remove();
  }
}
