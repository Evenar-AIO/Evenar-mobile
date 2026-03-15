import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 28,
  readonly = false,
}: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.7}
        >
          <Ionicons
            name={value >= star ? "star" : "star-outline"}
            size={size}
            color={value >= star ? "#f59e0b" : "#d1d5db"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
});
