import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Platform, StyleProp, ViewStyle } from 'react-native';

/**
 * Wrapper around a horizontal ScrollView that also supports vertical mouse-wheel
 * scrolling on web (PC). Without this, the browser's default wheel behaviour
 * scrolls the page vertically and never reaches the inner horizontal list.
 */
export default function HorizontalScroll({
  style,
  contentContainerStyle,
  children,
}: Readonly<{
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}>) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // RNW forwards the ref to the DOM node and also attaches getScrollableNode() on it.
    // getScrollableNode() returns the same node (the inner scrollable div with overflow-x: auto).
    const el: HTMLElement | null =
      (scrollRef.current as any)?.getScrollableNode?.() ??
      (scrollRef.current as unknown as HTMLElement | null);

    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Let the browser handle native horizontal scroll gestures (trackpad swipe)
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <View style={style}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
    </View>
  );
}
