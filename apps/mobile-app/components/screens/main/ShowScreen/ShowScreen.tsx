import type { Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, useWindowDimensions, View } from "react-native";
import Animated from "react-native-reanimated";

import { COLORS } from "@/constants";
import {
  useAddShow,
  usePreviewShow,
  useRemoveShow,
  useResumeShow,
  useSetWatchLater,
  useShow,
  useShowHeaderScroll,
  useStopShow,
} from "@/hooks";
import { showErrorToast } from "@/utils";

import ShowHeaderBackground from "../../../show/ShowHeaderBackground/ShowHeaderBackground";
import ShowHeaderTitle from "../../../show/ShowHeaderTitle/ShowHeaderTitle";
import ShowMenu from "../../../show/ShowMenu/ShowMenu";
import ShowOnList from "../../../show/ShowOnList/ShowOnList";
import ShowPicture from "../../../show/ShowPicture/ShowPicture";
import ShowPreview from "../../../show/ShowPreview/ShowPreview";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import ShowScreenSkeleton from "./ShowScreenSkeleton";

interface OnListEpisode {
  episodeId: string;
  season: number;
  number: number;
  order: number;
  name: string;
  summary: string | null;
  runtime: number | null;
  imageUrl: string | null;
  airsAt: number | null;
  airTimeKnown: boolean;
}

interface OnListShow {
  showId: string;
  tvmazeId: number;
  name: string;
  headerUrl: string | null;
  posterUrl: string | null;
  network: string | null;
  summary: string | null;
  genres: string[];
  yearSeasons: boolean;
  seasons: {
    number: number;
    episodeCount: number;
    watchedCount: number;
  }[];
  myShowId: string;
  watchLater: boolean;
  stopped: boolean;
  watchedCount: number;
  airedCount: number;
  waitingAfterNext: number;
  leftOff: (OnListEpisode & { watchedAt: number }) | null;
  upNext: OnListEpisode | null;
}

interface PreviewShow {
  tvmazeId: number;
  name: string;
  genres: string[];
  status: string;
  seasonCount: number;
  summary: string | null;
  headerUrl: string | null;
  posterUrl: string | null;
  network: string | null;
  rating: number | null;
}

const ShowScreen: React.FC<{ tvmazeId: number }> = ({ tvmazeId }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
  const mine = useShow(tvmazeId) as OnListShow | null | undefined;
  const previewShow = usePreviewShow();
  const addShow = useAddShow();
  const setWatchLater = useSetWatchLater();
  const stopShow = useStopShow();
  const resumeShow = useResumeShow();
  const removeShow = useRemoveShow();
  const [preview, setPreview] = useState<PreviewShow | undefined>();
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [retry, setRetry] = useState(0);
  const pullArmed = useRef(true);

  useEffect(() => {
    if (mine !== null) return;
    let cancelled = false;
    void previewShow({ tvmazeId }).then(
      (value) => {
        if (!cancelled) setPreview(value);
      },
      () => {
        if (!cancelled) setFailed(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [mine, previewShow, retry, tvmazeId]);

  const headerName =
    mine !== null && mine !== undefined ? mine.name : (preview?.name ?? "");
  const threshold = width * (10 / 16) - 120;
  const retryFromPull = (offset: number) => {
    const pulled = offset < -48;
    if (!pulled) {
      pullArmed.current = true;
      return;
    }
    if (!pullArmed.current || !failed) return;
    pullArmed.current = false;
    setFailed(false);
    setPreview(undefined);
    setRetry((current) => current + 1);
  };
  const { scrollY, onScroll } = useShowHeaderScroll(retryFromPull);

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "transparent" },
      scrollEdgeEffects: { top: "hidden" },
      headerBackground: () => (
        <ShowHeaderBackground scrollY={scrollY} threshold={threshold} />
      ),
      headerTitle: () => (
        <ShowHeaderTitle
          name={headerName}
          scrollY={scrollY}
          threshold={threshold}
        />
      ),
    });

    return () => {
      navigation.setOptions({
        title: "",
        headerTitle: "",
        headerBackground: undefined,
        headerTransparent: true,
        headerStyle: { backgroundColor: "transparent" },
      });
    };
  }, [headerName, navigation, scrollY, threshold]);

  const report = () => {
    showErrorToast("Could not update this show.");
  };

  const confirmRemove = (myShowId: string) => {
    Alert.alert(
      "Remove from my list?",
      "This deletes the show and the episodes you have ticked.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void removeShow({ myShowId: myShowId as Id<"myShows"> })
              .then(() => router.back())
              .catch(report);
          },
        },
      ]
    );
  };

  const onAdd = () => {
    setAdding(true);
    void addShow({ tvmazeId })
      .catch(() => {
        showErrorToast("Could not add this show.");
      })
      .finally(() => {
        setAdding(false);
      });
  };

  let body: React.ReactNode;
  if (mine === undefined) {
    body = <ShowScreenSkeleton width={width} />;
  } else if (mine !== null) {
    body = <ShowOnList show={mine} width={width} />;
  } else if (failed) {
    body = (
      <VStack
        align="center"
        spacing="sm"
        className="flex-1 justify-center px-5"
      >
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.muted} />
        <Text className="text-center font-app-bold text-xl text-text">
          Could not load
        </Text>
        <Text className="text-center font-app-regular text-[15px] text-muted">
          Pull down to try again.
        </Text>
      </VStack>
    );
  } else if (preview === undefined) {
    body = <ShowScreenSkeleton width={width} preview />;
  } else {
    body = (
      <ShowPreview show={preview} width={width} adding={adding} onAdd={onAdd} />
    );
  }

  const cover =
    mine !== null && mine !== undefined
      ? {
          uri: mine.headerUrl ?? mine.posterUrl,
          contained: mine.headerUrl === null,
        }
      : preview
        ? {
            uri: preview.headerUrl ?? preview.posterUrl,
            contained: preview.headerUrl === null,
          }
        : null;

  return (
    <View className="flex-1 bg-page">
      {cover ? (
        <ShowPicture
          uri={cover.uri}
          width={width}
          contained={cover.contained}
          scrollY={scrollY}
        />
      ) : null}
      {mine !== null && mine !== undefined ? (
        <ShowMenu
          watchLater={mine.watchLater}
          stopped={mine.stopped}
          onWatchLater={() => {
            void setWatchLater({
              myShowId: mine.myShowId as Id<"myShows">,
              on: !mine.watchLater,
            }).catch(report);
          }}
          onStop={() => {
            void stopShow({
              myShowId: mine.myShowId as Id<"myShows">,
            }).catch(report);
          }}
          onResume={() => {
            void resumeShow({
              myShowId: mine.myShowId as Id<"myShows">,
            }).catch(report);
          }}
          onRemove={() => confirmRemove(mine.myShowId)}
        />
      ) : null}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={failed ? { flexGrow: 1 } : undefined}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {body}
      </Animated.ScrollView>
    </View>
  );
};

export default ShowScreen;
