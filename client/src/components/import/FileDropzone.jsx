import { useRef, useState } from 'react';
import { FiCheckCircle, FiUploadCloud } from 'react-icons/fi';

const allowedExtensions = ['xlsx', 'xls', 'csv'];

export default function FileDropzone({ onFileSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const selectFile = selectedFile => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError('Please choose an XLSX, XLS or CSV file.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    onFileSelected?.(selectedFile);
  };

  const onDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div
      className={dragging ? 'drop dragging' : 'drop'}
      onDragEnter={event => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDragging(true);
      }}
      onDragLeave={event => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setDragging(false);
        }
      }}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={event => selectFile(event.target.files?.[0])}
      />
      {file ? <FiCheckCircle size={38} /> : <FiUploadCloud size={38} />}
      <b>{file ? file.name : 'Drag XLSX, XLS or CSV here'}</b>
      <span>
        {file
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected`
          : 'Drop a file anywhere in this box or click Choose file'}
      </span>
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Choose file
      </button>
      {error && <span className="file-error">{error}</span>}
    </div>
  );
}
