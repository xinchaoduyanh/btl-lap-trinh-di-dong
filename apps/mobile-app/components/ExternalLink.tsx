import { openBrowserAsync } from 'expo-web-browser'
import React from 'react'
import { Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & { href: string }

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <TouchableOpacity
      onPress={async () => {
        if (Platform.OS !== 'web') {
          // Open the link in an in-app browser.
          await openBrowserAsync(href)
        } else {
          // On web, open in a new tab
          window.open(href, '_blank')
        }
      }}
      {...rest}
    />
  )
}
