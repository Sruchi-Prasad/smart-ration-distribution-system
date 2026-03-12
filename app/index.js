import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";

const index=()=>{
    return(
        <View>
          <Redirect  href="/(tabs)"/>
        </View>
    )
}

export default index

const styles=StyleSheet.create({})
