import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  options = [],
  value, 
  onChange, 
  disabled = false, 
  required = false,
  placeholder = "Select an option",
  name = "",
  id = "",
  className = "",
  showStatusDots = false
}: 
{
    options: { value: string; label: string; disabled?: boolean; dotColor?: string; className?: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    name?: string;
    id?: string;
    className?: string;
    showStatusDots?: boolean;
}
) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        event.target instanceof Node &&
        !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (!options.find(opt => opt.value === optionValue)?.disabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' && isOpen) {
      event.preventDefault();
      // Focus next option logic could be added here
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      // Focus previous option logic could be added here
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <input type="hidden" name={name} value={value} required={required} />
      
      <button
        type="button"
        id={id}
        className={`
          relative w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 ease-in-out
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:border-gray-400 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showStatusDots && selectedOption?.dotColor && (
              <div className={`w-3 h-3 rounded-full ${selectedOption.dotColor}`}></div>
            )}
            <span className={`block truncate text-sm ${
              selectedOption && selectedOption.value !== '' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {options.map((option, index) => (
              <div
                key={option.value || index}
                className={`
                  relative cursor-pointer select-none px-4 py-2.5 text-sm
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-gray-50 text-gray-900'
                  }
                  ${option.value === value ? 'bg-blue-50 text-blue-700' : ''}
                  ${option.className || ''}
                  transition-colors duration-150
                `}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {showStatusDots && option.dotColor && (
                      <div className={`w-3 h-3 rounded-full ${option.dotColor}`}></div>
                    )}
                    <span className="block truncate">{option.label}</span>
                  </div>
                  
                  {option.value === value && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage components
// const StatusSelectExample = () => {
//   const [status, setStatus] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const statusOptions = [
//     { value: "", label: "Select status", disabled: true },
//     { value: "OPEN", label: "To Do", dotColor: "bg-gray-400" },
//     { value: "IN_PROGRESS", label: "In Progress", dotColor: "bg-blue-500" },
//     { value: "REVIEW", label: "Under Review", dotColor: "bg-yellow-500" },
//     { value: "DONE", label: "Completed", dotColor: "bg-green-500" },
//     { value: "OVERDUE", label: "Overdue", dotColor: "bg-red-500" },
//     { value: "CANCELLED", label: "Cancelled", dotColor: "bg-gray-500" }
//   ];

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
//       <h3 className="text-lg font-semibold mb-4">Task Status</h3>
//       <CustomSelect
//         options={statusOptions}
//         value={status}
//         onChange={setStatus}
//         placeholder="Select status"
//         name="status"
//         id="status"
//         disabled={isSubmitting}
//         required
//         showStatusDots={true}
//       />
//       <p className="mt-2 text-sm text-gray-600">Selected: {status || 'None'}</p>
//     </div>
//   );
// };

// const PrioritySelectExample = () => {
//   const [priority, setPriority] = useState('');

//   const priorityOptions = [
//     { value: "", label: "Select priority", disabled: true },
//     { value: "LOW", label: "Low Priority" },
//     { value: "MEDIUM", label: "Medium Priority" },
//     { value: "HIGH", label: "High Priority" },
//     { value: "URGENT", label: "Urgent" }
//   ];

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
//       <h3 className="text-lg font-semibold mb-4">Task Priority</h3>
//       <CustomSelect
//         options={priorityOptions}
//         value={priority}
//         onChange={setPriority}
//         placeholder="Choose priority level"
//         name="priority"
//         id="priority"
//       />
//       <p className="mt-2 text-sm text-gray-600">Selected: {priority || 'None'}</p>
//     </div>
//   );
// };

// const App = () => {
//   return (
//     <div className="min-h-screen bg-gray-100 py-8">
//       <div className="max-w-4xl mx-auto space-y-8">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
//           Custom Select Component Examples
//         </h1>
        
//         <div className="grid md:grid-cols-2 gap-8">
//           <StatusSelectExample />
//           <PrioritySelectExample />
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-lg font-semibold mb-4">Usage Example</h3>
//           <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
// {`const options = [
//   { value: "", label: "Select status", disabled: true },
//   { value: "OPEN", label: "To Do", dotColor: "bg-gray-400" },
//   { value: "IN_PROGRESS", label: "In Progress", dotColor: "bg-blue-500" }
// ];

// <CustomSelect
//   options={options}
//   value={selectedValue}
//   onChange={setSelectedValue}
//   placeholder="Select an option"
//   name="fieldname"
//   id="select-id"
//   showStatusDots={true}
//   required
// />`}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
export default CustomSelect;
