import React from 'react';
import {Pressable,StyleSheet,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
export default function Checkbox({checked,onChange,children,testID}){return <Pressable accessibilityRole="checkbox" accessibilityState={{checked}} onPress={()=>onChange(!checked)} style={s.row} testID={testID}><View style={[s.box,checked&&s.checked]}>{checked&&<Ionicons name="checkmark" size={18} color="#fff"/>}</View><View style={s.label}>{children}</View></Pressable>}
const s=StyleSheet.create({row:{flexDirection:'row',alignItems:'flex-start',marginVertical:9},box:{width:24,height:24,borderWidth:2,borderColor:'#4255d4',borderRadius:4,alignItems:'center',justifyContent:'center',marginRight:10},checked:{backgroundColor:'#4255d4'},label:{flex:1}});
