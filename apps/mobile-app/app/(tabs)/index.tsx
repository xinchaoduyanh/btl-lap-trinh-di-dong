import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useSlogan } from '../../context/SloganContext';
import { UserData } from '@/constants/interface';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { unreadCount, refreshUnreadCount } = useNotification();
  const { slogan, loading: sloganLoading, error: sloganError, fetchRandomSlogan } = useSlogan();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (!userDataString) {
          // If no user data, redirect to login
          router.replace('/(auth)/login');
          return;
        }
        const parsedUserData = JSON.parse(userDataString) as UserData;
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // On error, redirect to login
        router.replace('/(auth)/login');
      }
    };

    fetchUserData();
    // Không tự động lấy slogan khi component được mount
    // Người dùng sẽ cần bấm vào để xem slogan
  }, []);

  // Cập nhật số lượng thông báo chưa đọc khi component được mount
  useEffect(() => {
    refreshUnreadCount();

    // Thiết lập interval để cập nhật số lượng thông báo chưa đọc mỗi 30 giây
    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, [refreshUnreadCount]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const actionTiles = [
    {
      id: 1,
      title: 'Chấm công',
      icon: 'clock',
      color: '#E53935', // Red for hotpot theme
      screen: '/(tabs)/check-in'
    },
    {
      id: 2,
      title: 'Quản lý đơn hàng',
      icon: 'shopping-cart',
      color: '#D84315', // Deep orange for hotpot theme
      screen: '/(tabs)/orders'
    },
    {
      id: 3,
      title: 'Quản lý bàn',
      icon: 'grid',
      color: '#BF360C', // Darker orange for hotpot theme
      screen: '/(tabs)/tables'
    },
    {
      id: 4,
      title: 'Thông báo',
      icon: 'bell',
      color: '#6D4C41', // Brown for hotpot theme
      screen: '/(tabs)/notifications',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined
    }
  ];

  // Add loading state
  if (!userData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <View style={styles.steamingPotContainer}>
          <View style={styles.potBase} />
          <View style={styles.potHandle} />
          <View style={styles.potHandle2} />
          <View style={styles.steamBubble1} />
          <View style={styles.steamBubble2} />
          <View style={styles.steamBubble3} />
        </View>
        <Text style={[styles.loadingText, { color: colors.text }]}>Đang chuẩn bị lẩu của bạn...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Header with hotpot theme */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBackground} />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Nhân viên ITHotpot</Text>
            <Text style={styles.headerSubtitle}>Chào mừng trở lại, đầu bếp!</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <View style={styles.logoutButtonInner}>
              <Feather name="log-out" size={18} color="white" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {userData && (
          <View style={[styles.userInfoCard, { backgroundColor: colors.card }]}>
            {/* Collapsible profile card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleDetails}
              style={styles.cardHeader}
            >
              <View style={styles.userAvatarContainer}>
                <Text style={styles.userInitials}>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                </Text>
                <View style={styles.avatarSteam1} />
                <View style={styles.avatarSteam2} />
              </View>
              <View style={styles.userNameSection}>
                <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
                <View style={styles.userRoleContainer}>
                  <Feather
                    name="coffee"
                    size={14}
                    color="#E53935"
                    style={styles.roleIcon}
                  />
                  <Text style={styles.roleText}>
                    {userData.role}
                  </Text>
                </View>
              </View>
              <Feather
                name={showDetails ? "chevron-up" : "chevron-down"}
                size={20}
                color="#E53935"
                style={styles.expandIcon}
              />
            </TouchableOpacity>

            {/* Collapsible details section */}
            {showDetails && (
              <>
                <View style={styles.cardDivider} />

                <View style={styles.userDetailsGrid}>
                  <View style={styles.detailItem}>
                    <Feather name="mail" size={16} color="#E53935" style={styles.detailIcon} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Email</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{userData.email}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Feather name="activity" size={16} color="#E53935" style={styles.detailIcon} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Trạng thái</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusIndicator, { backgroundColor: userData.isActive ? '#4CAF50' : '#F44336' }]} />
                      <Text style={[styles.statusValue, { color: colors.text }]}>
                        {userData.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Feather name="clock" size={16} color="#E53935" style={styles.detailIcon} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Ca làm</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>Ca ngày</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Feather name="award" size={16} color="#E53935" style={styles.detailIcon} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Kinh nghiệm</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>Cao cấp</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.quickActionsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hành động nhanh</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tilesContainer}>
          {actionTiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.tileWrapper}
              onPress={() => router.push(tile.screen as any)}
            >
              <View style={[styles.tile, { backgroundColor: tile.color }]}>
                <View style={styles.tileIconContainer}>
                  <Feather name={tile.icon as any} size={28} color="white" />
                </View>
                <Text style={styles.tileTitle}>{tile.title}</Text>
                {tile.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tile.badge}</Text>
                  </View>
                )}
                <View style={styles.tileSteam1} />
                <View style={styles.tileSteam2} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slogan Section */}
        <View style={styles.recentActivitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Khẩu hiệu hôm nay</Text>
          <TouchableOpacity
            style={[styles.sloganContainer, { backgroundColor: colors.card }]}
            onPress={() => {
              // Chỉ gọi fetchRandomSlogan khi người dùng bấm vào
              fetchRandomSlogan();
            }}
          >
            {sloganLoading ? (
              <ActivityIndicator size="small" color="#E53935" />
            ) : slogan ? (
              <>
                <View style={styles.sloganIconContainer}>
                  <Feather name="message-circle" size={20} color="#E53935" />
                </View>
                <View style={styles.sloganContent}>
                  <View style={styles.sloganTextRow}>
                    {/* <Feather name="message-square" size={16} color="#E53935" style={styles.sloganTextIcon} /> */}
                    <Text style={[styles.sloganText, { color: colors.text }]}>
                      {slogan.content}
                    </Text>
                  </View>
                  <View style={styles.sloganTextRow}>
                    <Feather name="refresh-cw" size={14} color="#888" style={styles.sloganTextIcon} />
                    <Text style={styles.sloganRefreshHint}>Chạm để lấy khẩu hiệu mới !</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.sloganIconContainer}>
                  <Feather name={sloganError ? "alert-circle" : "message-circle"} size={20} color={sloganError ? "#F44336" : "#E53935"} />
                </View>
                <View style={styles.sloganContent}>
                  <View style={styles.sloganTextRow}>
                    <Feather name="search" size={16} color={sloganError ? "#F44336" : "#E53935"} style={styles.sloganTextIcon} />
                    <Text style={[styles.noSloganText, { color: sloganError ? "#F44336" : colors.text }]}>
                      {sloganError ||"Chạm nhẹ, khám phá khẩu hiệu ngày hôm nay!"}
                    </Text>
                  </View>
                  <View style={styles.sloganTextRow}>
                    <Feather
                      name={slogan ? "refresh-cw" : "download"}
                      size={14}
                      color="#888"
                      style={styles.sloganTextIcon}
                    />
                    <Text style={styles.sloganRefreshHint}>
                      {slogan ? "Chạm nhẹ, làm mới khẩu hiệu cực xịn!" : "Chạm nhẹ, làm mới khẩu hiệu cực xịn!"}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>



        {/* Add some bottom padding for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  steamingPotContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  potBase: {
    width: 60,
    height: 30,
    borderRadius: 30,
    backgroundColor: '#E53935',
    position: 'absolute',
    bottom: 0,
  },
  potHandle: {
    width: 10,
    height: 20,
    backgroundColor: '#BF360C',
    position: 'absolute',
    left: 10,
    bottom: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  potHandle2: {
    width: 10,
    height: 20,
    backgroundColor: '#BF360C',
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  steamBubble1: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    bottom: 35,
    left: 25,
    opacity: 0.7,
  },
  steamBubble2: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    bottom: 45,
    right: 20,
    opacity: 0.5,
  },
  steamBubble3: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    bottom: 55,
    left: 35,
    opacity: 0.3,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E53935',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  logoutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
  },
  userInfoCard: {
    borderRadius: 16,
    padding: 0,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(229, 57, 53, 0.05)',
  },
  expandIcon: {
    marginLeft: 'auto',
    padding: 4,
  },
  userAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  avatarSteam1: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    top: -5,
    left: 20,
  },
  avatarSteam2: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    top: -10,
    right: 15,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userNameSection: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleIcon: {
    marginRight: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53935',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 16,
  },
  userDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  detailItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailIcon: {
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tileWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  tile: {
    borderRadius: 16,
    padding: 20,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  tileSteam1: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 10,
    right: 30,
  },
  tileSteam2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 5,
    left: 20,
  },
  tileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tileTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3D00',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentActivitySection: {
    marginBottom: 20,
  },

  bottomPadding: {
    height: 40,
  },
  // Styles cho phần slogan
  sloganContainer: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sloganIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sloganContent: {
    flex: 1,
  },
  sloganTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sloganTextIcon: {
    marginRight: 8,
  },
  sloganText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  sloganRefreshHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  noSloganText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'left',
    flex: 1,
  },
});