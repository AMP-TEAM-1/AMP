// Notification Service for scheduling local notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions from the user
 * Returns true if permission is granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    // Web doesn't support notifications
    if (Platform.OS === 'web') {

        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {

            return false;
        }

        // For Android, create a notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('todo-alarms', {
                name: '할일 알림',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Schedule a notification for a todo item
 * @param todoId - The ID of the todo item
 * @param title - The title of the todo
 * @param alarmTime - Time in "HH:MM" format
 * @param todoDate - The date of the todo (YYYY-MM-DD format)
 * @param repeatType - Optional repeat type: 'daily' or 'weekly'
 * @returns notification ID if successful, null otherwise
 */
export async function scheduleNotification(
    todoId: number,
    title: string,
    alarmTime: string, // "HH:MM" format
    todoDate: string, // "YYYY-MM-DD" format
    repeatType?: string // 'daily' | 'weekly' | null
): Promise<string | null> {
    // Web doesn't support notifications
    if (Platform.OS === 'web') {

        return null;
    }

    try {
        // Parse alarm time
        const [hours, minutes] = alarmTime.split(':').map(Number);

        // Parse todo date
        const [year, month, day] = todoDate.split('-').map(Number);

        // Create trigger date
        const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);

        // Don't schedule if the time has already passed and it's not repeating
        if (triggerDate < new Date() && !repeatType) {

            return null;
        }

        // Cancel any existing notification for this todo
        await cancelNotification(todoId);

        let notificationId: string;

        // Handle repeat notifications
        if (repeatType === 'daily') {
            // Daily repeat
            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '할일 알림 🔔 (매일)',
                    body: title,
                    data: { todoId },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: hours,
                    minute: minutes,
                    channelId: Platform.OS === 'android' ? 'todo-alarms' : undefined,
                },
                identifier: `todo-${todoId}`,
            });
        } else if (repeatType === 'weekly') {
            // Weekly repeat
            const weekday = triggerDate.getDay() + 1; // Sunday = 1, Monday = 2, etc.
            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '할일 알림 🔔 (매주)',
                    body: title,
                    data: { todoId },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday: weekday,
                    hour: hours,
                    minute: minutes,
                    channelId: Platform.OS === 'android' ? 'todo-alarms' : undefined,
                },
                identifier: `todo-${todoId}`,
            });
        } else {
            // One-time notification
            const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);

            if (secondsUntilTrigger <= 0) {

                return null;
            }

            notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '할일 알림 🔔',
                    body: title,
                    data: { todoId },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    channelId: Platform.OS === 'android' ? 'todo-alarms' : undefined,
                    seconds: secondsUntilTrigger,
                    repeats: false,
                },
                identifier: `todo-${todoId}`,
            });
        }


        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Cancel a scheduled notification for a todo item
 * @param todoId - The ID of the todo item
 */
export async function cancelNotification(todoId: number): Promise<void> {
    // Web doesn't support notifications
    if (Platform.OS === 'web') {
        return;
    }

    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        const todoNotification = notifications.find(
            (notif) => notif.identifier === `todo-${todoId}`
        );

        if (todoNotification) {
            await Notifications.cancelScheduledNotificationAsync(todoNotification.identifier);

        }
    } catch (error) {
        console.error('Error cancelling notification:', error);
    }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
    // Web doesn't support notifications
    if (Platform.OS === 'web') {
        return [];
    }

    try {
        return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return [];
    }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    // Web doesn't support notifications
    if (Platform.OS === 'web') {
        return;
    }

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();

    } catch (error) {
        console.error('Error cancelling all notifications:', error);
    }
}
