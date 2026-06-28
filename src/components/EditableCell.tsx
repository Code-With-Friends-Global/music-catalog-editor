import { useEffect, useRef, useState } from 'react';

interface EditableCellProps {
  value: string;
  fieldName: string;
  rowId: string;
  type: 'text' | 'dropdown' | 'number';
  options?: readonly string[];
  validate?: (v: string) => string | null;
  onCommit: (rowId: string, field: string, value: string) => void;
  isActive: boolean;
}

export function EditableCell({
  value,
  fieldName,
  rowId,
  type,
  options,
  validate,
  onCommit,
  isActive,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const previousValue = useRef<string>(value);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  function handleFocus() {
    previousValue.current = editValue;
    setIsEditing(true);
  }

  function commit(currentValue: string): boolean {
    if (validate) {
      const err = validate(currentValue);
      if (err) {
        setError(err);
        setEditValue(previousValue.current);
        return false;
      }
    }
    setError(null);
    onCommit(rowId, fieldName, currentValue);
    return true;
  }

  function handleBlur() {
    const success = commit(editValue);
    if (success) {
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const success = commit(editValue);
      if (success || !validate) {
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } else if (e.key === 'Tab') {
      commit(editValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditValue(previousValue.current);
      setError(null);
      setIsEditing(false);
    }
  }

  const inputClassName = 'w-full bg-transparent border-b border-blue-400 outline-none text-sm px-1';
  const spanClassName = 'block w-full text-sm px-1 py-0.5 cursor-pointer truncate min-w-[80px]';
  const tdClassName = `border border-gray-200 p-0 relative${isActive ? ' bg-blue-50' : ''}`;

  function renderEditor() {
    if (type === 'dropdown') {
      return (
        <select
          className={inputClassName}
          aria-label={fieldName}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        >
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        className={inputClassName}
        aria-label={fieldName}
        type={type === 'number' ? 'text' : 'text'}
        inputMode={type === 'number' ? 'numeric' : undefined}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  function renderDisplay() {
    return (
      <span
        className={spanClassName}
        tabIndex={0}
        onFocus={handleFocus}
        onClick={handleFocus}
      >
        {editValue || (type === 'dropdown' ? '\u00A0' : '—')}
      </span>
    );
  }

  return (
    <td className={tdClassName}>
      {isEditing ? renderEditor() : renderDisplay()}
      {error && (
        <span role="alert" className="text-red-500 text-xs block">
          {error}
        </span>
      )}
    </td>
  );
}
