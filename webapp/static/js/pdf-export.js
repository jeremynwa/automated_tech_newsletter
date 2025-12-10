// ===== PDF EXPORT FUNCTIONALITY =====
// Uses jsPDF library (free, loaded from CDN)

const exportPDFButton = document.getElementById('export-pdf-button');

exportPDFButton.addEventListener('click', async () => {
  // Show loading state
  const originalHTML = exportPDFButton.innerHTML;
  exportPDFButton.disabled = true;
  exportPDFButton.innerHTML = '<span>⏳</span><span>Generating...</span>';
  
  try {
    await generatePDF();
    exportPDFButton.innerHTML = '<span>✓</span><span>Downloaded!</span>';
    setTimeout(() => {
      exportPDFButton.disabled = false;
      exportPDFButton.innerHTML = originalHTML;
    }, 2000);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
    exportPDFButton.disabled = false;
    exportPDFButton.innerHTML = originalHTML;
  }
});

async function generatePDF() {
  // Wait for jsPDF to load
  if (typeof window.jspdf === 'undefined') {
    throw new Error('jsPDF library not loaded');
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(6, 182, 212);
  doc.text('Tech Digest Export', margin, yPos);
  yPos += 10;
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;
  
  // Get visible articles
  const visibleDigests = document.querySelectorAll('.digest-day:not(.hidden)');
  
  if (visibleDigests.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('No articles to export. Try adjusting your filters.', margin, yPos);
    doc.save('tech-digest-export.pdf');
    return;
  }
  
  // Process each digest
  visibleDigests.forEach((digest, digestIndex) => {
    const date = digest.querySelector('.date-text')?.textContent || 'Unknown Date';
    const sections = digest.querySelectorAll('.section:not([style*="display: none"])');
    
    // Add date header
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(6, 182, 212);
    doc.text(date, margin, yPos);
    yPos += 8;
    
    // Process each section
    sections.forEach(section => {
      const sectionTitle = section.querySelector('h2')?.textContent || 'Section';
      const articles = section.querySelectorAll('.article:not(.hidden)');
      
      if (articles.length === 0) return;
      
      // Section title
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(8, 145, 178);
      doc.text(sectionTitle, margin, yPos);
      yPos += 7;
      
      // Process articles
      articles.forEach((article, articleIndex) => {
        const title = article.querySelector('.article-title a')?.textContent || 'Untitled';
        const summary = article.querySelector('.article-summary')?.textContent || '';
        
        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }
        
        // Article title
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(title, maxWidth);
        doc.text(titleLines, margin, yPos);
        yPos += titleLines.length * 5 + 3;
        
        // Article summary
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60);
        
        // Clean summary text (remove HTML, bullets, etc.)
        const cleanSummary = summary
          .replace(/Why This Matters:/g, '\nWhy This Matters:')
          .replace(/•/g, '- ')
          .trim();
        
        const summaryLines = doc.splitTextToSize(cleanSummary, maxWidth);
        const maxSummaryLines = 15; // Limit summary length
        const displayLines = summaryLines.slice(0, maxSummaryLines);
        
        displayLines.forEach(line => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin, yPos);
          yPos += 4;
        });
        
        if (summaryLines.length > maxSummaryLines) {
          doc.text('[...]', margin, yPos);
          yPos += 4;
        }
        
        yPos += 5; // Space between articles
      });
      
      yPos += 3; // Space between sections
    });
    
    yPos += 5; // Space between digests
  });
  
  // Save PDF
  const filename = `tech-digest-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Check if jsPDF is loaded
if (typeof window.jspdf === 'undefined') {
  console.warn('jsPDF not loaded yet, export button may not work immediately');
}