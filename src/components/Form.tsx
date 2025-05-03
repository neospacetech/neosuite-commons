import React from 'react';
import { View, Text, Switch as RNSwitch, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Input } from './Input'; // Assume default export is a TextInput wrapper
import { Buttons } from './Button'; // Import buttons from button.tsx

// Submit button using ButtonCTA style from Button.tsx
export const Submit = ({
  onPress,
  children,
  disabled,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <Buttons.ButtonCTA onPress={onPress} disabled={disabled}>
    {children}
  </Buttons.ButtonCTA>
);

// Input proxy
export const TextInput = Input;

// Switch component
export const Switch = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
    <Text style={{ marginRight: 8 }}>{label}</Text>
    <RNSwitch value={value} onValueChange={onValueChange} />
  </View>
);

// Checkbox component
export const Checkbox = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
  <Pressable
    onPress={() => onValueChange(!value)}
    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: value ? '#333' : 'transparent',
        marginRight: 8,
      }}
    />
    <Text>{label}</Text>
  </Pressable>
);

// Select component
type Option = { label: string; value: string };

export const Select = ({
  selectedValue,
  onValueChange,
  options,
}: {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
}) => (
  <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
    {options.map((opt) => (
      <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
    ))}
  </Picker>
);

// Form wrapper
export const Form = ({ children }: { children: React.ReactNode }) => (
  <View style={{ gap: 12 }}>{children}</View>
);

export const FormEls = {
    Submit,
    TextInput,
    Switch,
    Checkbox,
    Select,
    Form,
}