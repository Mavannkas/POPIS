import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor="#D0D0D0"
			headerImage={
				<IconSymbol
					size={310}
					color="#808080"
					name="chevron.left.forwardslash.chevron.right"
					style={styles.headerImage}
				/>
			}>
			<View style={styles.titleContainer}>
				<Text
					style={[styles.title, { fontFamily: Fonts.rounded }]}>
					Explore
				</Text>
			</View>
			<Text>This app includes example code to help you get started.</Text>
			<Collapsible title="File-based routing">
				<Text>
					This app has two screens: <Text style={styles.semiBold}>app/(tabs)/index.tsx</Text> and{' '}
					<Text style={styles.semiBold}>app/(tabs)/explore.tsx</Text>
				</Text>
				<Text>
					The layout file in <Text style={styles.semiBold}>app/(tabs)/_layout.tsx</Text> sets up the tab
					navigator.
				</Text>
				<ExternalLink href="https://docs.expo.dev/router/introduction">
					<Text style={styles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title="Android, iOS, and web support">
				<Text>
					You can open this project on Android, iOS, and the web. To open the web version, press{' '}
					<Text style={styles.semiBold}>w</Text> in the terminal running this project.
				</Text>
			</Collapsible>
			<Collapsible title="Images">
				<Text>
					For static images, you can use the <Text style={styles.semiBold}>@2x</Text> and{' '}
					<Text style={styles.semiBold}>@3x</Text> suffixes to provide files for different screen densities
				</Text>
				<Image
					source={require('@/assets/images/react-logo.png')}
					style={{ width: 100, height: 100, alignSelf: 'center' }}
				/>
				<ExternalLink href="https://reactnative.dev/docs/images">
					<Text style={styles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title="Light and dark mode components">
				<Text>
					This template has light and dark mode support. The{' '}
					<Text style={styles.semiBold}>useColorScheme()</Text> hook lets you inspect what the user&apos;s
					current color scheme is, and so you can adjust UI colors accordingly.
				</Text>
				<ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
					<Text style={styles.link}>Learn more</Text>
				</ExternalLink>
			</Collapsible>
			<Collapsible title="Animations">
				<Text>
					This template includes an example of an animated component. The{' '}
					<Text style={styles.semiBold}>components/HelloWave.tsx</Text> component uses the powerful{' '}
					<Text style={[styles.semiBold, { fontFamily: Fonts.mono }]}>
						react-native-reanimated
					</Text>{' '}
					library to create a waving hand animation.
				</Text>
				{Platform.select({
					ios: (
						<Text>
							The <Text style={styles.semiBold}>components/ParallaxScrollView.tsx</Text> component provides a
							parallax effect for the header image.
						</Text>
					),
				})}
			</Collapsible>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	headerImage: {
		color: '#808080',
		bottom: -90,
		left: -35,
		position: 'absolute',
	},
	titleContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		lineHeight: 32,
	},
	semiBold: {
		fontSize: 16,
		lineHeight: 24,
		fontWeight: '600',
	},
	link: {
		lineHeight: 30,
		fontSize: 16,
		color: '#0a7ea4',
	},
});
