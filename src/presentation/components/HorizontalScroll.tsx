import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Platform, StyleProp, ViewStyle } from 'react-native';

/**
 * Envuelve un ScrollView horizontal y añade soporte para desplazar con la rueda
 * del ratón en web (PC). Sin esto, el comportamiento por defecto del navegador
 * desplaza la página verticalmente y nunca alcanza la lista horizontal interior.
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

    // RNW reenvía la ref al nodo DOM y también expone getScrollableNode() en él.
    // getScrollableNode() devuelve el mismo nodo (el div interior con overflow-x: auto).
    const el: HTMLElement | null =
      (scrollRef.current as any)?.getScrollableNode?.() ??
      (scrollRef.current as unknown as HTMLElement | null);

    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Deja que el navegador gestione el scroll horizontal nativo (deslizamiento en trackpad)
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
