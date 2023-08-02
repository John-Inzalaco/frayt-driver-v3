import {Card, CardProps, useStyleSheet} from '@ui-kitten/components';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import {ReactElement, useState, useEffect} from 'react';
import {Text} from './ui-kitten/Text';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CardCollapsibleProps extends CardProps {
  title: string;
  iconName: string;
  startExpanded: boolean;
  expandHeight?: number;
}

export function CardCollapsible(
  props: CardCollapsibleProps,
): ReactElement<Card> {
  const styles = useStyleSheet(themedStyles);

  const ANIMATION_LENGTH = 250;

  const [bodyExpanded, setBodyExpanded] = useState(props.startExpanded);
  const [opacityRef, setOpacityRef] = useState(() => new Animated.Value(0));

  useEffect(() => {
    setOpacityRef(new Animated.Value(bodyExpanded ? 1 : 0));
  }, [bodyExpanded]);

  return (
    <Card
      {...props}
      status="primary"
      style={props.style}
      header={() => (
        <View style={styles.cardHeaderView}>
          <View style={styles.cardHeaderTextView}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.create(
                    ANIMATION_LENGTH,
                    'easeInEaseOut',
                    'opacity',
                  ),
                );
                setBodyExpanded(!bodyExpanded);
                Animated.timing(opacityRef, {
                  toValue: bodyExpanded ? 0 : 1,
                  duration: ANIMATION_LENGTH,
                  useNativeDriver: true,
                }).start();
              }}
              style={styles.cardExpandButton}>
              <Text>
                <Icon name={bodyExpanded ? 'minus' : 'plus'} size={10} />
              </Text>
            </TouchableOpacity>
            <Text category="h6">{props.title}</Text>
          </View>
          <View style={styles.cardHeaderIcon}>
            <Icon name={props.iconName} size={18} color="white" solid />
          </View>
        </View>
      )}>
      <Animated.View
        style={{
          height: bodyExpanded ? undefined : 0,
          opacity: opacityRef,
        }}>
        {props.children}
      </Animated.View>
    </Card>
  );
}

const themedStyles = StyleSheet.create({
  cardHeaderView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 11,
    marginHorizontal: 15,
  },
  cardExpandButton: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: 'color-primary-500',
  },
  cardHeaderTextView: {
    flexDirection: 'row',
  },
  cardHeaderIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
