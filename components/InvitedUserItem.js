import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../styles';
import UserProfile from './UserProfile';
import DeleteIcon from './DeleteIcon';

/**
 * InvitedUserItem Component
 * Displays invited user with avatar and nickname
 * @param {string} nickname - User nickname
 * @param {string} imageUri - Profile image URL (optional)
 * @param {function} onRemove - Callback when remove button is pressed
 */
export default function InvitedUserItem({ nickname, imageUri, onRemove }) {
  return (
    <View style={styles.container}>
      <UserProfile imageUri={imageUri} size={48} />
      <Text style={styles.nickname} numberOfLines={1}>
        {nickname}
      </Text>
      {onRemove && (
        <TouchableOpacity style={styles.deleteButton} onPress={onRemove}>
          <DeleteIcon width={20} height={20} color={Colors.gray400} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 66,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    position: 'relative',
  },
  nickname: {
    ...Typography.body3Regular,
    color: Colors.gray900,
    textAlign: 'center',
    width: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
