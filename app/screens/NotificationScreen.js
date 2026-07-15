@'
import {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity, Platform, Alert} from 'react-native';
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import {useThemeStyles} from '../components/Styles';
import {useLoginContext} from '../components/LoginContext';

if (Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export const sendPushNotification = async (expoPushToken, username) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'STEDI Data Shared',
        body: `${username} has shared STEDI data with you.`,
        data: {username},
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
};

export const getPushToken = async (username, sessionToken) => {
    const response = await fetch(`https://dev.stedi.me/pushtokentestonly/${username}`, {
        method: 'GET',
        headers: {
            'suresteps.session.token': sessionToken,
        },
    });

    if (!response) {
        return null;
    }

    let data = null;

    if (typeof response.json === 'function') {
        data = await response.json();
    } else if (typeof response.text === 'function') {
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch {
            return text || null;
        }
    }

    if (!data) {
        return null;
    }

    if (typeof data === 'string') {
        return data;
    }

    return data.expoPushToken || data.pushToken || data.token || null;
};

export const savePushTokenToAPI = async (userName, sessionToken, pushToken) => {
    const existingPushToken = await getPushToken(userName, sessionToken);

    if (existingPushToken !== pushToken) {
        await fetch(`https://dev.stedi.me/user/${userName}`, {
            method: 'PATCH',
            headers: {
                'suresteps.session.token': sessionToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expoPushToken: pushToken,
            }),
        });
    }
};

const handleRegistrationError = (errorMessage) => {
    if (Platform.OS === 'web') {
        console.warn(errorMessage);
    } else {
        Alert.alert('Push notification error', errorMessage);
    }
};

const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance?.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        handleRegistrationError('Must use a physical device for push notifications');
        return null;
    }

    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification');
        return null;
    }

    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

    const pushToken = await Notifications.getExpoPushTokenAsync(
        projectId ? {projectId} : undefined
    );

    return pushToken.data;
};

export default function NotificationScreen() {
    const [notification, setNotification] = useState(null);
    const [sending, setSending] = useState(false);
    const styles = useThemeStyles();
    const {userName, sessionToken} = useLoginContext();

    useEffect(() => {
        let notificationListener;
        let responseListener;

        registerForPushNotificationsAsync()
            .then((pushToken) => {
                if (pushToken && userName && sessionToken) {
                    return savePushTokenToAPI(userName, sessionToken, pushToken);
                }
            })
            .catch((error) => {
                console.warn(error);
            });

        if (Notifications.addNotificationReceivedListener) {
            notificationListener = Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
            });
        }

        if (Notifications.addNotificationResponseReceivedListener) {
            responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
                console.log(response);
            });
        }

        return () => {
            if (notificationListener && Notifications.removeNotificationSubscription) {
                Notifications.removeNotificationSubscription(notificationListener);
            }

            if (responseListener && Notifications.removeNotificationSubscription) {
                Notifications.removeNotificationSubscription(responseListener);
            }
        };
    }, [userName, sessionToken]);

    const sendDataToPhysician = async () => {
        try {
            setSending(true);

            const physicianUsername = 'physician';
            const physicianPushToken = await getPushToken(physicianUsername, sessionToken);

            if (physicianPushToken) {
                await sendPushNotification(physicianPushToken, userName);
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={[styles.container, {justifyContent: 'space-between'}]}>
            <View>
                <Text style={styles.title}>Share Your Data with a Physician</Text>
                <Text style={styles.text}>
                    Before you can receive a personalized health assessment, please share your STEDI data with your
                    physician. This allows them to review your results, monitor key health indicators, and provide
                    expert recommendations tailored to your needs.
                </Text>
                {notification !== null &&
                    <View style={[styles.textInput, {marginTop: 30, padding: 20}]}>
                        <Text style={[styles.largeText, {marginBottom: 10}]}>{notification.request.content.title}</Text>
                        <Text style={styles.text}>{notification.request.content.body}</Text>
                        <Text style={styles.text}>Last updated at: {new Date(notification.date).toLocaleString()}</Text>
                    </View>
                }
            </View>
            <TouchableOpacity onPress={sendDataToPhysician} style={styles.button} disabled={sending}>
                <Text style={styles.buttonText}>{sending ? 'Sending...' : 'Send Data to a Physician'}</Text>
            </TouchableOpacity>
        </View>
    );
}
'@ | Set-Content -Path "app/screens/NotificationScreen.js" -Encoding UTF8