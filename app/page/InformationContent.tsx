import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../components/themed-text';
import { tokenStorage } from '../storage';
import { ColorContext } from './ColorContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function InformationContent({ userName, setUserName }: { userName: string; setUserName: (v: string) => void }) {
    const navigation = useNavigation<any>();
    const { colors } = React.useContext(ColorContext);

    const [localName, setLocalName] = useState(userName);
    const [email, setEmail] = useState('');

    // 사용자 정보 불러오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = await tokenStorage.getItem();
                if (!token) return;

                const res = await axios.get(`${API_URL}/users/me/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data) {
                    if (res.data.name) {
                        setUserName(res.data.name);
                        setLocalName(res.data.name);
                    }
                    if (res.data.email) setEmail(res.data.email);
                }
            } catch (err) {
                console.error('[InformationContent] fetch error:', err);
            }
        };
        fetchUserInfo();
    }, []);

    const handleSave = () => {
        setUserName(localName);
        Alert.alert('완료', '이름이 변경되었습니다.');
    };

    const handleLogout = async () => {
        // 토큰 삭제 등 로그아웃 처리
        await tokenStorage.removeItem();
        router.replace('/');
    };

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
                        <ThemedText style={styles.pageTitle}>계정 정보</ThemedText>
                        <View style={styles.divider} />

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>이메일</ThemedText>
                            <View style={styles.readOnlyBox}>
                                <Text style={styles.readOnlyText}>{email || '이메일 정보 없음'}</Text>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>이름</ThemedText>
                            <TextInput
                                style={styles.input}
                                value={localName}
                                onChangeText={setLocalName}
                                placeholder="이름을 입력하세요"
                            />
                        </View>

                        <Pressable style={styles.saveButton} onPress={handleSave}>
                            <ThemedText style={styles.saveButtonText}>저장하기</ThemedText>
                        </Pressable>

                        <Pressable style={styles.logoutButton} onPress={handleLogout}>
                            <ThemedText style={styles.logoutButtonText}>로그아웃</ThemedText>
                        </Pressable>
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
    formGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 8, fontFamily: 'Cafe24Ssurround' },
    readOnlyBox: { padding: 14, backgroundColor: '#f0f0f0', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
    readOnlyText: { color: '#666', fontSize: 16 },
    input: { padding: 14, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
    saveButton: { backgroundColor: '#1f7aeb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Cafe24Ssurround' },
    logoutButton: { backgroundColor: '#ff4d4f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
    logoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'Cafe24Ssurround' },
});