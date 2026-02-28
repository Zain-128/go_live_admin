import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ value, onValueChange, placeholder, children, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  // Extract SelectItem children from SelectContent or direct children
  const getSelectItems = () => {
    const items = [];
    React.Children.forEach(children, (child) => {
      if (!child) return;

      // Check if it's a SelectContent wrapper
      if (child.type === SelectContent || child.type?.name === 'SelectContent') {
        React.Children.forEach(child.props.children, (item) => {
          if (item && item.props && item.props.value !== undefined) {
            items.push(item);
          }
        });
      }
      // Check if it's a direct SelectItem
      else if (child.props && child.props.value !== undefined) {
        items.push(child);
      }
    });
    return items;
  };

  const selectItems = getSelectItems();
  const selectedItem = selectItems.find(item => item.props.value === value);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={selectedItem ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedItem ? selectedItem.props.children : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {selectItems.map((item) => (
            <div
              key={item.props.value}
              className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                item.props.value === value ? 'bg-accent' : ''
              }`}
              onClick={() => handleSelect(item.props.value)}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {item.props.value === value && <Check className="h-4 w-4" />}
              </span>
              {item.props.children}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ value, children }) => {
  return <div value={value}>{children}</div>;
};

const SelectContent = ({ children }) => {
  return <>{children}</>;
};

const SelectTrigger = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

const SelectValue = ({ placeholder }) => {
  return <span className="text-muted-foreground">{placeholder}</span>;
};

export { Select, SelectItem, SelectContent, SelectTrigger, SelectValue };