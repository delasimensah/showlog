import {
  BottomSheet,
  Form,
  Group,
  Host,
  Picker,
  Section,
  Text,
} from "@expo/ui/swift-ui";
import {
  frame,
  pickerStyle,
  preferredColorScheme,
  presentationDragIndicator,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import React from "react";

import {
  MY_SHOWS_FILTERS,
  MY_SHOWS_SORTS,
  type MyShowsFilter,
  type MyShowsSort,
} from "@/hooks";

interface SortFilterSheetProps {
  isPresented: boolean;
  onIsPresentedChange: (open: boolean) => void;
  sort: MyShowsSort;
  filter: MyShowsFilter;
  onSort: (sort: MyShowsSort) => void;
  onFilter: (filter: MyShowsFilter) => void;
}

const SortFilterSheet: React.FC<SortFilterSheetProps> = ({
  isPresented,
  onIsPresentedChange,
  sort,
  filter,
  onSort,
  onFilter,
}) => {
  return (
    <Host
      pointerEvents="box-none"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={onIsPresentedChange}
        fitToContents
      >
        <Group
          modifiers={[
            presentationDragIndicator("visible"),
            preferredColorScheme("dark"),
            frame({ minHeight: 680 }),
          ]}
        >
          <Form>
            <Section title="Sort by">
              <Picker
                selection={sort}
                modifiers={[pickerStyle("inline")]}
                onSelectionChange={(value) => {
                  if (typeof value === "string") onSort(value as MyShowsSort);
                }}
              >
                {MY_SHOWS_SORTS.map((option) => (
                  <Text key={option.value} modifiers={[tag(option.value)]}>
                    {option.label}
                  </Text>
                ))}
              </Picker>
            </Section>
            <Section title="Filter">
              <Picker
                selection={filter}
                modifiers={[pickerStyle("inline")]}
                onSelectionChange={(value) => {
                  if (typeof value === "string")
                    onFilter(value as MyShowsFilter);
                }}
              >
                {MY_SHOWS_FILTERS.map((option) => (
                  <Text key={option} modifiers={[tag(option)]}>
                    {option}
                  </Text>
                ))}
              </Picker>
            </Section>
          </Form>
        </Group>
      </BottomSheet>
    </Host>
  );
};

export default SortFilterSheet;
