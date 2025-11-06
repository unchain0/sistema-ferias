import { render, screen, fireEvent } from '@testing-library/react';
import { DateInput } from '../DateInput';

describe('DateInput', () => {
  it('should format the date as dd/mm/yyyy', () => {
    const handleChange = jest.fn();
    render(<DateInput value="2024-01-01" onChange={handleChange} />);
    const input = screen.getByDisplayValue('01/01/2024');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange with the date in yyyy-mm-dd format', () => {
    const handleChange = jest.fn();
    render(<DateInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('dd/mm/aaaa');
    fireEvent.change(input, { target: { value: '01/01/2024' } });
    fireEvent.blur(input);
    expect(handleChange).toHaveBeenCalledWith('2024-01-01');
  });

  it('should handle invalid date input', () => {
    const handleChange = jest.fn();
    render(<DateInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('dd/mm/aaaa');
    fireEvent.change(input, { target: { value: 'invalid-date' } });
    fireEvent.blur(input);
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
