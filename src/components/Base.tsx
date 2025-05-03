import React from 'react';
import { View, Text, ViewStyle, SafeAreaView, ScrollView } from 'react-native';
import tw from 'twrnc';

type ContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Container = ({ children, style }: ContainerProps) => (
  <View style={[tw`flex-1 p-4 bg-gray-900`, style]}>
    {children}
  </View>
);

type SectionProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Section = ({ children, style }: SectionProps) => (
  <View style={[tw`mb-6`, style]}>
    {children}
  </View>
);

type PageProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
};

export const Page = ({ children, style, scrollable = true }: PageProps) => {
  if (scrollable) {
    return (
      <SafeAreaView style={[tw`flex-1 bg-gray-900`, style]}>
        <ScrollView contentContainerStyle={tw`p-4 bg-gray-900`} style={[tw`flex-1`]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1 bg-gray-900`, style]}>
      <View style={[tw`p-4 bg-gray-900`, style]}>{children}</View>
    </SafeAreaView>
  );
};

type HeaderProps = {
  title: string;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export const Header = ({ title, style, children }: HeaderProps) => (
  <View style={[tw`py-8 flex flex-row items-center justify-between`, style]}>
    <Text style={tw`text-2xl font-semibold text-white`}>{title}</Text>
    <View style={tw`flex items-center justify-center`}>
        {children}
    </View>
  </View>
);

type DividerProps = {
  style?: ViewStyle;
};

export const Divider = ({ style }: DividerProps) => (
  <View style={[tw`my-2`, style]}>
    <View style={[tw`border-t border-gray-700`]} />
  </View>
);

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Card = ({ children, style }: CardProps) => (
  <View style={[tw`bg-gray-800 rounded-lg shadow-lg p-4`, style]}>
    {children}
  </View>
);

type FlexRowProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const FlexRow = ({ children, style }: FlexRowProps) => (
  <View style={[tw`flex-row justify-between`, style]}>{children}</View>
);

type FlexColumnProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const FlexColumn = ({ children, style }: FlexColumnProps) => (
  <View style={[tw`flex-col`, style]}>{children}</View>
);

export const Base = {
  Page,
  Section,
  Container,
  Header,
  Divider,
  Card,
  FlexRow,
  FlexColumn,
};
