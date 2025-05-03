import React from 'react';
import { Text, Pressable, PressableProps } from 'react-native';
import tw from 'twrnc';

type ButtonProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
} & PressableProps;

const BaseButton = ({
  children = 'Click me',
  onPress,
  disabled = false,
  style,
  baseClass,
  pressedClass,
  ...props
}: ButtonProps & {
  baseClass: string;
  pressedClass: string;
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) =>
        tw.style(
          baseClass,
          disabled && 'opacity-50',
          pressed && !disabled && pressedClass,
        )
      }
      {...props}
    >
      <Text style={tw`text-white text-sm font-medium text-center`}>
        {children}
      </Text>
    </Pressable>
  );
};

export const Button = (props: ButtonProps) => (
  <BaseButton
    {...props}
    baseClass="self-start bg-blue-600 border border-blue-700 rounded-lg px-4 py-2.5 mr-2 mb-2"
    pressedClass="bg-blue-700"
  />
);

export const ButtonCTA = (props: ButtonProps) => (
  <BaseButton
    {...props}
    baseClass="self-start bg-cyan-600 border border-cyan-700 rounded-lg px-4 py-2.5 mr-2 mb-2"
    pressedClass="bg-cyan-700"
  />
);

export const ButtonPrimary = (props: ButtonProps) => (
  <BaseButton
    {...props}
    baseClass="self-start bg-cyan-500 border border-cyan-600 rounded-lg px-4 py-2.5 mr-2 mb-2"
    pressedClass="bg-cyan-700"
  />
);

export const ButtonSecondary = (props: ButtonProps) => (
  <BaseButton
    {...props}
    baseClass="self-start bg-gray-600 border border-gray-700 rounded-lg px-4 py-2.5 mr-2 mb-2"
    pressedClass="bg-gray-700"
  />
);

export const Buttons = {
    Button,
    ButtonCTA,
    ButtonPrimary,
    ButtonSecondary,
}
