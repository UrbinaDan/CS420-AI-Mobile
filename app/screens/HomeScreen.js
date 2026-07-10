import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
export default function HomeScreen({navigation}){return <View style={s.container}><Text style={s.title}>Welcome to STEDI</Text><Text style={s.copy}>Create an account to get started.</Text><Pressable style={s.button} onPress={()=>navigation.navigate('SignUp')}><Text style={s.buttonText}>Sign Up</Text></Pressable></View>}
const s=StyleSheet.create({container:{flex:1,padding:24,justifyContent:'center',backgroundColor:'#f7f8fc'},title:{fontSize:30,fontWeight:'700',color:'#18204a',marginBottom:8},copy:{fontSize:17,color:'#606582',marginBottom:24},button:{backgroundColor:'#4255d4',padding:15,borderRadius:10,alignItems:'center'},buttonText:{color:'#fff',fontSize:17,fontWeight:'700'}});
