import { useState } from 'react';
import { FiDownload, FiUploadCloud } from 'react-icons/fi';
import PageHeader from '../components/layout/PageHeader.jsx';
import FileDropzone from '../components/import/FileDropzone.jsx';

const columns = [
  'First Name',
  'Last Name',
  'Email',
  'Company',
  'Job Title',
  'Phone',
  'WhatsApp',
  'Website',
  'LinkedIn',
  'Industry',
  'Country',
  'State',
  'City',
  'Source',
  'Source URL',
  'Verification Status',
  'Notes'
];

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 5000);
}

function downloadCsvTemplate() {
  const csv =
    '\uFEFF' +
    columns.map(value => `"${value.replaceAll('"', '""')}"`).join(',') +
    '\r\n';

  triggerDownload(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    'lead-import-template.csv'
  );
}

async function downloadXlsxTemplate() {
  try {
    const module = await import('xlsx');
    const XLSX = module.default || module;
    const worksheet = XLSX.utils.aoa_to_sheet([columns]);
    const workbook = XLSX.utils.book_new();

    worksheet['!cols'] = columns.map(column => ({
      wch: Math.max(column.length + 3, 14)
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const data = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    triggerDownload(
      new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      'lead-import-template.xlsx'
    );
  } catch (error) {
    console.error('XLSX template download failed:', error);
    alert('Unable to create the XLSX template. Please refresh the app and try again.');
  }
}

export default function ImportLeadsPage() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <>
      <PageHeader
        title="Import Leads"
        description="Upload a template or map columns from a flexible spreadsheet."
      />
      <section className="panel">
        <h3>
          <FiUploadCloud /> Import up to 100,000 leads
        </h3>

        <FileDropzone onFileSelected={setSelectedFile} />

        {selectedFile && (
          <div className="selected-file">
            <strong>Ready to import:</strong> {selectedFile.name}
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={downloadXlsxTemplate}>
            <FiDownload /> Download XLSX Template
          </button>
          <button type="button" onClick={downloadCsvTemplate}>
            <FiDownload /> Download CSV Template
          </button>
        </div>
      </section>
    </>
  );
}
