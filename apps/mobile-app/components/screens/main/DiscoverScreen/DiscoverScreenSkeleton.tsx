import React from "react";
import { ScrollView, View } from "react-native";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";

const DiscoverScreenSkeleton: React.FC = () => {
  return (
    <View className="gap-8 py-4">
      {Array.from({ length: 3 }, (_, row) => (
        <View key={row} className="gap-3">
          <SkeletonCard width={140} height={20} radius={4} ml={20} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {Array.from({ length: 4 }, (_, card) => (
              <View key={card} className="w-[120px] gap-2">
                <View>
                  <SkeletonCard width={120} height={180} radius={10} />
                  <View className="absolute bottom-2 right-2">
                    <SkeletonCard width={32} height={32} radius={16} />
                  </View>
                </View>
                <SkeletonCard width={100} height={9} radius={4} />
                <SkeletonCard width={72} height={9} radius={4} />
                <SkeletonCard width={32} height={9} radius={4} />
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

export default DiscoverScreenSkeleton;
