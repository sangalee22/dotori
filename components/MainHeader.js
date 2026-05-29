import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Typography } from '../styles';
import Logo from './Logo';
import SearchIcon from './SearchIcon';
import IconButton from './IconButton';

const LOGO_HEIGHT = 60;

/**
 * MainHeader Component
 * @param {function} onSearch
 * @param {Array}    tabs          - [{ id, label }] optional tab list
 * @param {string}   activeTab     - active tab id
 * @param {function} onTabChange
 * @param {Animated.Value} logoHeightAnim - animated height for logo row (default 60)
 * @param {ReactNode} rightButton  - custom right button (overrides default search icon)
 */
export default function MainHeader({ onSearch, tabs, activeTab, onTabChange, logoHeightAnim, rightButton }) {
  return (
    <View style={styles.wrapper}>
      <Animated.View style={{ height: logoHeightAnim ?? LOGO_HEIGHT, overflow: 'hidden' }}>
        <View style={styles.header}>
          <Logo width={106} height={26} />
          {rightButton ?? (
            <IconButton onPress={onSearch}>
              <SearchIcon width={24} height={24} />
            </IconButton>
          )}
        </View>
      </Animated.View>

      {tabs && (
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange && onTabChange(tab.id)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Text style={activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    height: LOGO_HEIGHT,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabTextActive: {
    ...Typography.subtitle1Medium,
    fontWeight: '900',
    color: Colors.gray900,
  },
  tabTextInactive: {
    ...Typography.subtitle1Medium,
    color: Colors.gray500,
  },
});
