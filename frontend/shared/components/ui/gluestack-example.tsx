/**
 * Example usage of Gluestack UI Components
 * This file demonstrates how to use the new Gluestack components
 */

import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  GluestackButton,
  GluestackInput,
  GluestackCard,
  GluestackCheckbox,
  GluestackSwitch,
  GluestackProgress,
} from "./gluestack-index";
import { EmailIcon, LockIcon } from "./Icons";

export function GluestackExample() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">Gluestack UI Components</Text>

      {/* Button Examples */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Buttons</Text>
        <GluestackButton
          onPress={() => setLoading(!loading)}
          variant="primary"
          isLoading={loading}
          fullWidth
          className="mb-2"
        >
          Primary Button {loading ? "(Loading)" : ""}
        </GluestackButton>
        <GluestackButton
          onPress={() => {}}
          variant="secondary"
          fullWidth
          className="mb-2"
        >
          Secondary Button
        </GluestackButton>
        <GluestackButton
          onPress={() => {}}
          variant="outline"
          fullWidth
          className="mb-2"
        >
          Outline Button
        </GluestackButton>
        <GluestackButton
          onPress={() => {}}
          variant="ghost"
          fullWidth
        >
          Ghost Button
        </GluestackButton>
      </View>

      {/* Input Examples */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Inputs</Text>
        <GluestackInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          leftElement={<EmailIcon size={20} color="#6B7280" />}
          floatingLabel
        />
        <GluestackInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftElement={<LockIcon size={20} color="#6B7280" />}
          floatingLabel
        />
        <GluestackInput
          label="With Error"
          placeholder="This has an error"
          error="This field is required"
          floatingLabel
        />
      </View>

      {/* Card Examples */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Cards</Text>
        <GluestackCard
          isSelected={false}
          onPress={() => {}}
          className="mb-2"
        >
          <Text className="font-semibold">Regular Card</Text>
          <Text className="text-gray-600">Tap me!</Text>
        </GluestackCard>
        <GluestackCard isSelected={true} onPress={() => {}}>
          <Text className="font-semibold">Selected Card</Text>
          <Text className="text-gray-600">I'm selected!</Text>
        </GluestackCard>
      </View>

      {/* Checkbox Example */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Checkbox</Text>
        <GluestackCheckbox
          isChecked={rememberMe}
          onChange={setRememberMe}
          label="Remember me for 30 days"
        />
        <GluestackCheckbox
          isChecked={false}
          onChange={() => {}}
          label="Terms and Conditions"
          isInvalid
        />
      </View>

      {/* Switch Example */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Switch</Text>
        <View className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-2">
          <Text>Enable Notifications</Text>
          <GluestackSwitch
            isChecked={notifications}
            onToggle={setNotifications}
          />
        </View>
        <View className="flex-row items-center justify-between bg-white p-4 rounded-xl">
          <Text>Dark Mode</Text>
          <GluestackSwitch
            isChecked={false}
            onToggle={() => {}}
            isDisabled
          />
        </View>
      </View>

      {/* Progress Example */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-3">Progress</Text>
        <GluestackProgress value={3} max={5} showLabel />
        <GluestackProgress value={75} max={100} showLabel className="mt-4" />
      </View>
    </ScrollView>
  );
}

