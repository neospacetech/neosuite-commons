import React from 'react';
import { TextInput, View } from 'react-native';
// import { Text, ArrowDown3 } from 'iconsax-react-nativejs';
import tw from 'twrnc';

type InputTextProps = {
  type?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  className?: string;
  disabled?: boolean;
};

export const InputText = ({
  type = 'text',
  placeholder = 'Enter text',
  onChangeText,
  className = '',
  disabled = false,
}: InputTextProps) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="rgba(255, 255, 255, 0.7)"onChangeText={onChangeText}
      editable={!disabled}
      style={tw.style(
        'dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800',
        'bg-white text-gray-900 border border-gray-300',
        'focus:ring-blue-500 focus:ring-offset-blue-200',
        'self-start font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 transition-all duration-300 ease-in-out',
        disabled && 'opacity-50',
        className
      )}
    />
  );
};

type IconInputTextProps = {
  Icon?: React.ComponentType<any>;
  type?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  className?: string;
  disabled?: boolean;
};

export const IconInputText = ({
//   Icon = Text,
  type = 'text',
  placeholder = 'Enter text',
  onChangeText,
  className = '',
  disabled = false,
}: IconInputTextProps) => {
  return (
    <View
      style={tw.style(
        'flex dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800',
        'bg-white text-gray-900 border border-gray-300',
        'focus:ring-blue-500 focus:ring-offset-blue-200',
        'self-start font-medium rounded-lg mr-2 mb-2 transition-all duration-300 ease-in-out',
        disabled && 'opacity-50',
        className
      )}
    >
      <View style={tw`flex items-center pl-2`}>
        {/* <Icon size="24" variant="Bulk" color="currentColor" /> */}
      </View>
      <TextInput
        placeholder={placeholder}
      placeholderTextColor="rgba(255, 255, 255, 0.7)"  onChangeText={onChangeText}
        editable={!disabled}
        style={tw`text-sm pl-2 pr-4 py-2.5`}
      />
    </View>
  );
};

type InputTextAreaProps = {
  placeholder?: string;
  onChangeText: (text: string) => void;
  className?: string;
  disabled?: boolean;
};

export const InputTextArea = ({
  placeholder = 'Enter text',
  onChangeText,
  className = '',
  disabled = false,
}: InputTextAreaProps) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="rgba(255, 255, 255, 0.7)"
      onChangeText={onChangeText}
      editable={!disabled}
      multiline
      style={tw.style(
        'dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800',
        'bg-white text-gray-900 border border-gray-300',
        'focus:ring-blue-500 focus:ring-offset-blue-200',
        'self-start font-medium rounded-lg text-sm px-4 py-2.5 mr-2 mb-2 transition-all duration-300 ease-in-out',
        disabled && 'opacity-50',
        className
      )}
    />
  );
};

export const Input = {
    InputText,
    IconInputText,
    InputTextArea
}
