import { FiUploadCloud } from 'react-icons/fi';

export default function FileDropzone() {
  return (
    <div className="drop">
      <FiUploadCloud size={38} />
      <b>Drag XLSX, XLS or CSV here</b>
      <span>Flexible column mapping supported · up to 100,000 rows</span>
      <button>Choose file</button>
    </div>
  );
}
