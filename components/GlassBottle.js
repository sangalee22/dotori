import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, Image, Animated, StyleSheet, PanResponder, Pressable, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { ShapeYellow, ShapePurple } from './shapes';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';

const BOTTLE_W   = 108;
const BOTTLE_H   = Math.round(BOTTLE_W * (149 / 109)); // 147
const ABOVE_H    = 0;    // 병 위 놀이 공간 (병 안에서만 이동하므로 제거)
const PLAY_H     = ABOVE_H + BOTTLE_H;
const BOTTLE_PATH = 'M92.9521 0C94.0718 3.70972e-05 94.9794 0.907681 94.9795 2.02734C94.9795 3.07717 94.1816 3.9402 93.1592 4.04395L92.9521 4.05469V16.8076C102.356 22.9625 108.57 33.5885 108.57 45.667V125.727C108.57 138.044 98.5849 148.029 86.2676 148.029H22.3027C9.98543 148.029 5.89442e-05 138.044 0 125.727V45.667C0 33.5901 6.21204 22.9649 15.6143 16.8096V4.05371C14.4963 4.05164 13.5908 3.14582 13.5908 2.02734C13.5909 0.907658 14.4985 0 15.6182 0H92.9521Z';

// 물리 상수
const GRAVITY     = 0.30;
const BOUNCE      = 0.52;
const FRICTION    = 0.90;
const SLEEP_VEL   = 0.25;
const ANG_DAMPING = 0.80;
const ANG_SLEEP   = 0.30;
const MAX_AV      = 24;

// play-area 좌표 기준 경계
const PLAY_CEIL = 2;                   // 놀이 공간 상단 천장
const P_FLOOR   = ABOVE_H + 134;      // 병 바닥 내부
const WALL_L    = 7;
const WALL_R    = 101;
const BOT_Y     = ABOVE_H;            // 병 꼭대기 (play-area 기준)
const NECK_BOT  = ABOVE_H + 20;       // 목 끝 (이 아래는 병 내부)
const NECK_L    = 18;
const NECK_R    = 90;

// 카테고리별 도형 매핑
// img: PNG 에셋 / Comp: SVG 컴포넌트
export const CATEGORY_SHAPE_MAP = {
  1:      { Comp: ShapePurple },
  50940:  { img: require('../assets/shapes/shapes_green_glass.png'), size: 26 },
  51371:  { img: require('../assets/shapes/shapes_mint_glass.png'),  size: 26 },
  336:    { Comp: ShapeYellow },
  170:    { img: require('../assets/shapes/shapes_red_glass.png'),   size: 26 },
  656:    { img: require('../assets/shapes/shapes_moon_glass.png'),  size: 26 },
  55890:  { img: require('../assets/shapes/shapes_pink_glass.png'),  size: 26 },
};

const ETC_IMG    = require('../assets/shapes/shapes_etc_glass.png');
const SHAPE_SIZE = 18;
const IMG_SIZE   = 26;
const SHAPE_R    = 9;
const IMG_R      = 12;

export function getCategoryIdFromName(categoryName) {
  if (!categoryName) return null;
  // '>' 기준 마지막 세그먼트 = 가장 구체적인 분류명
  const leaf = categoryName.split('>').pop().trim();
  const c = (s) => leaf.includes(s);
  if (c('에세이') || c('수필')) return 51371;
  if (c('자기계발')) return 336;
  if (c('경제') || c('경영')) return 170;
  if (c('인문') || c('역사')) return 656;
  if (c('건강') || c('뷰티')) return 55890;
  if (c('소설')) return 1;
  if (c('시')) return 50940;
  return null;
}

const PERIODS = ['지금까지', '이번달', '이번년도'];
const ARROW_PATH = 'M12.7071 15.2929L16.2929 11.7071C16.9229 11.0771 16.4767 10 15.5858 10L8.41421 10C7.52331 10 7.07714 11.0771 7.70711 11.7071L11.2929 15.2929C11.6834 15.6834 12.3166 15.6834 12.7071 15.2929Z';

function DropdownItem({ label, selected, onPress }) {
  return (
    <Pressable
      style={{ paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg }}
      onPress={onPress}
    >
      <Text style={{ ...Typography.body1Medium, color: selected ? Colors.primary500 : Colors.gray900 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const CATEGORY_NAMES = {
  1:     '소설',
  50940: '시',
  51371: '에세이',
  336:   '자기계발',
  170:   '경제·경영',
  656:   '인문·역사',
  55890: '건강·뷰티',
};

export default function GlassBottle({ completedBooks = [], scrollViewRef }) {
  const [selectedPeriod, setSelectedPeriod] = useState('지금까지');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  const periodButtonRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dropdownActiveRef = useRef(false);

  const onButtonLayout = () => {
    periodButtonRef.current?.measureInWindow((x, y, w, h) => {
      setDropdownPos({ x, y: y + h });
    });
  };

  const openDropdown = () => {
    if (dropdownActiveRef.current) return;
    dropdownActiveRef.current = true;
    fadeAnim.setValue(0);
    setDropdownVisible(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const closeDropdown = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      dropdownActiveRef.current = false;
      setDropdownVisible(false);
    });
  };

  const selectPeriod = (p) => {
    setSelectedPeriod(p);
    closeDropdown();
  };

  const filteredBooks = useMemo(() => {
    if (selectedPeriod === '지금까지') return completedBooks;
    const now = new Date();
    return completedBooks.filter(b => {
      if (!b.completedAt) return false;
      const d = new Date(b.completedAt);
      if (selectedPeriod === '이번달') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (selectedPeriod === '이번년도') {
        return d.getFullYear() === now.getFullYear();
      }
      return false;
    });
  }, [completedBooks, selectedPeriod]);

  const displayCount = filteredBooks.length;

  const categoryStats = useMemo(() => {
    const map = {};
    filteredBooks.forEach(b => {
      const catId = getCategoryIdFromName(b.categoryName);
      const key = catId ?? 'etc';
      if (!map[key]) map[key] = { catId, count: 0 };
      map[key].count += 1;
    });
    return Object.values(map).filter(item => item.count > 0);
  }, [filteredBooks]);
  // 마운트 시점 completedBooks → shape 목록 (key prop으로 완독 시 remount)
  const SHAPES = useRef(
    completedBooks.map(book => {
      const catId = getCategoryIdFromName(book.categoryName);
      const base  = catId != null ? CATEGORY_SHAPE_MAP[catId] : null;
      if (base?.img) {
        return { img: base.img, Comp: null, props: null, size: base.size || IMG_SIZE, r: IMG_R };
      }
      const Comp = base?.Comp ?? null;
      return Comp
        ? { img: null, Comp, props: base?.props, size: SHAPE_SIZE, r: SHAPE_R }
        : { img: ETC_IMG, Comp: null, props: null, size: IMG_SIZE, r: IMG_R };
    })
  ).current;

  const bodies = useRef(
    SHAPES.map((shape) => ({
      x: WALL_L + shape.r + Math.random() * (WALL_R - WALL_L - shape.r * 2),
      y: NECK_BOT + shape.r + 10 + Math.random() * (P_FLOOR - NECK_BOT - shape.r * 2 - 20),
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 3,
      r: shape.r,
      size: shape.size,
      angle: Math.random() * 360,
      av: (Math.random() - 0.5) * 3,
      sleeping: false,
    }))
  ).current;

  const anim = useRef(
    bodies.map(b => ({
      x: new Animated.Value(b.x - b.size / 2),
      y: new Animated.Value(b.y - b.size / 2),
      angle: new Animated.Value(b.angle),
    }))
  ).current;

  // ─── 기간 필터 → 병 안 활성 도형 관리 ──────────────────────────
  const [, forceUpdate] = useState(0);
  const activeSetRef = useRef(new Set(completedBooks.map((_, i) => i)));

  const activeIndices = useMemo(() => {
    const filteredSet = new Set(filteredBooks);
    return completedBooks.reduce((acc, book, i) => {
      if (filteredSet.has(book)) acc.push(i);
      return acc;
    }, []);
  }, [filteredBooks, completedBooks]);

  useEffect(() => {
    const newSet = new Set(activeIndices);
    // 새로 활성화된 도형 → 병 위쪽에서 낙하 시작
    activeIndices.forEach(idx => {
      if (!activeSetRef.current.has(idx)) {
        const b = bodies[idx];
        b.x = WALL_L + b.r + Math.random() * (WALL_R - WALL_L - b.r * 2);
        b.y = NECK_BOT + b.r + 5;
        b.vx = (Math.random() - 0.5) * 2;
        b.vy = 0;
        b.av = (Math.random() - 0.5) * 2;
        b.sleeping = false;
        anim[idx].x.setValue(b.x - b.size / 2);
        anim[idx].y.setValue(b.y - b.size / 2);
      }
    });
    activeSetRef.current = newSet;
    forceUpdate(v => v + 1);
  }, [activeIndices]);

  const dragIdx = useRef(-1);
  const dragOff = useRef({ x: 0, y: 0 });
  const prevAccel = useRef({ x: 0, y: 0 });

  // ─── 가속도계 (흔들기) — expo-sensors는 네이티브 빌드에서만 활성화
  useEffect(() => {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    if (!requireOptionalNativeModule('ExponentAccelerometer')) return;
    let sub;
    try {
      const Accelerometer = require('expo-sensors/build/Accelerometer').default;
      Accelerometer.setUpdateInterval(33);
      sub = Accelerometer.addListener(({ x, y }) => {
        const dx = x - prevAccel.current.x;
        const dy = y - prevAccel.current.y;
        prevAccel.current = { x, y };
        if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
          bodies.forEach(b => {
            b.vx += dx * 4;
            b.vy -= dy * 4;
            b.sleeping = false;
          });
        }
      });
    } catch {}
    return () => sub?.remove();
  }, []);

  // ─── 물리 루프 ──────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const n = SHAPES.length;

      // ── 적분 (수면 중인 body, 비활성 body 스킵) ──
      for (let i = 0; i < n; i++) {
        if (!activeSetRef.current.has(i)) continue;
        if (i === dragIdx.current) continue;
        const b = bodies[i];
        if (b.sleeping) continue;
        b.vy += GRAVITY;
        b.x  += b.vx;
        b.y  += b.vy;
        b.av *= ANG_DAMPING;
        if (Math.abs(b.av) < 0.5) b.av = 0;
        b.angle += b.av;
      }

      // ── 경계 충돌 ──
      for (let i = 0; i < n; i++) {
        if (!activeSetRef.current.has(i)) continue;
        if (i === dragIdx.current) continue;
        const b = bodies[i];
        if (b.sleeping) continue;

        if (b.y + b.r > P_FLOOR) {
          b.y  = P_FLOOR - b.r;
          b.vy = -b.vy * BOUNCE;
          b.vx *= FRICTION;
          b.av += b.vx * 0.05;
          if (Math.abs(b.vy) < SLEEP_VEL) b.vy = 0;
          if (Math.abs(b.vx) < SLEEP_VEL) b.vx = 0;
          // 바닥에서 완전히 정지 → 수면
          if (b.vx === 0 && b.vy === 0 && Math.abs(b.av) < ANG_SLEEP) {
            b.av = 0;
            b.sleeping = true;
          }
        }

        if (b.y - b.r < PLAY_CEIL) {
          b.y  = PLAY_CEIL + b.r;
          b.vy = Math.abs(b.vy) * BOUNCE;
          b.av -= b.vx * 0.1;
        }

        if (b.y > NECK_BOT) {
          if (b.x - b.r < WALL_L) { b.x = WALL_L + b.r; b.vx = Math.abs(b.vx) * BOUNCE; b.av += b.vy * 0.04; }
          if (b.x + b.r > WALL_R) { b.x = WALL_R - b.r; b.vx = -Math.abs(b.vx) * BOUNCE; b.av -= b.vy * 0.04; }
        } else if (b.y > BOT_Y) {
          if (b.x - b.r < NECK_L) { b.x = NECK_L + b.r; b.vx = Math.abs(b.vx) * BOUNCE; b.av += b.vy * 0.04; }
          if (b.x + b.r > NECK_R) { b.x = NECK_R - b.r; b.vx = -Math.abs(b.vx) * BOUNCE; b.av -= b.vy * 0.04; }
        } else {
          if (b.x - b.r < WALL_L) { b.x = WALL_L + b.r; b.vx = Math.abs(b.vx) * BOUNCE; b.av += b.vy * 0.04; }
          if (b.x + b.r > WALL_R) { b.x = WALL_R - b.r; b.vx = -Math.abs(b.vx) * BOUNCE; b.av -= b.vy * 0.04; }
        }
      }

      // ── 도형 간 충돌 ──
      for (let i = 0; i < n; i++) {
        if (!activeSetRef.current.has(i)) continue;
        for (let j = i + 1; j < n; j++) {
          if (!activeSetRef.current.has(j)) continue;
          const a = bodies[i], b = bodies[j];
          // 둘 다 잠든 경우 서로 깨우지 않음
          if (a.sleeping && b.sleeping) continue;

          const dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          const md = a.r + b.r;
          if (d2 >= md * md || d2 === 0) continue;

          const d  = Math.sqrt(d2);
          const nx = dx / d, ny = dy / d;
          const ov = md - d;
          const aDr = i === dragIdx.current;
          const bDr = j === dragIdx.current;
          // 잠든 body는 위치 고정 — 깨어있는 쪽만 비켜남
          const aFixed = aDr || a.sleeping;
          const bFixed = bDr || b.sleeping;
          if (!aFixed) { a.x -= nx * ov * (bFixed ? 1 : 0.5); a.y -= ny * ov * (bFixed ? 1 : 0.5); }
          if (!bFixed) { b.x += nx * ov * (aFixed ? 1 : 0.5); b.y += ny * ov * (aFixed ? 1 : 0.5); }

          if (!aDr && !bDr) {
            const rv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (rv > 0) {
              // 실제 충돌 임펄스가 있을 때만 수면 해제
              a.sleeping = false;
              b.sleeping = false;
              const imp = rv * (1 + BOUNCE) / 2;
              a.vx -= imp * nx; a.vy -= imp * ny;
              b.vx += imp * nx; b.vy += imp * ny;
              const tv = (a.vx - b.vx) * (-ny) + (a.vy - b.vy) * nx;
              a.av += tv * 0.15;
              b.av -= tv * 0.15;
            }
          } else if (aDr) {
            b.sleeping = false;
            b.vx += nx * 5; b.vy += ny * 5;
            b.av += (nx + ny) * 6;
          } else {
            a.sleeping = false;
            a.vx -= nx * 5; a.vy -= ny * 5;
            a.av -= (nx + ny) * 6;
          }
        }
      }

      for (let i = 0; i < n; i++) {
        if (!activeSetRef.current.has(i)) continue;
        const b = bodies[i];
        if (b.sleeping) continue;
        anim[i].x.setValue(b.x - b.size / 2);
        anim[i].y.setValue(b.y - b.size / 2);
        anim[i].angle.setValue(b.angle);
      }
    }, 16);

    return () => clearInterval(tick);
  }, []);

  // ─── 터치 드래그 ────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        scrollViewRef?.current?.setNativeProps({ scrollEnabled: false });
        const { locationX: bx, locationY: by } = evt.nativeEvent;
        const idx = bodies.findIndex(b => {
          const dx = b.x - bx, dy = b.y - by;
          return dx * dx + dy * dy <= (b.r + 14) * (b.r + 14);
        });
        if (idx >= 0) {
          dragIdx.current = idx;
          dragOff.current = { x: bodies[idx].x - bx, y: bodies[idx].y - by };
          bodies[idx].vx = 0;
          bodies[idx].vy = 0;
          bodies[idx].sleeping = false;
        }
        return true;
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderMove: (evt) => {
        const i = dragIdx.current;
        if (i < 0) return;
        const { locationX: bx, locationY: by } = evt.nativeEvent;
        const r = bodies[i].r;
        let nx = bx + dragOff.current.x;
        let ny = Math.max(PLAY_CEIL + r, Math.min(P_FLOOR - r, by + dragOff.current.y));
        if (ny > NECK_BOT) {
          nx = Math.max(WALL_L + r, Math.min(WALL_R - r, nx));
        } else if (ny > BOT_Y) {
          nx = Math.max(NECK_L + r, Math.min(NECK_R - r, nx));
        } else {
          nx = Math.max(WALL_L + r, Math.min(WALL_R - r, nx));
        }
        bodies[i].x = nx;
        bodies[i].y = ny;
        anim[i].x.setValue(nx - SHAPE_SIZE / 2);
        anim[i].y.setValue(ny - SHAPE_SIZE / 2);
      },
      onPanResponderRelease: (_, g) => {
        scrollViewRef?.current?.setNativeProps({ scrollEnabled: true });
        const i = dragIdx.current;
        if (i >= 0) {
          bodies[i].vx = g.vx * 6;
          bodies[i].vy = g.vy * 6;
          bodies[i].av = g.vx * 3;
          dragIdx.current = -1;
        }
      },
      onPanResponderTerminate: () => {
        scrollViewRef?.current?.setNativeProps({ scrollEnabled: true });
        dragIdx.current = -1;
      },
    })
  ).current;

  // ─── 렌더 ───────────────────────────────────────────────────
  const shapeViews = SHAPES.map((shape, i) => {
    if (!activeSetRef.current.has(i)) return null;
    return (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: [
            { translateX: anim[i].x },
            { translateY: anim[i].y },
            { rotate: anim[i].angle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1deg'], extrapolate: 'extend' }) },
          ],
        }}
      >
        {shape.img
          ? <Image source={shape.img} style={{ width: shape.size, height: shape.size }} resizeMode="contain" />
          : <shape.Comp size={shape.size} {...(shape.props || {})} />
        }
      </Animated.View>
    );
  });

  return (
    <View style={styles.wrapper}>
      {/* 왼쪽: 텍스트 + 버튼 */}
      <View style={styles.leftSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <View ref={periodButtonRef} onLayout={onButtonLayout}>
            <Pressable style={styles.periodButton} onPress={openDropdown}>
              <Text style={styles.periodText}>{selectedPeriod}</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d={ARROW_PATH} fill={Colors.primary500} />
              </Svg>
            </Pressable>
          </View>

          <Modal visible={dropdownVisible} transparent animationType="none" onRequestClose={() => closeDropdown()}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => closeDropdown()} />
            <Animated.View style={[styles.dropdownShadow, { top: dropdownPos.y + 4, left: dropdownPos.x, opacity: fadeAnim }]}>
              <BlurView intensity={15} tint="light" style={styles.dropdown}>
                {PERIODS.map(p => (
                  <DropdownItem
                    key={p}
                    label={p}
                    selected={p === selectedPeriod}
                    onPress={() => selectPeriod(p)}
                  />
                ))}
              </BlurView>
            </Animated.View>
          </Modal>
          <Text style={styles.countText}>
            <Text style={styles.highlight}>{displayCount}권</Text>을 읽었어요
          </Text>
        </View>
        <Text style={styles.subText}>책을 읽어서 도형들을 모을 수 있어요.</Text>
        {categoryStats.length > 0 && (
          <View style={styles.categoryChipList}>
            {categoryStats.map(item => {
              const shape = item.catId != null ? CATEGORY_SHAPE_MAP[item.catId] : null;
              const name = item.catId != null ? (CATEGORY_NAMES[item.catId] ?? '기타') : '기타';
              return (
                <View key={item.catId ?? 'etc'} style={styles.categoryChip}>
                  {shape?.img
                    ? <Image source={shape.img} style={{ width: 15, height: 15 }} resizeMode="contain" />
                    : shape?.Comp
                      ? <shape.Comp size={15} {...(shape.props || {})} />
                      : <Image source={ETC_IMG} style={{ width: 15, height: 15 }} resizeMode="contain" />
                  }
                  <Text style={styles.categoryChipText}>{name} {item.count}권</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 오른쪽: 병 */}
      <View style={{ width: BOTTLE_W, height: PLAY_H }}>
        <View style={{ position: 'absolute', top: ABOVE_H, left: 0 }} pointerEvents="none">
          <Svg width={BOTTLE_W} height={BOTTLE_H} viewBox="0 0 109 149">
            <Path d={BOTTLE_PATH} fill="#FFFFFF" />
          </Svg>
        </View>
        {shapeViews}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
  },
  leftSection: {
    flex: 1,
    gap: Spacing.sm,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary500,
  },
  periodText: {
    ...Typography.headline2Bold,
    color: Colors.primary500,
    fontWeight: '900',
  },
  dropdownShadow: {
    position: 'absolute',
    borderRadius: BorderRadius.xxxl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    width: 94,
  },
  dropdown: {
    width: 94,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.xxxl,
    overflow: 'hidden',
    padding: Spacing.xs,

  },
  countText: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  highlight: {
    ...Typography.headline2Bold,
    color: Colors.gray900,
  },
  subText: {
    ...Typography.body2Regular,
    color: Colors.gray500,
  },
  categoryChipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  categoryChipText: {
    ...Typography.body2Regular,
    color: Colors.gray700,
  },
});
