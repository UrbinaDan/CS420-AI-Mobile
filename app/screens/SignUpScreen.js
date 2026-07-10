import React,{useState} from 'react';
import {Alert,KeyboardAvoidingView,Linking,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Dropdown} from 'react-native-element-dropdown';
import Checkbox from '../components/Checkbox';
import {CountryCodesList} from '../components/CountryCodes';
const API_URL='https://dev.stedi.me/user';
export default function SignUpScreen({navigation}){
 const [email,setEmail]=useState(''),[birthDate,setBirthDate]=useState(''),[phone,setPhone]=useState(''),[region,setRegion]=useState('US'),[password,setPassword]=useState(''),[verifyPassword,setVerifyPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false),[showVerifyPassword,setShowVerifyPassword]=useState(false),[smsConsent,setSmsConsent]=useState(false),[termsConsent,setTermsConsent]=useState(false),[submitting,setSubmitting]=useState(false);
 const handleSignUp=async()=>{
  if(![email,birthDate,phone,region,password,verifyPassword].every(v=>v.trim())){Alert.alert('Missing information','Please complete all fields.');return}
  if(!smsConsent||!termsConsent){Alert.alert('Agreement required','Please agree to all terms and conditions.');return}
  if(password!==verifyPassword){Alert.alert('Passwords do not match','Please enter matching passwords.');return}
  const agreedAt=new Date().toISOString();
  const payload={userName:email,email,phone,region,birthDate,password,verifyPassword,agreedToTermsOfUseDate:agreedAt,agreedToCookiePolicyDate:agreedAt,agreedToPrivacyPolicyDate:agreedAt,agreedToTextMessageDate:agreedAt};
  try{setSubmitting(true);const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error('Request failed');navigation.navigate('Home')}
  catch(error){Alert.alert('Sign up failed','We could not create your account. Please try again.')}
  finally{setSubmitting(false)}
 };
 const PasswordField=({value,onChangeText,visible,onToggle,placeholder,testID})=><View style={s.passwordRow}><TextInput style={s.passwordInput} placeholder={placeholder} value={value} onChangeText={onChangeText} secureTextEntry={!visible} autoCapitalize="none" testID={testID}/><Pressable onPress={onToggle} accessibilityLabel={visible?`Hide ${placeholder}`:`Show ${placeholder}`} testID={`${testID}-visibility-toggle`}><Ionicons name={visible?'eye-outline':'eye-off-outline'} size={25} color="#596080"/></Pressable></View>;
 return <KeyboardAvoidingView style={s.flex} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
  <Text style={s.heading}>Create your account</Text>
  <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="email-input"/>
  <TextInput style={s.input} placeholder="Birth Date (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} testID="birth-date-input"/>
  <TextInput style={s.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="phone-input"/>
  <Dropdown style={s.dropdown} data={CountryCodesList} search searchPlaceholder="Search country" labelField="name" valueField="value" value={region} onChange={item=>setRegion(item.value)} renderSelectedItem={item=><Text style={s.dropdownText}>{item.flag} {item.name} {item.code}</Text>} renderItem={item=><Text style={s.dropdownItem}>{item.flag} {item.name} {item.code}</Text>} placeholder="Select country" testID="country-code-dropdown"/>
  <PasswordField value={password} onChangeText={setPassword} visible={showPassword} onToggle={()=>setShowPassword(v=>!v)} placeholder="Password" testID="password-input"/>
  <PasswordField value={verifyPassword} onChangeText={setVerifyPassword} visible={showVerifyPassword} onToggle={()=>setShowVerifyPassword(v=>!v)} placeholder="Confirm Password" testID="confirm-password-input"/>
  <Checkbox checked={smsConsent} onChange={setSmsConsent} testID="sms-consent-checkbox"><Text style={s.checkboxText}>I consent to receive messages via SMS. (Message and data rates may apply. Reply STOP to opt out.)</Text></Checkbox>
  <Checkbox checked={termsConsent} onChange={setTermsConsent} testID="terms-checkbox"><Text style={s.checkboxText}>I confirm that I have read and agree to STEDI’s </Text><Text style={s.link} onPress={()=>Linking.openURL('https://dev.stedi.me/privacy-policy.html')}>Privacy Policy</Text><Text style={s.checkboxText}>, </Text><Text style={s.link} onPress={()=>Linking.openURL('https://dev.stedi.me/terms-of-use.html')}>Terms of Use</Text><Text style={s.checkboxText}>, and </Text><Text style={s.link} onPress={()=>Linking.openURL('https://dev.stedi.me/cookie-policy.html')}>Cookie Policy</Text><Text style={s.checkboxText}>.</Text></Checkbox>
  <Pressable style={[s.button,submitting&&s.disabled]} onPress={handleSignUp} disabled={submitting} testID="sign-up-button"><Text style={s.buttonText}>{submitting?'Creating Account…':'Sign Up'}</Text></Pressable>
 </ScrollView></KeyboardAvoidingView>
}
const s=StyleSheet.create({flex:{flex:1},container:{padding:22,paddingBottom:40,backgroundColor:'#f7f8fc'},heading:{fontSize:27,fontWeight:'700',color:'#18204a',marginBottom:20},input:{backgroundColor:'#fff',borderColor:'#cdd1e1',borderWidth:1,borderRadius:9,paddingHorizontal:14,height:52,fontSize:16,marginBottom:13},dropdown:{backgroundColor:'#fff',borderColor:'#cdd1e1',borderWidth:1,borderRadius:9,paddingHorizontal:14,height:52,marginBottom:13},dropdownText:{fontSize:16,color:'#222'},dropdownItem:{fontSize:16,padding:15},passwordRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',borderColor:'#cdd1e1',borderWidth:1,borderRadius:9,paddingRight:14,height:52,marginBottom:13},passwordInput:{flex:1,height:'100%',paddingHorizontal:14,fontSize:16},checkboxText:{color:'#34384d',fontSize:14,lineHeight:20},link:{color:'#334ad1',fontSize:14,lineHeight:20,textDecorationLine:'underline'},button:{backgroundColor:'#4255d4',padding:16,borderRadius:10,alignItems:'center',marginTop:15},disabled:{opacity:.6},buttonText:{color:'#fff',fontSize:17,fontWeight:'700'}});
