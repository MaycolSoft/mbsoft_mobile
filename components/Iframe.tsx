import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

interface IframeProps {
  route?:{params?:{openInWebView?:boolean}};
  url?: string;
}

// export default function Iframe({ url = 'https://backend.mbsoft.freeddns.org/telescope' }: IframeProps) {


export default function Iframe ({ route, url = 'https://backend.mbsoft.freeddns.org/telescope' }: IframeProps) {
  
  const openWebPage = async () => {
    await WebBrowser.openBrowserAsync(url);
  };

  if(route?.params?.openInWebView === false){
    openWebPage();
    return null
  }


  // Credenciales para la autenticación básica
  const username = 'develop';
  const password = 'qweqwe123';


  return (
    <View style={styles.container}>
      <WebView 
        source={{
          uri: url,
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`, // Encabezado de autenticación básica
          },
        }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP error: ', nativeEvent.statusCode);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  }
});
