import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export default function ResumeTips() {
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeSize, setResumeSize] = useState<number | null>(null);

  const handlePickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets?.[0];
    if (!file) {
      Alert.alert("Upload failed", "We couldn't access the selected file. Please try again.");
      return;
    }

    setResumeName(file.name ?? "Resume");
    setResumeSize(file.size ?? null);
  };

  const handleSave = () => {
    if (!resumeName) {
      Alert.alert("Add a resume", "Please upload your resume before saving.");
      return;
    }
    Alert.alert("Saved", "Your resume has been attached. We'll personalize tips next.");
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900 px-6 py-6 space-y-3">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        Resume Upload + AI Tips
      </Text>
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
        <View>
          <Text className="text-gray-900 dark:text-white font-semibold">Upload resume</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            PDF or DOCX up to 5MB. We'll extract key skills and optimize your profile.
          </Text>
        </View>
        <TouchableOpacity
          className="bg-white dark:bg-gray-900 rounded-lg py-2 border border-gray-200 dark:border-gray-700"
          onPress={handlePickResume}
        >
          <Text className="text-gray-900 dark:text-white text-center font-semibold">
            {resumeName ? "Replace resume" : "Choose file"}
          </Text>
        </TouchableOpacity>
        {resumeName ? (
          <View className="bg-white/80 dark:bg-gray-900/70 rounded-lg p-3">
            <Text className="text-gray-900 dark:text-white font-semibold">{resumeName}</Text>
            {resumeSize ? (
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {(resumeSize / 1024).toFixed(1)} KB
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-2">
        <Text className="text-gray-900 dark:text-white font-semibold">AI tips</Text>
        <Text className="text-gray-600 dark:text-gray-400">
          • Lead with measurable results (numbers, impact, scope).{"\n"}
          • Add visa/work authorization status in the header.{"\n"}
          • Mirror keywords from the job description in skills + experience.{"\n"}
          • Highlight internships, projects, and campus leadership.
        </Text>
      </View>

      <TouchableOpacity className="bg-blue-600 rounded-xl py-3" onPress={handleSave}>
        <Text className="text-white text-center font-semibold">Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

