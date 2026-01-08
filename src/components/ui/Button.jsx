import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-6 py-2 rounded-lg font-medium transition-colors duration-200';
  
  const variants = {
    primary: 'bg-[#4169E1] text-white hover:bg-[#3A5FCD]',
    secondary: 'border border-[#4169E1] text-[#4169E1] hover:bg-[#4169E1] hover:text-white',
    outline: 'border border-gray-300 text-black hover:border-[#4169E1] hover:text-[#4169E1]',
    ghost: 'text-black hover:text-[#4169E1]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;