import React, { useRef } from 'react';
import { TextInput, View, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { styles } from './styles';

const OTP_LENGTH = 6;

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export const OtpBoxInput: React.FC<Props> = ({ value, onChange, disabled }) => {
  const { colors } = useTheme();
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[index] = digit;
    const joined = next.join('').padEnd(OTP_LENGTH, '').slice(0, OTP_LENGTH);
    onChange(joined.trimEnd());

    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (digits.length > 1) {
      onChange(digits);
      refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
    } else {
      handleChange(text, index);
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const isFilled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={ref => { refs.current[i] = ref; }}
            style={[
              styles.box,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: isFilled ? '#7C3AED' : colors.border,
              },
            ]}
            value={value[i] ?? ''}
            onChangeText={text => handlePaste(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            keyboardType="numeric"
            maxLength={OTP_LENGTH}
            selectTextOnFocus
            editable={!disabled}
          />
        );
      })}
    </View>
  );
};
