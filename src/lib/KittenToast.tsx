import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Card, Layout, Modal, Text} from '@ui-kitten/components';

export type ToastProps = {
  message: string;
  duration?: number;
};

export const Toast = (props: ToastProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
    }, props.duration);
    return () => clearInterval(id);
  }, [props.duration]);

  return (
    <Layout style={styles.container} level="1">
      <Modal visible={visible}>
        <Card disabled={true}>
          <Text>{props.message}</Text>
          <Button onPress={() => setVisible(false)}>Ok</Button>
        </Card>
      </Modal>
    </Layout>
  );
};

Toast.defaultProps = {
  duration: 3000,
};

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    minWidth: 192,
  },
});
