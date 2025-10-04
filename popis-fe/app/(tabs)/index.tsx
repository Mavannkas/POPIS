import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor="#A1CEDC"
			headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}>
			<View style={styles.titleContainer}>
				<Text style={styles.title} className="bg-red-600">
					Welcome!
				</Text>
				<HelloWave />
			</View>
			<View style={styles.stepContainer}>
				<Text style={styles.subtitle}>Step 1: Try it</Text>
				<Text>
					Edit <Text style={styles.semiBold}>app/(tabs)/index.tsx</Text> to see changes. Press{' '}
					<Text className="text-xl font-bold text-blue-500">Welcome to Nativewind!</Text>
					<Text style={styles.semiBold}>
						{Platform.select({
							ios: 'cmd + d',
							android: 'cmd + m',
							web: 'F12',
						})}
					</Text>{' '}
					to open developer tools.
				</Text>
			</View>
			<View style={styles.stepContainer}>
				<Link href="/modal">
					<Link.Trigger>
						<Text style={styles.subtitle}>Step 2: Explore</Text>
					</Link.Trigger>
					<Link.Preview />
					<Link.Menu>
						<Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
						<Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => alert('Share pressed')} />
						<Link.Menu title="More" icon="ellipsis">
							<Link.MenuAction title="Delete" icon="trash" destructive onPress={() => alert('Delete pressed')} />
						</Link.Menu>
					</Link.Menu>
				</Link>

				<Text>{`Tap the Explore tab to learn more about what's included in this starter app.`}</Text>
			</View>
			<View style={styles.stepContainer}>
				<Text style={styles.subtitle}>Step 3: Get a fresh start</Text>
				<Text>
					{`When you're ready, run `}
					<Text style={styles.semiBold}>npm run reset-project</Text> to get a fresh{' '}
					<Text style={styles.semiBold}>app</Text> directory. This will move the current{' '}
					<Text style={styles.semiBold}>app</Text> to{' '}
					<Text style={styles.semiBold}>app-example</Text>.
				</Text>
			</View>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		lineHeight: 32,
	},
	subtitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	semiBold: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '600',
	},
});
