import React from 'react';
import { Select, SelectProps } from '@chakra-ui/react';
import { languages } from '../../utils/language';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <Select
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      size="lg"
      width="auto"
      minWidth="120px"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
};

export default LanguageSelector; 