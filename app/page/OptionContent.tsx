import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../components/themed-text';
import { ColorContext } from './ColorContext';

export default function OptionContent() {
    const { colors, setColors } = React.useContext(ColorContext);
    const navigation = useNavigation<any>();

    const gradients = [
        ['#FFF8F0', '#FFF0E0'],
        ['#FFF0F5', '#FFD1DC'],
        ['#FFFAF0', '#FFF8DC'],
        ['#F1F8E9', '#DCEDC8'],
        ['#F0F8FF', '#E0F7FA'],
        ['#F8F9FA', '#E9ECEF'],
    ];

    return (
        <LinearGradient
            colors={colors as [string, string, ...string[]]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Pressable onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
                            <Ionicons name="menu" size={30} color="#000" />
                        </Pressable>
                        <ThemedText style={styles.headerTitle}>설정</ThemedText>
                        <View style={{ width: 30 }} />
                    </View>

                    <View style={styles.content}>
                        <ThemedText style={styles.pageTitle}>배경 색상 선택</ThemedText>
                        <View style={styles.divider} />

                        <View style={styles.gridContainer}>
                            {gradients.map((grad, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => setColors(grad)}
                                    style={styles.colorCard}
                                >
                                    <LinearGradient
                                        colors={grad as [string, string, ...string[]]}
                                        style={styles.previewGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <ThemedText style={styles.colorLabel}>
                                            Color {idx + 1}
                                        </ThemedText>
                                    </LinearGradient>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    menuButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'Cafe24Ssurround' },
    content: { flex: 1, paddingHorizontal: 10 },
    pageTitle: { fontSize: 24, fontWeight: '600', marginBottom: 10, fontFamily: 'Cafe24Ssurround' },
    divider: { height: 2, backgroundColor: '#000', marginBottom: 24 },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    colorCard: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    previewGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
});