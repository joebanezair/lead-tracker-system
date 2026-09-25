import { FiDownload, FiUploadCloud } from 'react-icons/fi';
import * as XLSX from 'xlsx';
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

function downloadCsvTemplate() {
  const csv = columns.map(value => `"${value.replaceAll('"', '""')}"`).join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'lead-import-template.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadXlsxTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([columns]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
  XLSX.writeFile(workbook, 'lead-import-template.xlsx');
}

export default function ImportLeadsPage() {
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
        <FileDropzone />
        <div className="actions">
          <button type="button" onClick={downloadXlsxTemplate}>
            <FiDownload /> XLSX Template
          </button>
          <button type="button" onClick={downloadCsvTemplate}>
            <FiDownload /> CSV Template
          </button>
        </div>
      </section>
    </>
  );
}
