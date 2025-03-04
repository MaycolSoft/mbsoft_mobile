import React, { forwardRef } from 'react';
import { Input as GInput, InputField, Box, Text, styled } from '@gluestack-ui/themed';
import { Feather, FontAwesome, FontAwesome5, Fontisto, MaterialIcons, MaterialCommunityIcons, Ionicons, EvilIcons } from '@expo/vector-icons'; // Librería de íconos

type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconsName = keyof typeof MaterialCommunityIcons.glyphMap;
type IoniconsName = keyof typeof Ionicons.glyphMap;
type EvilIconsName = keyof typeof EvilIcons.glyphMap;
type FontAwesomeName = keyof typeof FontAwesome.glyphMap;
type FontAwesome5Name = keyof typeof FontAwesome5.glyphMap;
type FontistoName = keyof typeof Fontisto.glyphMap;

import type { ComponentProps } from 'react';



interface CustomInputProps extends ComponentProps<typeof GInput> {
  label?: string;
  error?: string;
  iconName?: MaterialIconsName | MaterialCommunityIconsName | IoniconsName | EvilIconsName | FontAwesomeName | FontAwesome5Name | FontistoName;
  iconPosition?: 'left' | 'right';
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad' | 'numeric' | 'decimal-pad'
  [key:string]: any;
}


const CustomInput = forwardRef<any, CustomInputProps>((props, ref) => {
  const { label, error, iconName, iconPosition = 'left', ...rest } = props;

  const getIconComponent = (name: string, size: number, color: string, style?: any) => {
      if (name in Feather.glyphMap) {
          return <Feather name={name as keyof typeof Feather.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in MaterialIcons.glyphMap) {
          return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in MaterialCommunityIcons.glyphMap) {
          return <MaterialCommunityIcons name={name as keyof typeof MaterialCommunityIcons.glyphMap} size={size} color={color} style={style} />;
      }

      if (name in Ionicons.glyphMap) {
          return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in EvilIcons.glyphMap) {
          return <EvilIcons name={name as keyof typeof EvilIcons.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in FontAwesome.glyphMap) {
          return <FontAwesome name={name as keyof typeof FontAwesome.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in FontAwesome5.glyphMap) {
          return <FontAwesome5 name={name as keyof typeof FontAwesome5.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in Fontisto.glyphMap) {
          return <Fontisto name={name as keyof typeof Fontisto.glyphMap} size={size} color={color} style={style} />;
      }
      if (name in MaterialIcons.glyphMap) {
          return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color} style={style} />;
      }


      return <MaterialIcons name="error" size={size} color={color} style={style} />;
  };

  return (
    <Box width="$full" mb="$4">
      {label && <Text mb="$2" fontSize="$sm">{label}</Text>}
      
      <Box flexDirection="row" alignItems="center" bg="$backgroundLight50" 
            borderRadius="$md" borderWidth="$1" borderColor={error ? "$error500" : "$borderLight300"}
            px="$3" py="$2">
        {iconName && iconPosition === 'left' && (
          // <Feather name={iconName} size={20} color="$textDark400" style={{ marginRight: 8 }} />
          getIconComponent(iconName, 20, "$textDark400", { marginRight: 8 })
        )}

        <GInput variant="underlined" borderWidth="$0" flex={1}>
          <InputField
            ref={ref}
            placeholderTextColor="$textLight400"
            selectionColor="$primary500"
            {...props}
          />
        </GInput>
        
        {iconName && iconPosition === 'right' && (
          // <Feather name={iconName} size={20} color="$textDark400" style={{ marginLeft: 8 }} />
          getIconComponent(iconName, 20, "$textDark400", { marginRight: 8 })
        )}
      </Box>
      
      {error && <Text color="$error500" fontSize="$xs" mt="$1">{error}</Text>}
    </Box>
  );

}) as React.ForwardRefExoticComponent<CustomInputProps & React.RefAttributes<any>>;

export default CustomInput;