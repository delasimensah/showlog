import type { Id } from "@convex/_generated/dataModel";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { ConvexError } from "convex/values";
import { forwardRef } from "react";
import { airedMeta, airsMeta, episodeLabel } from "shared";

import { COLORS } from "@/constants";
import {
  useBottomsheetStore,
  useOpenedAt,
  useTickEpisode,
  useUntickEpisode,
  useWatchUpTo,
} from "@/hooks";
import { playTickHaptic, showErrorToast } from "@/utils";

import Button from "../../ui/Button/Button";
import EpisodeImage from "../../ui/EpisodeImage/EpisodeImage";
import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

function failureMessage(error: unknown) {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string };
    if (data.message) return data.message;
  }
  return "Could not update this episode.";
}

const EpisodeSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const episode = useBottomsheetStore((state) => state.episode);
  const tick = useTickEpisode({
    showId: episode?.showId as Id<"shows"> | undefined,
    season: episode?.season ?? 0,
    tvmazeId: episode?.tvmazeId ?? 0,
  });
  const untick = useUntickEpisode({
    showId: episode?.showId as Id<"shows"> | undefined,
    season: episode?.season ?? 0,
    tvmazeId: episode?.tvmazeId ?? 0,
  });
  const watchUpTo = useWatchUpTo({
    showId: episode?.showId as Id<"shows"> | undefined,
    season: episode?.season ?? 0,
    tvmazeId: episode?.tvmazeId ?? 0,
  });

  const report = (error: unknown) => {
    showErrorToast(failureMessage(error));
  };

  const now = useOpenedAt();
  const picture = episode?.imageUrl ?? episode?.headerUrl ?? episode?.posterUrl;
  const meta =
    episode === null
      ? ""
      : episode.aired
        ? airedMeta(episode.airsAt ?? undefined, now, episode.runtime)
        : episode.airsAt === null
          ? "No date yet"
          : airsMeta(episode.airsAt, episode.airTimeKnown);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
      handleIndicatorStyle={{ backgroundColor: COLORS.muted, height: 2 }}
    >
      <BottomSheetView>
        {episode === null ? null : (
          <VStack spacing="sm" className="px-5 pb-8">
            <EpisodeImage uri={picture} fullWidth />
            <Text className="font-app-medium text-[13px] text-muted">
              {episodeLabel(episode)}
            </Text>
            <Text className="font-app-bold text-xl text-text">
              {episode.name}
            </Text>
            <Text className="font-app-medium text-[13px] text-muted">
              {meta}
            </Text>
            {episode.summary ? (
              <Text className="font-app-regular text-[15px] leading-[22px] text-text">
                {episode.summary}
              </Text>
            ) : null}
            {episode.aired ? (
              <VStack spacing="sm" className="mt-2">
                <Button
                  text={
                    episode.watched
                      ? "Watched · tap to undo"
                      : "Mark as watched"
                  }
                  variant={episode.watched ? "secondary" : "primary"}
                  size="lg"
                  fullWidth
                  onPress={() => {
                    const run = episode.watched ? untick : tick;
                    if (!episode.watched) playTickHaptic();
                    void run({
                      episodeId: episode.episodeId as Id<"episodes">,
                    }).catch(report);
                  }}
                />
                <Button
                  text="Watched up to here"
                  variant="ghost"
                  size="md"
                  fullWidth
                  textClassName="text-[15px]"
                  onPress={() => {
                    playTickHaptic();
                    void watchUpTo({
                      episodeId: episode.episodeId as Id<"episodes">,
                    }).catch(report);
                  }}
                />
              </VStack>
            ) : null}
          </VStack>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

EpisodeSheet.displayName = "EpisodeSheet";

export default EpisodeSheet;
