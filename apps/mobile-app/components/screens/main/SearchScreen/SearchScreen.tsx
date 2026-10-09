import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { COLORS } from "@/constants";
import { useAddShow, useSearchShows } from "@/hooks";
import { showErrorToast } from "@/utils";

import AddButton from "../../../ui/AddButton/AddButton";
import Poster from "../../../ui/Poster/Poster";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_NAME_WIDTHS = [180, 140, 210, 160];

interface SearchHit {
  tvmazeId: number;
  name: string;
  posterUrl: string | null;
  type: string | null;
  language: string | null;
  year: number | null;
  network: string | null;
  onList: boolean;
}

function metaLine(hit: SearchHit): string {
  if (hit.onList) return "On your list";
  return [hit.type, hit.language, hit.year, hit.network]
    .filter((part) => part !== null && `${part}`.length > 0)
    .join(" · ");
}

function SearchMessage({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <VStack spacing="lg" align="center">
      <Ionicons name={icon} size={48} color={COLORS.muted} />
      <VStack spacing="sm" align="center">
        <Text className="text-center font-app-bold text-xl text-text">
          {title}
        </Text>
        <Text className="text-center font-app-regular text-[15px] text-muted">
          {subtitle}
        </Text>
      </VStack>
    </VStack>
  );
}

function SearchSkeleton() {
  return (
    <VStack spacing="md" className="pt-4">
      {SKELETON_NAME_WIDTHS.map((nameWidth) => (
        <HStack key={nameWidth} align="center" spacing="none" className="gap-3">
          <SkeletonCard width={48} height={72} radius={10} />
          <VStack spacing="xs" className="flex-1">
            <SkeletonCard width={nameWidth} height={14} radius={4} />
            <SkeletonCard
              width={Math.round(nameWidth * 0.7)}
              height={9}
              radius={4}
            />
          </VStack>
          <SkeletonCard width={32} height={32} radius={16} />
        </HStack>
      ))}
    </VStack>
  );
}

function searchText(
  value: string | { nativeEvent?: { text?: string } }
): string {
  return typeof value === "string" ? value : (value.nativeEvent?.text ?? "");
}

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const searchShows = useSearchShows();
  const addShow = useAddShow();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[] | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const requestId = useRef(0);
  const pullArmed = useRef(true);

  const runSearch = useCallback(
    async (text: string) => {
      const current = requestId.current + 1;
      requestId.current = current;
      setSearching(true);
      try {
        const next = await searchShows({ query: text });
        if (requestId.current !== current) return;
        setResults(next);
        setFailed(false);
      } catch {
        if (requestId.current !== current) return;
        setFailed(true);
      } finally {
        if (requestId.current === current) setSearching(false);
      }
    },
    [searchShows]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < SEARCH_MIN_LENGTH) {
      requestId.current += 1;
      return;
    }
    const timer = setTimeout(() => {
      void runSearch(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const handleAdd = async (hit: SearchHit) => {
    if (hit.onList || addingId !== null) return;
    setAddingId(hit.tvmazeId);
    try {
      await addShow({ tvmazeId: hit.tvmazeId });
      setResults((current) =>
        current?.map((row) =>
          row.tvmazeId === hit.tvmazeId ? { ...row, onList: true } : row
        )
      );
    } catch {
      showErrorToast("Could not add this show.");
    } finally {
      setAddingId(null);
    }
  };

  const trimmed = query.trim();
  const showSkeleton = searching && results === undefined;
  const showPrompt = trimmed.length < SEARCH_MIN_LENGTH;
  const showNoMatches =
    !showPrompt && !searching && !failed && results?.length === 0;
  const showError = failed && !searching && results === undefined;

  const retryFromPull = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pulled = event.nativeEvent.contentOffset.y < -48;
    if (!pulled) {
      pullArmed.current = true;
      return;
    }
    if (!pullArmed.current || !failed || searching) return;
    if (trimmed.length < SEARCH_MIN_LENGTH) return;
    pullArmed.current = false;
    void runSearch(trimmed);
  };

  let body: React.ReactNode = null;
  if (showPrompt) {
    body = (
      <SearchMessage
        icon="search-outline"
        title="Search for a show"
        subtitle="Type a name. Show data comes from TVmaze."
      />
    );
  } else if (showSkeleton) {
    body = <SearchSkeleton />;
  } else if (showError) {
    body = (
      <SearchMessage
        icon="cloud-offline-outline"
        title="Could not load"
        subtitle="Pull down to try again."
      />
    );
  } else if (showNoMatches) {
    body = (
      <SearchMessage
        icon="search-outline"
        title="No matches"
        subtitle={`No shows match "${trimmed}".`}
      />
    );
  } else if (results !== undefined) {
    body = (
      <VStack spacing="md" className="py-4">
        {results.map((hit) => {
          const meta = metaLine(hit);
          return (
            <HStack
              key={hit.tvmazeId}
              align="center"
              spacing="none"
              className="gap-3"
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={hit.name}
                onPress={() => router.push(`/show/${hit.tvmazeId}`)}
                className="min-w-0 flex-1"
              >
                <HStack align="center" spacing="none" className="gap-3">
                  <Poster
                    uri={hit.posterUrl}
                    accessibilityLabel={`${hit.name} poster`}
                  />
                  <VStack spacing="xs" className="min-w-0 flex-1">
                    <Text
                      className="font-app-bold text-[17px] text-text"
                      numberOfLines={1}
                    >
                      {hit.name}
                    </Text>
                    {meta.length > 0 ? (
                      <Text
                        className="font-app-medium text-[13px] text-muted"
                        numberOfLines={1}
                      >
                        {meta}
                      </Text>
                    ) : null}
                  </VStack>
                </HStack>
              </Pressable>
              <AddButton
                added={hit.onList}
                disabled={addingId === hit.tvmazeId}
                onPress={() => {
                  void handleAdd(hit);
                }}
              />
            </HStack>
          );
        })}
      </VStack>
    );
  }

  const onSearchText = (
    value: string | { nativeEvent?: { text?: string } }
  ) => {
    const text = searchText(value);
    setQuery(text);
    setFailed(false);
    if (text.trim().length < SEARCH_MIN_LENGTH) {
      requestId.current += 1;
      setResults(undefined);
      setSearching(false);
    }
  };

  const emptyMessage = showPrompt || showNoMatches;

  return (
    <>
      <Stack.SearchBar
        autoFocus
        autoCapitalize="none"
        hideNavigationBar
        hideWhenScrolling={false}
        placement="stacked"
        placeholder="Search"
        tintColor={COLORS.primary}
        textColor={COLORS.text}
        hintTextColor={COLORS.muted}
        onChangeText={onSearchText}
        onCancelButtonPress={() => router.back()}
      />
      {emptyMessage ? (
        <View
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}
        >
          {body}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          className="bg-page px-5"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: showError ? "center" : "flex-start",
          }}
          onScroll={retryFromPull}
          scrollEventThrottle={16}
        >
          {body}
        </ScrollView>
      )}
    </>
  );
};

export default SearchScreen;
